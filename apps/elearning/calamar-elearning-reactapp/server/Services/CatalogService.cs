using Calamar.ELearning.Data;
using Calamar.ELearning.Infrastructure;
using Dapper;

namespace Calamar.ELearning.Services;

public sealed class CategoryRow
{
    public long Id { get; set; }
    public long? ParentId { get; set; }
    public string Name { get; set; } = "";
    public long SortOrder { get; set; }
    public long CourseCount { get; set; }
}

public sealed class TagRow
{
    public long Id { get; set; }
    public string Name { get; set; } = "";
    public long CourseCount { get; set; }
}

/// <summary>The category hierarchy (managed by the admin) and the tags (created by content creators, managed by the admin).</summary>
public sealed class CatalogService(Db db)
{
    static string CleanName(string? name, int max = 80)
    {
        var n = (name ?? "").Trim();
        if (n.Length == 0) throw AppException.BadRequest("A name is required.");
        if (n.Length > max) throw AppException.BadRequest($"A name can have at most {max} characters.");
        return n;
    }

    // ---------------------------------------------------------------- categories

    public List<CategoryRow> Categories()
    {
        using var c = db.Open();
        return c.Query<CategoryRow>("""
            SELECT k.id, k.parent_id, k.name, k.sort_order,
                   (SELECT COUNT(*) FROM courses WHERE category_id = k.id AND published = 1) AS course_count
            FROM categories k ORDER BY k.sort_order, k.name
            """).ToList();
    }

    /// <summary>A category and all those below it.</summary>
    public HashSet<long> WithDescendants(long id)
    {
        var all = Categories();
        var result = new HashSet<long> { id };
        bool added;
        do
        {
            added = false;
            foreach (var k in all)
                if (k.ParentId is { } p && result.Contains(p) && result.Add(k.Id)) added = true;
        } while (added);
        return result;
    }

    public List<string> PathOf(long? id, List<CategoryRow>? all = null)
    {
        all ??= Categories();
        var path = new List<string>();
        var guard = 0;
        while (id is { } i && guard++ < 50)
        {
            var k = all.FirstOrDefault(x => x.Id == i);
            if (k is null) break;
            path.Insert(0, k.Name);
            id = k.ParentId;
        }
        return path;
    }

    public long CreateCategory(long? parentId, string name)
    {
        name = CleanName(name);
        using var c = db.Open();
        if (parentId is { } p && c.ExecuteScalar<long>("SELECT COUNT(*) FROM categories WHERE id=@p", new { p }) == 0)
            throw AppException.NotFound("The parent category doesn't exist.");
        EnsureUniqueName(c, parentId, name, null);
        var order = c.ExecuteScalar<long>("SELECT IFNULL(MAX(sort_order), 0) + 1 FROM categories WHERE IFNULL(parent_id,0)=IFNULL(@parentId,0)", new { parentId });
        return c.ExecuteScalar<long>("INSERT INTO categories(parent_id, name, sort_order) VALUES(@parentId, @name, @order) RETURNING id",
            new { parentId, name, order });
    }

    /// <summary>Finds or creates a path of categories (used by the seed).</summary>
    public long EnsureCategoryPath(IEnumerable<string> names)
    {
        long? parent = null;
        foreach (var name in names)
        {
            using var c = db.Open();
            var id = c.ExecuteScalar<long?>("SELECT id FROM categories WHERE IFNULL(parent_id,0)=IFNULL(@parent,0) AND name=@name COLLATE NOCASE",
                new { parent, name });
            parent = id ?? CreateCategory(parent, name);
        }
        return parent ?? throw new ArgumentException("Empty category path.");
    }

    static void EnsureUniqueName(Microsoft.Data.Sqlite.SqliteConnection c, long? parentId, string name, long? except)
    {
        if (c.ExecuteScalar<long>("SELECT COUNT(*) FROM categories WHERE IFNULL(parent_id,0)=IFNULL(@parentId,0) AND name=@name COLLATE NOCASE AND id<>IFNULL(@except,0)",
                new { parentId, name, except }) > 0)
            throw AppException.Conflict("A category with this name exists already at this level.");
    }

    public void UpdateCategory(long id, string? name, long? parentId, bool changeParent)
    {
        using var c = db.Open();
        var k = c.QuerySingleOrDefault<CategoryRow>("SELECT * FROM categories WHERE id=@id", new { id }) ?? throw AppException.NotFound();
        var newName = name is null ? k.Name : CleanName(name);
        var newParent = changeParent ? parentId : k.ParentId;
        if (changeParent && newParent is { } np)
        {
            if (WithDescendants(id).Contains(np)) throw AppException.BadRequest("A category can't be moved inside itself.");
            if (c.ExecuteScalar<long>("SELECT COUNT(*) FROM categories WHERE id=@np", new { np }) == 0) throw AppException.NotFound("The parent category doesn't exist.");
        }
        EnsureUniqueName(c, newParent, newName, id);
        var order = k.SortOrder;
        if (changeParent && newParent != k.ParentId)
            order = c.ExecuteScalar<long>("SELECT IFNULL(MAX(sort_order), 0) + 1 FROM categories WHERE IFNULL(parent_id,0)=IFNULL(@newParent,0)", new { newParent });
        c.Execute("UPDATE categories SET name=@newName, parent_id=@newParent, sort_order=@order WHERE id=@id", new { newName, newParent, order, id });
    }

    public void MoveCategory(long id, int direction)
    {
        using var c = db.Open();
        var k = c.QuerySingleOrDefault<CategoryRow>("SELECT * FROM categories WHERE id=@id", new { id }) ?? throw AppException.NotFound();
        var siblings = c.Query<CategoryRow>("SELECT * FROM categories WHERE IFNULL(parent_id,0)=IFNULL(@ParentId,0) ORDER BY sort_order, name", k).ToList();
        var i = siblings.FindIndex(s => s.Id == id);
        var j = i + Math.Sign(direction);
        if (j < 0 || j >= siblings.Count) return;
        (siblings[i], siblings[j]) = (siblings[j], siblings[i]);
        for (var n = 0; n < siblings.Count; n++)
            c.Execute("UPDATE categories SET sort_order=@n WHERE id=@id", new { n = n + 1, id = siblings[n].Id });
    }

    public void DeleteCategory(long id)
    {
        using var c = db.Open();
        if (c.Execute("DELETE FROM categories WHERE id=@id", new { id }) == 0) throw AppException.NotFound();
    }

    // ---------------------------------------------------------------- tags

    public List<TagRow> Tags()
    {
        using var c = db.Open();
        return c.Query<TagRow>("""
            SELECT t.id, t.name, (SELECT COUNT(*) FROM course_tags ct JOIN courses k ON k.id = ct.course_id WHERE ct.tag_id = t.id AND k.published = 1) AS course_count
            FROM tags t ORDER BY t.name COLLATE NOCASE
            """).ToList();
    }

    public static string CleanTag(string? name)
    {
        var n = CleanName(name, 40).ToLowerInvariant();
        if (n.Any(ch => char.IsControl(ch) || ch == ',')) throw AppException.BadRequest("A tag can't contain commas.");
        return n;
    }

    public long EnsureTag(string name, long? userId)
    {
        name = CleanTag(name);
        using var c = db.Open();
        var id = c.ExecuteScalar<long?>("SELECT id FROM tags WHERE name=@name", new { name });
        return id ?? c.ExecuteScalar<long>("INSERT INTO tags(name, created_by, created_at) VALUES(@name, @userId, @now) RETURNING id",
            new { name, userId, now = Db.Now() });
    }

    public long CreateTag(string name, long userId)
    {
        name = CleanTag(name);
        using (var c = db.Open())
            if (c.ExecuteScalar<long>("SELECT COUNT(*) FROM tags WHERE name=@name", new { name }) > 0)
                throw AppException.Conflict("This tag exists already.");
        return EnsureTag(name, userId);
    }

    public void RenameTag(long id, string name)
    {
        name = CleanTag(name);
        using var c = db.Open();
        if (c.ExecuteScalar<long>("SELECT COUNT(*) FROM tags WHERE name=@name AND id<>@id", new { name, id }) > 0)
            throw AppException.Conflict("Another tag has this name already.");
        if (c.Execute("UPDATE tags SET name=@name WHERE id=@id", new { name, id }) == 0) throw AppException.NotFound();
    }

    public void DeleteTag(long id)
    {
        using var c = db.Open();
        if (c.Execute("DELETE FROM tags WHERE id=@id", new { id }) == 0) throw AppException.NotFound();
    }
}
