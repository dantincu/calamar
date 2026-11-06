using System.Text;
using Calamar.ELearning.Data;
using Calamar.ELearning.Infrastructure;
using Calamar.ELearning.Notes;
using Dapper;

namespace Calamar.ELearning.Services;

public sealed class CourseRow
{
    public long Id { get; set; }
    public long CreatorId { get; set; }
    public string CreatorEmail { get; set; } = "";
    public string NotePath { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public long? CategoryId { get; set; }
    public bool Published { get; set; }
    public string CreatedAt { get; set; } = "";
    public string UpdatedAt { get; set; } = "";
    public long SubscriberCount { get; set; }
}

public sealed record CourseSummary(
    long Id, string Title, string Description, string CreatorEmail, long? CategoryId, List<string> CategoryPath,
    List<string> Tags, bool Published, bool Subscribed, long SubscriberCount, string CreatedAt, string UpdatedAt);

public sealed record OutlineNode(string Path, int Index, string Title, string Kind, List<OutlineNode> Children);

public sealed record PageView(string Path, string Title, string Kind, string Markdown, List<NoteFile> Files, string UpdatedAt);

public sealed record CourseInput(string? Title, string? Description, long? CategoryId, List<string>? Tags, bool? Published);

/// <summary>
/// Courses: their catalog data (category, tags, subscriptions) lives in the database, their content in the notes
/// notebook of the remote data folder — <c>c/&lt;creator note&gt;/&lt;course root note&gt;/…</c>, chapters as ternary note
/// sections and pages as note items, each page's files in its <c>01</c> / <c>01-[note-files]</c> pair.
/// </summary>
public sealed class CourseService(Db db, NoteStore notes, CatalogService catalog)
{
    const string CourseColumns = """
        k.id, k.creator_id, u.email AS creator_email, k.note_path, k.title, k.description, k.category_id, k.published,
        k.created_at, k.updated_at, (SELECT COUNT(*) FROM subscriptions s WHERE s.course_id = k.id) AS subscriber_count
        """;

    // ---------------------------------------------------------------- reading the catalog

    public CourseRow Get(long id)
    {
        using var c = db.Open();
        return c.QuerySingleOrDefault<CourseRow>($"SELECT {CourseColumns} FROM courses k JOIN users u ON u.id = k.creator_id WHERE k.id=@id", new { id })
               ?? throw AppException.NotFound("This course doesn't exist.");
    }

    List<CourseRow> Rows(string where, object? args = null)
    {
        using var c = db.Open();
        return c.Query<CourseRow>($"SELECT {CourseColumns} FROM courses k JOIN users u ON u.id = k.creator_id WHERE {where} ORDER BY k.title COLLATE NOCASE", args).ToList();
    }

    Dictionary<long, List<string>> TagsByCourse()
    {
        using var c = db.Open();
        return c.Query<(long courseId, string name)>("SELECT ct.course_id, t.name FROM course_tags ct JOIN tags t ON t.id = ct.tag_id ORDER BY t.name")
            .GroupBy(x => x.courseId).ToDictionary(g => g.Key, g => g.Select(x => x.name).ToList());
    }

    HashSet<long> SubscribedIds(long userId)
    {
        using var c = db.Open();
        return c.Query<long>("SELECT course_id FROM subscriptions WHERE user_id=@userId", new { userId }).ToHashSet();
    }

    List<CourseSummary> Summaries(List<CourseRow> rows, long userId)
    {
        var tags = TagsByCourse();
        var subs = SubscribedIds(userId);
        var cats = catalog.Categories();
        return rows.Select(r => new CourseSummary(r.Id, r.Title, r.Description, r.CreatorEmail, r.CategoryId,
            catalog.PathOf(r.CategoryId, cats), tags.GetValueOrDefault(r.Id) ?? [], r.Published, subs.Contains(r.Id),
            r.SubscriberCount, r.CreatedAt, r.UpdatedAt)).ToList();
    }

    public CourseSummary Summary(long id, long userId) => Summaries([Get(id)], userId)[0];

    /// <summary>Published courses, optionally within a category (and those below it), with a tag, matching a text.</summary>
    public List<CourseSummary> Search(long userId, string? q, long? categoryId, string? tag)
    {
        var list = Summaries(Rows("k.published = 1"), userId);
        if (categoryId is { } cid)
        {
            var ids = catalog.WithDescendants(cid);
            list = list.Where(x => x.CategoryId is { } k && ids.Contains(k)).ToList();
        }
        if (!string.IsNullOrWhiteSpace(tag))
            list = list.Where(x => x.Tags.Contains(tag.Trim().ToLowerInvariant())).ToList();
        if (!string.IsNullOrWhiteSpace(q))
        {
            var words = q.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            var outlines = new Dictionary<long, string>();
            list = list.Where(x =>
            {
                var text = string.Join(' ', [x.Title, x.Description, x.CreatorEmail, .. x.Tags, .. x.CategoryPath]);
                return words.All(w => text.Contains(w, StringComparison.OrdinalIgnoreCase)
                                      || OutlineText(x.Id, outlines).Contains(w, StringComparison.OrdinalIgnoreCase));
            }).ToList();
        }
        return list;
    }

    /// <summary>The titles of a course's chapters and pages, so that search finds a course by what it teaches.</summary>
    string OutlineText(long courseId, Dictionary<long, string> cache)
    {
        if (cache.TryGetValue(courseId, out var s)) return s;
        try
        {
            var sb = new StringBuilder();
            void Walk(List<OutlineNode> nodes) { foreach (var n in nodes) { sb.Append(n.Title).Append(' '); Walk(n.Children); } }
            Walk(Outline(Get(courseId)));
            s = sb.ToString();
        }
        catch { s = ""; }
        return cache[courseId] = s;
    }

    public List<CourseSummary> Subscribed(long userId) =>
        Summaries(Rows("k.published = 1 AND k.id IN (SELECT course_id FROM subscriptions WHERE user_id=@userId)", new { userId }), userId);

    public List<CourseSummary> ByCreator(long creatorId) => Summaries(Rows("k.creator_id=@creatorId", new { creatorId }), creatorId);

    // ---------------------------------------------------------------- access

    public bool IsSubscribed(long courseId, long userId)
    {
        using var c = db.Open();
        return c.ExecuteScalar<long>("SELECT COUNT(*) FROM subscriptions WHERE course_id=@courseId AND user_id=@userId", new { courseId, userId }) > 0;
    }

    public CourseRow ForEditing(long id, long userId)
    {
        var k = Get(id);
        if (k.CreatorId != userId) throw AppException.Forbidden("Only the creator of a course can change it.");
        return k;
    }

    /// <summary>Its creator and the admin can always read a course; others once it is published and they are subscribed.</summary>
    public CourseRow ForReading(long id, long userId, string role)
    {
        var k = Get(id);
        if (k.CreatorId == userId || role == Roles.Admin) return k;
        if (!k.Published) throw AppException.NotFound("This course doesn't exist.");
        if (!IsSubscribed(id, userId)) throw AppException.Forbidden("Subscribe to this course to read its pages.");
        return k;
    }

    /// <summary>The outline (title, chapters and pages) can be seen by everyone who can see the course.</summary>
    public CourseRow ForOverview(long id, long userId, string role)
    {
        var k = Get(id);
        if (!k.Published && k.CreatorId != userId && role != Roles.Admin) throw AppException.NotFound("This course doesn't exist.");
        return k;
    }

    public void Subscribe(long courseId, long userId, bool on)
    {
        var k = Get(courseId);
        using var c = db.Open();
        if (on)
        {
            if (!k.Published) throw AppException.BadRequest("This course isn't published.");
            c.Execute("INSERT OR IGNORE INTO subscriptions(user_id, course_id, subscribed_at) VALUES(@userId, @courseId, @now)", new { userId, courseId, now = Db.Now() });
        }
        else c.Execute("DELETE FROM subscriptions WHERE user_id=@userId AND course_id=@courseId", new { userId, courseId });
    }

    // ---------------------------------------------------------------- the notes

    /// <summary>The note of a content creator inside the "c" notebook: a note item whose title is their e-mail address.</summary>
    string CreatorNote(string email)
    {
        var existing = notes.Children("").FirstOrDefault(n => !n.IsSection && string.Equals(n.Title, email, StringComparison.OrdinalIgnoreCase));
        if (existing != null) return FolderPairs.NoteItems.ShortName(existing.Index);
        return FolderPairs.NoteItems.ShortName(notes.CreateNote("", email, NoteKind.Item,
            "The courses created by this content creator, one child note each."));
    }

    static string CheckRel(string? rel)
    {
        rel = (rel ?? "").Trim('/');
        if (!NoteStore.IsValidPath(rel)) throw AppException.BadRequest("Not a page of this course.");
        return rel;
    }

    string Abs(CourseRow k, string rel) => NoteStore.Join(k.NotePath, CheckRel(rel));

    public List<OutlineNode> Outline(CourseRow k, bool syncTitles = false)
    {
        List<OutlineNode> Walk(string rel)
        {
            var abs = NoteStore.Join(k.NotePath, rel);
            return notes.Children(abs).Select(ch =>
            {
                var childRel = NoteStore.Join(rel, ch.Index.ToString("D3"));
                var childAbs = NoteStore.Join(k.NotePath, childRel);
                var title = ch.Title;
                // a heading edited in the markdown file outside the app renames the note
                if (syncTitles && notes.SyncTitleFromHeading(childAbs)) title = notes.ReadMeta(childAbs).Title;
                return new OutlineNode(childRel, ch.Index, title, ch.IsSection ? "chapter" : "page", Walk(childRel));
            }).ToList();
        }
        if (!notes.Exists(k.NotePath)) return [];
        return Walk("");
    }

    public PageView Page(CourseRow k, string rel)
    {
        var abs = Abs(k, rel);
        if (rel == "" || !notes.Exists(abs)) throw AppException.NotFound("This page doesn't exist.");
        var meta = notes.ReadMeta(abs);
        var kind = FolderPairs.NoteItems.Contains(NoteStore.IndexOf(abs)) ? "page" : "chapter";
        return new PageView(CheckRel(rel), meta.Title, kind, notes.ReadBody(abs), notes.ListFiles(abs), NoteStore.Stamp(meta.UpdatedAt));
    }

    public string? FilePath(CourseRow k, string rel, string name)
    {
        var abs = Abs(k, rel);
        if (rel == "" || !notes.Exists(abs)) return null;
        return notes.FilePath(abs, name);
    }

    // ---------------------------------------------------------------- writing (the creator)

    async Task<T> Locked<T>(Func<T> f)
    {
        await notes.Lock.WaitAsync();
        try { return f(); }
        catch (ArgumentException e) { throw AppException.BadRequest(e.Message); }
        catch (InvalidOperationException e) { throw AppException.Conflict(e.Message); }
        finally { notes.Lock.Release(); }
    }

    Task Locked(Action f) => Locked(() => { f(); return 0; });

    public async Task<long> Create(long creatorId, CourseInput input)
    {
        UserRow creator;
        using (var c0 = db.Open()) creator = c0.QuerySingle<UserRow>("SELECT * FROM users WHERE id=@creatorId", new { creatorId });
        var title = (input.Title ?? "").Trim();
        if (title.Length == 0) throw AppException.BadRequest("A course needs a title.");
        var notePath = await Locked(() =>
        {
            var creatorNote = CreatorNote(creator.Email);
            var index = notes.CreateNote(creatorNote, title, NoteKind.Item);
            return NoteStore.Join(creatorNote, FolderPairs.NoteItems.ShortName(index));
        });
        long id;
        using (var c = db.Open())
        {
            id = c.ExecuteScalar<long>("""
                INSERT INTO courses(creator_id, note_path, title, description, category_id, published, created_at, updated_at)
                VALUES(@creatorId, @notePath, @title, @description, @CategoryId, @published, @now, @now) RETURNING id
                """, new { creatorId, notePath, title = notes.ReadMeta(notePath).Title, description = (input.Description ?? "").Trim(),
                input.CategoryId, published = input.Published == true, now = Db.Now() });
        }
        if (input.Tags != null) SetTags(id, input.Tags, creatorId);
        await Locked(() => WriteRoot(Get(id)));
        return id;
    }

    public async Task Update(long id, long userId, CourseInput input)
    {
        var k = ForEditing(id, userId);
        if (input.Title is { } t && t.Trim() != k.Title)
        {
            await Locked(() => notes.Rename(k.NotePath, t));
            using var c = db.Open();
            c.Execute("UPDATE courses SET title=@title WHERE id=@id", new { title = notes.ReadMeta(k.NotePath).Title, id });
        }
        using (var c = db.Open())
        {
            if (input.Description is { } d) c.Execute("UPDATE courses SET description=@d WHERE id=@id", new { d = d.Trim(), id });
            if (input.Published is { } p) c.Execute("UPDATE courses SET published=@p WHERE id=@id", new { p, id });
            c.Execute("UPDATE courses SET category_id=@CategoryId, updated_at=@now WHERE id=@id", new { input.CategoryId, now = Db.Now(), id });
        }
        if (input.Tags != null) SetTags(id, input.Tags, userId);
        await Locked(() => WriteRoot(Get(id)));
    }

    void SetTags(long courseId, List<string> tags, long userId)
    {
        var ids = tags.Where(t => !string.IsNullOrWhiteSpace(t)).Select(t => catalog.EnsureTag(t, userId)).Distinct().ToList();
        using var c = db.Open();
        c.Execute("DELETE FROM course_tags WHERE course_id=@courseId", new { courseId });
        foreach (var tagId in ids) c.Execute("INSERT INTO course_tags(course_id, tag_id) VALUES(@courseId, @tagId)", new { courseId, tagId });
    }

    public async Task Delete(long id, long userId)
    {
        var k = ForEditing(id, userId);
        await Locked(() => { if (notes.Exists(k.NotePath)) notes.Delete(k.NotePath); });
        using var c = db.Open();
        c.Execute("DELETE FROM courses WHERE id=@id", new { id });
    }

    /// <summary>Adds a chapter (a ternary note section) or a page (a note item) inside the course root or a chapter.</summary>
    public async Task<string> AddNode(long id, long userId, string parentRel, string kind, string title, string body = "")
    {
        var k = ForEditing(id, userId);
        parentRel = CheckRel(parentRel);
        if (parentRel != "" && FolderPairs.NoteItems.Contains(NoteStore.IndexOf(parentRel)))
            throw AppException.BadRequest("Pages and chapters can only be added to the course itself or to a chapter.");
        var noteKind = kind == "chapter" ? NoteKind.Section : NoteKind.Item;
        var rel = await Locked(() =>
        {
            var abs = Abs(k, parentRel);
            if (!notes.Exists(abs)) throw AppException.NotFound("This chapter doesn't exist.");
            var index = notes.CreateNote(abs, title, noteKind, body);
            var r = NoteStore.Join(parentRel, index.ToString("D3"));
            WriteRoot(k);
            return r;
        });
        Touch(id);
        return rel;
    }

    public async Task SavePage(long id, long userId, string rel, string? title, string? markdown)
    {
        var k = ForEditing(id, userId);
        await Locked(() =>
        {
            var abs = Abs(k, rel);
            if (rel == "" || !notes.Exists(abs)) throw AppException.NotFound("This page doesn't exist.");
            if (title != null && title.Trim() != notes.ReadMeta(abs).Title) notes.Rename(abs, title);
            if (markdown != null) notes.WriteBody(abs, markdown);
            WriteRoot(k);
        });
        Touch(id);
    }

    public async Task DeleteNode(long id, long userId, string rel)
    {
        var k = ForEditing(id, userId);
        await Locked(() =>
        {
            var abs = Abs(k, rel);
            if (rel == "" || !notes.Exists(abs)) throw AppException.NotFound("This page doesn't exist.");
            notes.Delete(abs);
            WriteRoot(k);
        });
        Touch(id);
    }

    /// <summary>Moves a page or chapter one place up or down among its siblings of the same kind, by swapping indexes.</summary>
    public async Task<string> MoveNode(long id, long userId, string rel, int direction)
    {
        var k = ForEditing(id, userId);
        var result = await Locked(() =>
        {
            var abs = Abs(k, rel);
            if (rel == "" || !notes.Exists(abs)) throw AppException.NotFound("This page doesn't exist.");
            var parentRel = NoteStore.ParentOf(rel);
            var index = NoteStore.IndexOf(rel);
            var isItem = FolderPairs.NoteItems.Contains(index);
            var same = notes.Children(NoteStore.ParentOf(abs)).Where(c => c.IsSection != isItem).Select(c => c.Index).ToList(); // descending = display order
            var i = same.IndexOf(index);
            var j = i + (direction < 0 ? -1 : 1);
            if (i < 0 || j < 0 || j >= same.Count) return rel;
            notes.SwapIndexes(NoteStore.ParentOf(abs), index, same[j]);
            WriteRoot(k);
            return NoteStore.Join(parentRel, same[j].ToString("D3"));
        });
        Touch(id);
        return result;
    }

    public async Task SaveFile(long id, long userId, string rel, string name, Stream content)
    {
        var k = ForEditing(id, userId);
        await notes.Lock.WaitAsync();
        try
        {
            var abs = Abs(k, rel);
            if (rel == "" || !notes.Exists(abs)) throw AppException.NotFound("This page doesn't exist.");
            await notes.SaveFile(abs, name, content);
        }
        catch (ArgumentException e) { throw AppException.BadRequest(e.Message); }
        finally { notes.Lock.Release(); }
        Touch(id);
    }

    public async Task DeleteFile(long id, long userId, string rel, string name)
    {
        var k = ForEditing(id, userId);
        await Locked(() => notes.DeleteFile(Abs(k, rel), name));
        Touch(id);
    }

    void Touch(long id)
    {
        using var c = db.Open();
        c.Execute("UPDATE courses SET updated_at=@now WHERE id=@id", new { now = Db.Now(), id });
    }

    /// <summary>The course root note holds the course description and its table of contents, linking each chapter's and page's markdown.</summary>
    void WriteRoot(CourseRow k)
    {
        var sb = new StringBuilder();
        var description = Get(k.Id).Description;
        if (description.Length > 0) sb.Append(description.Trim()).Append("\n\n");
        sb.Append("## Table of contents\n\n");
        void Walk(List<OutlineNode> nodes, int depth)
        {
            foreach (var n in nodes)
            {
                var abs = NoteStore.Join(k.NotePath, n.Path);
                var link = string.Join('/', NoteStore.Segments(n.Path).Append(NoteStore.MarkdownName(notes.ReadMeta(abs).Title)).Select(Uri.EscapeDataString));
                var label = NoteStore.EncodeHeading(n.Title);
                sb.Append(new string(' ', depth * 2)).Append("- ")
                  .Append(n.Kind == "chapter" ? $"**[{label}]({link})**" : $"[{label}]({link})").Append('\n');
                Walk(n.Children, depth + 1);
            }
        }
        var outline = Outline(k);
        if (outline.Count == 0) sb.Append("_This course has no pages yet._\n");
        Walk(outline, 0);
        notes.WriteBody(k.NotePath, sb.ToString());
    }
}
