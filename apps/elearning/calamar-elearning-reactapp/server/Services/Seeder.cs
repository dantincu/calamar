using System.Text.Json;
using Calamar.ELearning.Data;
using Calamar.ELearning.Infrastructure;
using Calamar.ELearning.Notes;
using Dapper;
using Microsoft.Extensions.Options;

namespace Calamar.ELearning.Services;

/// <summary>
/// First run: the three starting accounts, the starting categories and tags (Seed/catalog.json) and the starting
/// courses (Seed/courses/*/course.json), owned by the starting content creator. Each starter course is imported once
/// (meta key "seed.course.&lt;folder&gt;"), so a course added to Seed/courses later reaches existing installations too,
/// while a starter course that its creator deleted is not brought back.
/// </summary>
public sealed class Seeder(Db db, NoteStore notes, UserService users, CatalogService catalog, CourseService courses,
    IOptions<AppOptions> options, ILogger<Seeder> log)
{
    const string SeedKey = "seed.v1";
    const string CourseKeyPrefix = "seed.course.";
    /// <summary>The starter courses that the first version imported all at once, under <see cref="SeedKey"/>.</summary>
    static readonly string[] V1Courses = ["01-react", "02-rust"];
    static readonly JsonSerializerOptions Json = new() { PropertyNameCaseInsensitive = true, ReadCommentHandling = JsonCommentHandling.Skip };

    sealed record CatalogSeed(List<CategorySeed> Categories, List<string> Tags);
    sealed record CategorySeed(string Name, List<CategorySeed>? Children);
    sealed record CourseSeed(string Title, string Description, List<string> Category, List<string> Tags, bool Published, List<NodeSeed> Outline);
    sealed record NodeSeed(string Title, bool Chapter, string? Page, List<string>? Files, List<NodeSeed>? Items);

    public async Task Run()
    {
        db.Migrate();
        notes.EnsureNotebook("Calamar e-learning courses");
        users.EnsureSeedUsers();

        var seedDir = Path.Combine(AppContext.BaseDirectory, "Seed");
        var catalogFile = Path.Combine(seedDir, "catalog.json");
        var v1Done = db.GetMeta(SeedKey);
        if (v1Done != null)
        {
            foreach (var name in V1Courses)
                if (db.GetMeta(CourseKeyPrefix + name) == null) db.SetMeta(CourseKeyPrefix + name, v1Done);
        }
        else if (File.Exists(catalogFile))
        {
            var seed = JsonSerializer.Deserialize<CatalogSeed>(await File.ReadAllTextAsync(catalogFile), Json)!;
            void Add(List<CategorySeed> list, List<string> path)
            {
                foreach (var k in list)
                {
                    var p = path.Append(k.Name).ToList();
                    catalog.EnsureCategoryPath(p);
                    if (k.Children != null) Add(k.Children, p);
                }
            }
            Add(seed.Categories, []);
            foreach (var t in seed.Tags) catalog.EnsureTag(t, null);
        }

        var creator = users.Find(options.Value.SeedCreatorEmail.ToLowerInvariant())!;
        var coursesDir = Path.Combine(seedDir, "courses");
        if (Directory.Exists(coursesDir))
        {
            foreach (var dir in Directory.GetDirectories(coursesDir).Order())
            {
                var file = Path.Combine(dir, "course.json");
                var key = CourseKeyPrefix + Path.GetFileName(dir);
                if (!File.Exists(file) || db.GetMeta(key) != null) continue;
                var seed = JsonSerializer.Deserialize<CourseSeed>(await File.ReadAllTextAsync(file), Json)!;
                await ImportCourse(creator, dir, seed);
                db.SetMeta(key, Db.Now());
            }
        }
        if (v1Done == null) db.SetMeta(SeedKey, Db.Now());
    }

    async Task ImportCourse(UserRow creator, string dir, CourseSeed seed)
    {
        using (var c = db.Open())
        {
            if (c.ExecuteScalar<long>("SELECT COUNT(*) FROM courses WHERE creator_id=@Id AND title=@Title", new { creator.Id, seed.Title }) > 0)
                return;
        }
        // A course whose notes are already on disk (the database was recreated) is not imported twice.
        var creatorNote = notes.Children("").FirstOrDefault(n => n.Title.Equals(creator.Email, StringComparison.OrdinalIgnoreCase));
        if (creatorNote != null)
        {
            var creatorRel = FolderPairs.NoteItems.ShortName(creatorNote.Index);
            if (notes.Children(creatorRel).Any(n => n.Title == seed.Title))
            {
                log.LogInformation("The notes of the starter course {Title} exist already; not importing it.", seed.Title);
                return;
            }
        }

        var categoryId = seed.Category.Count > 0 ? catalog.EnsureCategoryPath(seed.Category) : (long?)null;
        var id = await courses.Create(creator.Id, new CourseInput(seed.Title, seed.Description, categoryId, seed.Tags, seed.Published));

        async Task Add(string parentRel, List<NodeSeed> nodes)
        {
            foreach (var n in nodes)
            {
                var body = n.Page is null ? "" : await File.ReadAllTextAsync(Path.Combine(dir, n.Page));
                var rel = await courses.AddNode(id, creator.Id, parentRel, n.Chapter ? "chapter" : "page", n.Title, StripHeading(body));
                foreach (var f in n.Files ?? [])
                {
                    await using var s = File.OpenRead(Path.Combine(dir, f));
                    await courses.SaveFile(id, creator.Id, rel, Path.GetFileName(f), s);
                }
                if (n.Items != null) await Add(rel, n.Items);
            }
        }
        await Add("", seed.Outline);
        log.LogInformation("Imported the starter course {Title}", seed.Title);
    }

    /// <summary>The seed pages may start with their own title heading; the note's heading is written from its title.</summary>
    static string StripHeading(string text)
    {
        text = text.Replace("\r\n", "\n");
        if (!text.StartsWith("# ")) return text;
        var nl = text.IndexOf('\n');
        return nl < 0 ? "" : text[(nl + 1)..].TrimStart('\n');
    }
}
