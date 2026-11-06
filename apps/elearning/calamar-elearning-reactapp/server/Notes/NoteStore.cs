using System.Net;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace Calamar.ELearning.Notes;

public enum NoteKind { Item, Section }

public sealed record ChildNote(int Index, string Title, DateTime CreatedAt, DateTime? UpdatedAt)
{
    public bool IsSection => !FolderPairs.NoteItems.Contains(Index);
}

public sealed record NoteMeta(string Title, DateTime CreatedAt, DateTime UpdatedAt);

public sealed record NoteFile(string Name, long Size, DateTime UpdatedAt);

/// <summary>
/// The notes strategy (ayran csdrive-webhost-v2, docs/strategies/notes-strategy.md) over a notebook root folder.
/// Notes are addressed by the path of their short folder relative to the notebook root, e.g. <c>999/998/399/999</c>.
/// Course chapters are ternary note sections (399→301), course pages are note items (999→401).
/// Callers serialise writes through <see cref="Lock"/>.
/// </summary>
public sealed partial class NoteStore
{
    public const string NotebookFile = "[note-book].json";
    public const string NoteFile = "[note].json";
    public const string ChildrenFile = "[note-children].json";
    public const string MarkdownPrefix = "0-";
    public const string MarkdownSuffix = "[note].md";

    static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };
    static readonly UTF8Encoding Utf8 = new(false);

    public string Root { get; }
    public SemaphoreSlim Lock { get; } = new(1, 1);

    public NoteStore(string root) => Root = Path.GetFullPath(root);

    // ---------------------------------------------------------------- paths

    [GeneratedRegex(@"^\d{3}$")]
    private static partial Regex Segment();

    public static string[] Segments(string relPath) =>
        string.IsNullOrEmpty(relPath) ? [] : relPath.Split('/', StringSplitOptions.RemoveEmptyEntries);

    public static string Join(string a, string b) => string.IsNullOrEmpty(a) ? b : string.IsNullOrEmpty(b) ? a : a + "/" + b;

    public static string ParentOf(string relPath)
    {
        var i = relPath.LastIndexOf('/');
        return i < 0 ? "" : relPath[..i];
    }

    public static int IndexOf(string relPath) => int.Parse(Segments(relPath)[^1]);

    public static bool IsValidPath(string relPath) => Segments(relPath).All(s => Segment().IsMatch(s));

    /// <summary>The short folder of a note (the root for the empty path); only three digit segments are accepted.</summary>
    public string Dir(string relPath)
    {
        if (!IsValidPath(relPath)) throw new ArgumentException($"Not a note path: {relPath}");
        return Segments(relPath).Aggregate(Root, Path.Combine);
    }

    public bool Exists(string relPath) => Directory.Exists(Dir(relPath)) && (relPath == "" || File.Exists(Path.Combine(Dir(relPath), NoteFile)));

    static Numbering NumberingOf(int index) =>
        FolderPairs.NoteNumberings.FirstOrDefault(n => n.Contains(index)) ?? new Numbering(index, index, 3);

    // ---------------------------------------------------------------- notebook

    public void EnsureNotebook(string title)
    {
        Directory.CreateDirectory(Root);
        var book = Path.Combine(Root, NotebookFile);
        if (!File.Exists(book))
        {
            WriteJson(book, new JsonObject
            {
                ["Title"] = title,
                ["CreatedAt"] = Stamp(DateTime.UtcNow),
                ["NoteBookGuid"] = Guid.NewGuid().ToString(),
            });
        }
        if (!File.Exists(Path.Combine(Root, ChildrenFile))) WriteChildren(Root, Children(""));
    }

    // ---------------------------------------------------------------- reading

    public NoteMeta ReadMeta(string relPath)
    {
        var node = ReadJson(Path.Combine(Dir(relPath), NoteFile)) ?? throw new FileNotFoundException($"No note at {relPath}");
        var created = ParseStamp(node["CreatedAt"]) ?? DateTime.UtcNow;
        return new NoteMeta(node["Title"]?.GetValue<string>() ?? "", created, ParseStamp(node["UpdatedAt"]) ?? created);
    }

    /// <summary>The children of a note, from [note-children].json, rebuilt from the children's [note].json when missing or damaged. Ordered by index, descending.</summary>
    public List<ChildNote> Children(string relPath)
    {
        var dir = Dir(relPath);
        var list = new List<ChildNote>();
        var node = ReadJson(Path.Combine(dir, ChildrenFile));
        if (node?["ChildNotes"] is JsonObject childNotes)
        {
            foreach (var (key, value) in childNotes)
            {
                if (!int.TryParse(key, out var index) || value is null) continue;
                if (!Directory.Exists(Path.Combine(dir, key))) continue; // a child deleted on disk
                list.Add(new ChildNote(index, value["Title"]?.GetValue<string>() ?? key,
                    ParseStamp(value["CreatedAt"]) ?? DateTime.UtcNow, ParseStamp(value["UpdatedAt"])));
            }
            // a child created on disk but not listed
            foreach (var extra in RebuildChildren(dir).Where(c => list.All(l => l.Index != c.Index))) list.Add(extra);
        }
        else list = RebuildChildren(dir);
        return list.OrderByDescending(c => c.Index).ToList();
    }

    static List<ChildNote> RebuildChildren(string dir)
    {
        var list = new List<ChildNote>();
        if (!Directory.Exists(dir)) return list;
        foreach (var sub in Directory.EnumerateDirectories(dir))
        {
            var name = Path.GetFileName(sub);
            if (!Segment().IsMatch(name)) continue;
            var node = ReadJson(Path.Combine(sub, NoteFile));
            if (node?["Title"] is null) continue;
            var created = ParseStamp(node["CreatedAt"]) ?? DateTime.UtcNow;
            list.Add(new ChildNote(int.Parse(name), node["Title"]!.GetValue<string>(), created, ParseStamp(node["UpdatedAt"])));
        }
        return list;
    }

    /// <summary>The markdown file of a note: its expected name, or any <c>0-…[note].md</c> in its short folder.</summary>
    string? MarkdownPath(string dir, string? title = null)
    {
        if (title != null)
        {
            var expected = Path.Combine(dir, MarkdownName(title));
            if (File.Exists(expected)) return expected;
        }
        return Directory.Exists(dir)
            ? Directory.EnumerateFiles(dir, MarkdownPrefix + "*").FirstOrDefault(f => f.EndsWith(MarkdownSuffix, StringComparison.Ordinal))
            : null;
    }

    public static string MarkdownName(string title) => MarkdownPrefix + FolderPairs.NamePartFromTitle(title) + MarkdownSuffix;

    /// <summary>The markdown of a note without its first-line title heading.</summary>
    public string ReadBody(string relPath)
    {
        var dir = Dir(relPath);
        var md = MarkdownPath(dir, ReadMeta(relPath).Title);
        if (md is null) return "";
        var text = File.ReadAllText(md).Replace("\r\n", "\n");
        var (_, body) = SplitHeading(text);
        return body;
    }

    /// <summary>The title in the markdown's first heading, if it has one.</summary>
    public string? ReadHeadingTitle(string relPath)
    {
        var md = MarkdownPath(Dir(relPath), ReadMeta(relPath).Title);
        if (md is null) return null;
        return SplitHeading(File.ReadAllText(md).Replace("\r\n", "\n")).heading;
    }

    static (string? heading, string body) SplitHeading(string text)
    {
        var nl = text.IndexOf('\n');
        var first = nl < 0 ? text : text[..nl];
        if (!first.StartsWith("# ")) return (null, text);
        var rest = nl < 0 ? "" : text[(nl + 1)..];
        return (DecodeHeading(first[2..].Trim()), rest.TrimStart('\n'));
    }

    // ---------------------------------------------------------------- writing

    /// <summary>Creates a child note: short folder, marker folder with .keep, [note].json, markdown, [note-children].json, then its entry in the parent's list.</summary>
    public int CreateNote(string parentPath, string title, NoteKind kind, string body = "")
    {
        title = CleanTitle(title);
        var parent = Dir(parentPath);
        if (parentPath != "" && !File.Exists(Path.Combine(parent, NoteFile))) throw new FileNotFoundException($"No note at {parentPath}");
        var numbering = kind == NoteKind.Item ? FolderPairs.NoteItems : FolderPairs.TernarySections;
        var siblings = Children(parentPath);
        var index = numbering.NextIndex(parent);
        var shortDir = Path.Combine(parent, numbering.ShortName(index));
        Directory.CreateDirectory(shortDir);
        FolderPairs.WriteKeep(Path.Combine(parent, numbering.FullName(index, FolderPairs.NamePartFromTitle(title))));
        var now = DateTime.UtcNow;
        WriteJson(Path.Combine(shortDir, NoteFile), new JsonObject
        {
            ["Title"] = title,
            ["CreatedAt"] = Stamp(now),
            ["UpdatedAt"] = Stamp(now),
        });
        WriteMarkdown(shortDir, title, body);
        WriteChildren(shortDir, []);
        siblings.Add(new ChildNote(index, title, now, null));
        WriteChildren(parent, siblings);
        return index;
    }

    public void WriteBody(string relPath, string body)
    {
        var dir = Dir(relPath);
        var meta = ReadMeta(relPath);
        var old = MarkdownPath(dir, meta.Title);
        var target = Path.Combine(dir, MarkdownName(meta.Title));
        if (old != null && old != target) File.Delete(old);
        WriteMarkdown(dir, meta.Title, body);
        Touch(relPath, meta.Title);
    }

    /// <summary>Renames a note: marker folder, markdown file and its heading, [note].json and the parent's list.</summary>
    public void Rename(string relPath, string newTitle)
    {
        newTitle = CleanTitle(newTitle);
        if (relPath == "") throw new ArgumentException("The notebook root has no title here.");
        var dir = Dir(relPath);
        var parent = Dir(ParentOf(relPath));
        var index = IndexOf(relPath);
        var numbering = NumberingOf(index);
        var meta = ReadMeta(relPath);
        var body = ReadBody(relPath);

        var full = numbering.FindFull(parent, index);
        var newFull = numbering.FullName(index, FolderPairs.NamePartFromTitle(newTitle));
        if (full is null) FolderPairs.WriteKeep(Path.Combine(parent, newFull));
        else if (full != newFull) FolderPairs.MoveDirectory(Path.Combine(parent, full), Path.Combine(parent, newFull));

        var oldMd = MarkdownPath(dir, meta.Title);
        var newMd = Path.Combine(dir, MarkdownName(newTitle));
        if (oldMd != null) FolderPairs.MoveFile(oldMd, newMd);
        WriteMarkdown(dir, newTitle, body);
        Touch(relPath, newTitle);
    }

    /// <summary>When the markdown's heading was edited outside the app, the names follow it.</summary>
    public bool SyncTitleFromHeading(string relPath)
    {
        if (relPath == "") return false;
        var heading = ReadHeadingTitle(relPath);
        if (string.IsNullOrWhiteSpace(heading) || heading == ReadMeta(relPath).Title) return false;
        Rename(relPath, heading);
        return true;
    }

    void Touch(string relPath, string title)
    {
        var dir = Dir(relPath);
        var path = Path.Combine(dir, NoteFile);
        var node = ReadJson(path) ?? new JsonObject();
        var now = DateTime.UtcNow;
        node["Title"] = title;
        node["CreatedAt"] ??= Stamp(now);
        node["UpdatedAt"] = Stamp(now);
        WriteJson(path, node);

        var parentPath = ParentOf(relPath);
        var index = IndexOf(relPath);
        var siblings = Children(parentPath)
            .Select(c => c.Index == index ? c with { Title = title, UpdatedAt = now } : c)
            .ToList();
        WriteChildren(Dir(parentPath), siblings);
    }

    public void Delete(string relPath)
    {
        if (relPath == "") throw new ArgumentException("The notebook root can't be deleted.");
        var parentPath = ParentOf(relPath);
        var parent = Dir(parentPath);
        var index = IndexOf(relPath);
        var numbering = NumberingOf(index);
        var full = numbering.FindFull(parent, index);
        var dir = Dir(relPath);
        if (Directory.Exists(dir)) Directory.Delete(dir, true);
        if (full != null) Directory.Delete(Path.Combine(parent, full), true);
        WriteChildren(parent, Children(parentPath).Where(c => c.Index != index).ToList());
    }

    /// <summary>Swaps the indexes of two children, in two phases through the temporary prefix.</summary>
    public void SwapIndexes(string parentPath, int a, int b)
    {
        if (a == b) return;
        var parent = Dir(parentPath);
        var na = NumberingOf(a);
        var nb = NumberingOf(b);
        var fullA = na.FindFull(parent, a);
        var fullB = nb.FindFull(parent, b);
        var partA = fullA?[(fullA.IndexOf('-') + 1)..] ?? FolderPairs.NamePartFromTitle(ReadMeta(Join(parentPath, na.ShortName(a))).Title);
        var partB = fullB?[(fullB.IndexOf('-') + 1)..] ?? FolderPairs.NamePartFromTitle(ReadMeta(Join(parentPath, nb.ShortName(b))).Title);
        var t = FolderPairs.TemporaryPrefix;

        // phase one: both to the temporary prefix
        FolderPairs.RenamePair(parent, na.ShortName(a), fullA, t + na.ShortName(a), t + na.FullName(a, partA));
        FolderPairs.RenamePair(parent, nb.ShortName(b), fullB, t + nb.ShortName(b), t + nb.FullName(b, partB));
        // phase two: the final names
        var nfa = NumberingOf(b); var nfb = NumberingOf(a);
        FolderPairs.RenamePair(parent, t + na.ShortName(a), t + na.FullName(a, partA), nfa.ShortName(b), nfa.FullName(b, partA));
        FolderPairs.RenamePair(parent, t + nb.ShortName(b), t + nb.FullName(b, partB), nfb.ShortName(a), nfb.FullName(a, partB));

        var children = Children(parentPath)
            .Select(c => c.Index == a ? c with { Index = b } : c.Index == b ? c with { Index = a } : c)
            .ToList();
        WriteChildren(parent, children);
    }

    // ---------------------------------------------------------------- note files (the 01 / 01-[note-files] pair)

    string FilesDir(string relPath, bool create)
    {
        var dir = Dir(relPath);
        return create
            ? FolderPairs.NoteFiles.Ensure(dir, 1, FolderPairs.NoteFilesName)
            : Path.Combine(dir, FolderPairs.NoteFiles.ShortName(1));
    }

    public List<NoteFile> ListFiles(string relPath)
    {
        var dir = FilesDir(relPath, false);
        if (!Directory.Exists(dir)) return [];
        return Directory.EnumerateFiles(dir)
            .Select(f => new FileInfo(f))
            .OrderBy(f => f.Name, StringComparer.OrdinalIgnoreCase)
            .Select(f => new NoteFile(f.Name, f.Length, f.LastWriteTimeUtc))
            .ToList();
    }

    public static string CheckFileName(string name)
    {
        name = Path.GetFileName(name ?? "").Trim();
        if (name.Length == 0 || name is "." or ".." || name.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0
            || name.IndexOfAny(['<', '>', ':', '"', '\\', '/', '|', '?', '*']) >= 0 || name.Length > 150)
            throw new ArgumentException($"Not a valid file name: {name}");
        return name;
    }

    public string? FilePath(string relPath, string name)
    {
        var path = Path.Combine(FilesDir(relPath, false), CheckFileName(name));
        return File.Exists(path) ? path : null;
    }

    public async Task SaveFile(string relPath, string name, Stream content)
    {
        var path = Path.Combine(FilesDir(relPath, true), CheckFileName(name));
        await using var fs = File.Create(path);
        await content.CopyToAsync(fs);
    }

    public void DeleteFile(string relPath, string name)
    {
        var path = FilePath(relPath, name);
        if (path != null) File.Delete(path);
    }

    // ---------------------------------------------------------------- helpers

    static string CleanTitle(string title)
    {
        title = (title ?? "").Replace('\r', ' ').Replace('\n', ' ').Trim();
        if (title.Length == 0) throw new ArgumentException("A title is required.");
        if (title.Length > 200) throw new ArgumentException("A title can have at most 200 characters.");
        return title;
    }

    static void WriteMarkdown(string dir, string title, string body)
    {
        body = (body ?? "").Replace("\r\n", "\n").Trim('\n');
        var text = "# " + EncodeHeading(title) + "\n" + (body.Length > 0 ? "\n" + body + "\n" : "");
        File.WriteAllText(Path.Combine(dir, MarkdownName(title)), text, Utf8);
    }

    static readonly char[] MarkdownMarks = ['\\', '`', '*', '_', '[', ']', '#', '|', '~', '!'];

    /// <summary>The title as a heading: html-encoded, then markdown's marks escaped.</summary>
    public static string EncodeHeading(string title)
    {
        var html = WebUtility.HtmlEncode(title);
        var sb = new StringBuilder();
        foreach (var ch in html)
        {
            if (Array.IndexOf(MarkdownMarks, ch) >= 0) sb.Append('\\');
            sb.Append(ch);
        }
        return sb.ToString();
    }

    public static string DecodeHeading(string heading)
    {
        var sb = new StringBuilder();
        for (var i = 0; i < heading.Length; i++)
        {
            if (heading[i] == '\\' && i + 1 < heading.Length && Array.IndexOf(MarkdownMarks, heading[i + 1]) >= 0) i++;
            sb.Append(heading[i]);
        }
        return WebUtility.HtmlDecode(sb.ToString());
    }

    void WriteChildren(string dir, List<ChildNote> children)
    {
        var obj = new JsonObject();
        foreach (var c in children.OrderByDescending(c => c.Index))
        {
            var entry = new JsonObject { ["Title"] = c.Title, ["CreatedAt"] = Stamp(c.CreatedAt) };
            if (c.UpdatedAt is { } u) entry["UpdatedAt"] = Stamp(u);
            obj[NumberingOf(c.Index).ShortName(c.Index)] = entry;
        }
        WriteJson(Path.Combine(dir, ChildrenFile), new JsonObject { ["ChildNotes"] = obj });
    }

    public static string Stamp(DateTime utc) => utc.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffffffZ");

    static DateTime? ParseStamp(JsonNode? node)
    {
        if (node is null) return null;
        try
        {
            return DateTime.TryParse(node.GetValue<string>(), null, System.Globalization.DateTimeStyles.AdjustToUniversal | System.Globalization.DateTimeStyles.AssumeUniversal, out var d)
                ? d : null;
        }
        catch { return null; }
    }

    static JsonNode? ReadJson(string path)
    {
        if (!File.Exists(path)) return null;
        try { return JsonNode.Parse(File.ReadAllText(path)); }
        catch (JsonException) { return null; }
    }

    static void WriteJson(string path, JsonNode node) =>
        File.WriteAllText(path, node.ToJsonString(JsonOptions).Replace("\r\n", "\n") + "\n", Utf8);
}
