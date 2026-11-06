using System.Globalization;
using System.Text;

namespace Calamar.ELearning.Notes;

/// <summary>
/// The folder pairs strategy (ayran csdrive-webhost-v2, docs/strategies/folder-pairs-strategy.md):
/// a thing gets a short folder <c>NNN</c> holding its data and a sibling full folder <c>NNN-&lt;full name part&gt;</c>
/// holding only a <c>.keep</c> file whose content is a single dash.
/// </summary>
public static class FolderPairs
{
    public const string KeepFile = ".keep";
    public const string KeepContent = "-";
    public const string TemporaryPrefix = "t_";
    public const int MaxNamePartChars = 100;

    // The note system's numberings (same values as the ayran config file folder-pairs-and-notes.json).
    public static readonly Numbering NoteItems = new(999, 401, 3);
    public static readonly Numbering PrimarySections = new(199, 111, 3);
    public static readonly Numbering SecondarySections = new(299, 201, 3);
    public static readonly Numbering TernarySections = new(399, 301, 3);
    public static readonly Numbering ArchiveSection = new(109, 101, 3);
    public static readonly Numbering NoteFiles = new(1, 1, 2);
    public const string NoteFilesName = "[note-files]";

    public static readonly Numbering[] NoteNumberings = [NoteItems, PrimarySections, SecondarySections, TernarySections, ArchiveSection];

    static readonly char[] Forbidden = ['<', '>', ':', '"', '\\', '|', '?', '*'];
    static readonly HashSet<string> Reserved = new(StringComparer.OrdinalIgnoreCase)
    {
        "CON", "PRN", "AUX", "NUL",
        "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
        "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
    };

    /// <summary>
    /// The full folder name part made from a title, as the notes strategy says: characters a file name can't have are
    /// discarded, '/' becomes '%', '%' becomes '%%', at most 100 characters, and a '%%' pair is never cut in half.
    /// </summary>
    public static string NamePartFromTitle(string title)
    {
        var tokens = new List<string>();
        foreach (var rune in title.EnumerateRunes())
        {
            if (Rune.IsControl(rune)) continue;
            if (rune.IsBmp && Array.IndexOf(Forbidden, (char)rune.Value) >= 0) continue;
            tokens.Add(rune.Value switch
            {
                '/' => "%",
                '%' => "%%",
                _ => rune.ToString(),
            });
        }
        var sb = new StringBuilder();
        foreach (var t in tokens)
        {
            if (sb.Length + t.Length > MaxNamePartChars) break; // never splits '%%' nor a surrogate pair
            sb.Append(t);
        }
        var part = sb.ToString().Trim().TrimEnd('.', ' ');
        if (part.Length == 0) part = "_";
        if (Reserved.Contains(part) || Reserved.Contains(part.Split('.')[0])) part = "_" + part;
        return part;
    }

    public static void WriteKeep(string fullFolder)
    {
        Directory.CreateDirectory(fullFolder);
        File.WriteAllText(Path.Combine(fullFolder, KeepFile), KeepContent, new UTF8Encoding(false));
    }

    /// <summary>Renames one pair whole or not at all.</summary>
    public static void RenamePair(string parent, string fromShort, string? fromFull, string toShort, string toFull)
    {
        var srcShort = Path.Combine(parent, fromShort);
        var dstShort = Path.Combine(parent, toShort);
        if (!string.Equals(fromShort, toShort, StringComparison.Ordinal))
            MoveDirectory(srcShort, dstShort);
        try
        {
            if (fromFull is null) WriteKeep(Path.Combine(parent, toFull));
            else if (!string.Equals(fromFull, toFull, StringComparison.Ordinal))
                MoveDirectory(Path.Combine(parent, fromFull), Path.Combine(parent, toFull));
        }
        catch
        {
            if (!string.Equals(fromShort, toShort, StringComparison.Ordinal))
                MoveDirectory(dstShort, srcShort);
            throw;
        }
    }

    /// <summary>Directory.Move that also copes with a change of case only (Windows).</summary>
    public static void MoveDirectory(string from, string to)
    {
        if (string.Equals(from, to, StringComparison.OrdinalIgnoreCase))
        {
            var tmp = from + ".~mv" + Guid.NewGuid().ToString("N")[..6];
            Directory.Move(from, tmp);
            Directory.Move(tmp, to);
        }
        else Directory.Move(from, to);
    }

    public static void MoveFile(string from, string to)
    {
        if (string.Equals(from, to, StringComparison.Ordinal)) return;
        if (string.Equals(from, to, StringComparison.OrdinalIgnoreCase))
        {
            var tmp = from + ".~mv";
            File.Move(from, tmp);
            File.Move(tmp, to);
        }
        else File.Move(from, to);
    }
}

/// <summary>A numbering: a prefix, an interval (either direction) and a digit count. Indexing is always "after the largest".</summary>
public sealed record Numbering(int From, int To, int Digits, string Prefix = "")
{
    public bool Descending => From > To;
    public bool Contains(int index) => Descending ? index <= From && index >= To : index >= From && index <= To;
    public string ShortName(int index) => Prefix + index.ToString(CultureInfo.InvariantCulture).PadLeft(Digits, '0');
    public string FullName(int index, string part) => ShortName(index) + "-" + part;
    public Numbering WithPrefix(string prefix) => this with { Prefix = prefix };

    /// <summary>Reads an index written the way this numbering writes it, from a short or a full folder name.</summary>
    public bool TryParse(string name, out int index, out string? part)
    {
        index = 0; part = null;
        if (!name.StartsWith(Prefix, StringComparison.Ordinal)) return false;
        var rest = name[Prefix.Length..];
        var dash = rest.IndexOf('-');
        var digits = dash < 0 ? rest : rest[..dash];
        if (digits.Length < Digits || !digits.All(char.IsAsciiDigit)) return false;
        if (!int.TryParse(digits, NumberStyles.None, CultureInfo.InvariantCulture, out index)) return false;
        if (ShortName(index) != Prefix + digits) return false; // "001" is not a two digit numbering's "01"
        if (!Contains(index)) return false;
        if (dash >= 0) part = rest[(dash + 1)..];
        return true;
    }

    /// <summary>Every index of this numbering in use in a parent folder, by its short or its full folder.</summary>
    public SortedSet<int> InUse(string parent)
    {
        var used = new SortedSet<int>();
        if (!Directory.Exists(parent)) return used;
        foreach (var dir in Directory.EnumerateDirectories(parent))
            if (TryParse(Path.GetFileName(dir), out var i, out _)) used.Add(i);
        return used;
    }

    /// <summary>One step past the furthest index in use (the start when none is), "after the largest".</summary>
    public int NextIndex(string parent)
    {
        var used = InUse(parent);
        if (used.Count == 0) return From;
        var next = Descending ? used.Min - 1 : used.Max + 1;
        if (!Contains(next))
            throw new InvalidOperationException($"No free index from {From} to {To} in {parent}.");
        return next;
    }

    /// <summary>The full folder (marker) of an index, if there is one.</summary>
    public string? FindFull(string parent, int index)
    {
        if (!Directory.Exists(parent)) return null;
        var prefix = ShortName(index) + "-";
        return Directory.EnumerateDirectories(parent, prefix + "*")
            .Select(Path.GetFileName)
            .FirstOrDefault(n => n!.StartsWith(prefix, StringComparison.Ordinal));
    }

    /// <summary>Makes sure the pair with a fixed index exists (used for the 01 note files pair).</summary>
    public string Ensure(string parent, int index, string part)
    {
        var shortDir = Path.Combine(parent, ShortName(index));
        Directory.CreateDirectory(shortDir);
        var full = FindFull(parent, index) ?? FullName(index, part);
        var keep = Path.Combine(parent, full, FolderPairs.KeepFile);
        if (!File.Exists(keep) || File.ReadAllText(keep) != FolderPairs.KeepContent)
            FolderPairs.WriteKeep(Path.Combine(parent, full));
        return shortDir;
    }
}
