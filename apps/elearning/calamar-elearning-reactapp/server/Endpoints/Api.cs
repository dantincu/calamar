using System.Security.Claims;
using Calamar.ELearning.Infrastructure;
using Calamar.ELearning.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.StaticFiles;

namespace Calamar.ELearning.Endpoints;

public static class UserExtensions
{
    public static long UserId(this ClaimsPrincipal u) => long.Parse(u.FindFirstValue(ClaimTypes.NameIdentifier)!);
    public static string Role(this ClaimsPrincipal u) => u.FindFirstValue(ClaimTypes.Role)!;
}

public static class Api
{
    public record EmailBody(string? Email);
    public record LoginBody(string? Email, string? Password);
    public record RegisterBody(string? Email, string? Password, string? Role);
    public record ResetBody(string? Email, string? Code, string? Password);
    public record CategoryBody(string? Name, long? ParentId, bool? ChangeParent);
    public record MoveBody(int Direction);
    public record NameBody(string? Name);
    public record NodeBody(string? Parent, string? Kind, string? Title, string? Markdown);
    public record PageBody(string? Title, string? Markdown);
    public record MoveNodeBody(string? Path, int Direction);

    static object Me(UserRow u) => new { id = u.Id, email = u.Email, role = u.Role };

    static async Task SignIn(HttpContext http, UserRow u)
    {
        var identity = new ClaimsIdentity(
        [
            new Claim(ClaimTypes.NameIdentifier, u.Id.ToString()),
            new Claim(ClaimTypes.Email, u.Email),
            new Claim(ClaimTypes.Role, u.Role),
        ], CookieAuthenticationDefaults.AuthenticationScheme);
        await http.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity),
            new AuthenticationProperties { IsPersistent = true, ExpiresUtc = DateTimeOffset.UtcNow.AddDays(14) });
    }

    public static void Map(WebApplication app)
    {
        var api = app.MapGroup("/api");

        // ------------------------------------------------------------ authentication
        var auth = api.MapGroup("/auth");
        auth.MapPost("/check", (EmailBody b, UserService users) =>
        {
            var (exists, needsPassword, role) = users.Check(b.Email ?? "");
            return Results.Ok(new { exists, needsPassword, role });
        });
        auth.MapPost("/login", async (LoginBody b, UserService users, HttpContext http) =>
        {
            var u = users.Login(b.Email ?? "", b.Password ?? "");
            await SignIn(http, u);
            return Results.Ok(Me(u));
        });
        auth.MapPost("/initial-password", async (LoginBody b, UserService users, HttpContext http) =>
        {
            var u = users.SetInitialPassword(b.Email ?? "", b.Password ?? "");
            await SignIn(http, u);
            return Results.Ok(Me(u));
        });
        auth.MapPost("/register", async (RegisterBody b, UserService users, HttpContext http) =>
        {
            var u = users.Register(b.Email ?? "", b.Password ?? "", b.Role ?? "");
            await SignIn(http, u);
            return Results.Ok(Me(u));
        });
        auth.MapPost("/forgot", async (EmailBody b, UserService users) =>
        {
            await users.RequestReset(b.Email ?? "");
            return Results.Ok(new { sent = true });
        });
        auth.MapPost("/reset", async (ResetBody b, UserService users, HttpContext http) =>
        {
            var u = users.ResetPassword(b.Email ?? "", b.Code ?? "", b.Password ?? "");
            await SignIn(http, u);
            return Results.Ok(Me(u));
        });
        auth.MapPost("/logout", async (HttpContext http) =>
        {
            await http.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Results.Ok();
        });
        auth.MapGet("/me", (ClaimsPrincipal user, UserService users) =>
        {
            if (user.Identity?.IsAuthenticated != true) return Results.Ok(new { user = (object?)null });
            var u = users.Get(user.UserId());
            return Results.Ok(new { user = u is null ? null : Me(u) });
        });

        // ------------------------------------------------------------ catalog: categories and tags
        var catalog = api.MapGroup("/catalog").RequireAuthorization();
        catalog.MapGet("/categories", (CatalogService s) => s.Categories());
        catalog.MapPost("/categories", (CategoryBody b, CatalogService s) => new { id = s.CreateCategory(b.ParentId, b.Name ?? "") })
            .RequireAuthorization("admin");
        catalog.MapPut("/categories/{id:long}", (long id, CategoryBody b, CatalogService s) =>
        {
            s.UpdateCategory(id, b.Name, b.ParentId, b.ChangeParent == true);
            return Results.Ok();
        }).RequireAuthorization("admin");
        catalog.MapPost("/categories/{id:long}/move", (long id, MoveBody b, CatalogService s) =>
        {
            s.MoveCategory(id, b.Direction);
            return Results.Ok();
        }).RequireAuthorization("admin");
        catalog.MapDelete("/categories/{id:long}", (long id, CatalogService s) =>
        {
            s.DeleteCategory(id);
            return Results.Ok();
        }).RequireAuthorization("admin");

        catalog.MapGet("/tags", (CatalogService s) => s.Tags());
        catalog.MapPost("/tags", (NameBody b, CatalogService s, ClaimsPrincipal u) => new { id = s.CreateTag(b.Name ?? "", u.UserId()) })
            .RequireAuthorization("tagger");
        catalog.MapPut("/tags/{id:long}", (long id, NameBody b, CatalogService s) =>
        {
            s.RenameTag(id, b.Name ?? "");
            return Results.Ok();
        }).RequireAuthorization("admin");
        catalog.MapDelete("/tags/{id:long}", (long id, CatalogService s) =>
        {
            s.DeleteTag(id);
            return Results.Ok();
        }).RequireAuthorization("admin");

        // ------------------------------------------------------------ courses (learners)
        var courses = api.MapGroup("/courses").RequireAuthorization();
        courses.MapGet("/", (string? q, long? categoryId, string? tag, CourseService s, ClaimsPrincipal u) => s.Search(u.UserId(), q, categoryId, tag));
        courses.MapGet("/subscribed", (CourseService s, ClaimsPrincipal u) => s.Subscribed(u.UserId()));
        courses.MapGet("/{id:long}", (long id, CourseService s, ClaimsPrincipal u) =>
        {
            var k = s.ForOverview(id, u.UserId(), u.Role());
            var canRead = k.CreatorId == u.UserId() || u.Role() == Roles.Admin || (k.Published && s.IsSubscribed(id, u.UserId()));
            return new { course = s.Summary(id, u.UserId()), outline = s.Outline(k), canRead, isCreator = k.CreatorId == u.UserId() };
        });
        courses.MapPost("/{id:long}/subscription", (long id, CourseService s, ClaimsPrincipal u) =>
        {
            if (u.Role() != Roles.EndUser) throw AppException.Forbidden("Only learner accounts subscribe to courses.");
            s.Subscribe(id, u.UserId(), true);
            return Results.Ok();
        });
        courses.MapDelete("/{id:long}/subscription", (long id, CourseService s, ClaimsPrincipal u) =>
        {
            s.Subscribe(id, u.UserId(), false);
            return Results.Ok();
        });
        courses.MapGet("/{id:long}/pages/{**rel}", (long id, string rel, CourseService s, ClaimsPrincipal u) =>
            s.Page(s.ForReading(id, u.UserId(), u.Role()), rel));
        courses.MapGet("/{id:long}/files/{**rel}", (long id, string rel, string name, CourseService s, ClaimsPrincipal u, HttpContext http) =>
        {
            var path = s.FilePath(s.ForReading(id, u.UserId(), u.Role()), rel, name) ?? throw AppException.NotFound("This file doesn't exist.");
            http.Response.Headers.XContentTypeOptions = "nosniff";
            return Results.File(path, ContentTypeOf(name), Path.GetFileName(path), enableRangeProcessing: true);
        });

        // ------------------------------------------------------------ studio (content creators)
        var studio = api.MapGroup("/studio/courses").RequireAuthorization("creator");
        studio.MapGet("/", (CourseService s, ClaimsPrincipal u) => s.ByCreator(u.UserId()));
        studio.MapPost("/", async (CourseInput b, CourseService s, ClaimsPrincipal u) => new { id = await s.Create(u.UserId(), b) });
        studio.MapGet("/{id:long}", (long id, CourseService s, ClaimsPrincipal u) =>
        {
            var k = s.ForEditing(id, u.UserId());
            return new { course = s.Summary(id, u.UserId()), outline = s.Outline(k, syncTitles: true) };
        });
        studio.MapPut("/{id:long}", async (long id, CourseInput b, CourseService s, ClaimsPrincipal u) =>
        {
            await s.Update(id, u.UserId(), b);
            return Results.Ok();
        });
        studio.MapDelete("/{id:long}", async (long id, CourseService s, ClaimsPrincipal u) =>
        {
            await s.Delete(id, u.UserId());
            return Results.Ok();
        });
        studio.MapPost("/{id:long}/nodes", async (long id, NodeBody b, CourseService s, ClaimsPrincipal u) =>
            new { path = await s.AddNode(id, u.UserId(), b.Parent ?? "", b.Kind ?? "page", b.Title ?? "", b.Markdown ?? "") });
        studio.MapGet("/{id:long}/nodes/{**rel}", (long id, string rel, CourseService s, ClaimsPrincipal u) =>
            s.Page(s.ForEditing(id, u.UserId()), rel));
        studio.MapPut("/{id:long}/nodes/{**rel}", async (long id, string rel, PageBody b, CourseService s, ClaimsPrincipal u) =>
        {
            await s.SavePage(id, u.UserId(), rel, b.Title, b.Markdown);
            return Results.Ok();
        });
        studio.MapDelete("/{id:long}/nodes/{**rel}", async (long id, string rel, CourseService s, ClaimsPrincipal u) =>
        {
            await s.DeleteNode(id, u.UserId(), rel);
            return Results.Ok();
        });
        studio.MapPost("/{id:long}/move", async (long id, MoveNodeBody b, CourseService s, ClaimsPrincipal u) =>
            new { path = await s.MoveNode(id, u.UserId(), b.Path ?? "", b.Direction) });
        studio.MapPost("/{id:long}/files/{**rel}", async (long id, string rel, HttpRequest req, CourseService s, ClaimsPrincipal u) =>
        {
            var form = await req.ReadFormAsync();
            foreach (var f in form.Files)
            {
                await using var stream = f.OpenReadStream();
                await s.SaveFile(id, u.UserId(), rel, f.FileName, stream);
            }
            return Results.Ok(new { saved = form.Files.Count });
        });
        studio.MapDelete("/{id:long}/files/{**rel}", async (long id, string rel, string name, CourseService s, ClaimsPrincipal u) =>
        {
            await s.DeleteFile(id, u.UserId(), rel, name);
            return Results.Ok();
        });

        // ------------------------------------------------------------ admin
        api.MapGet("/admin/users", (UserService users) =>
            users.List().Select(x => new { x.Id, x.Email, x.Role, hasPassword = x.PasswordHash != null, x.CreatedAt }))
            .RequireAuthorization("admin");

        api.MapFallback(() => Results.NotFound(new { error = "No such API." }));
    }

    static readonly FileExtensionContentTypeProvider Types = new();
    static readonly HashSet<string> Active = new(StringComparer.OrdinalIgnoreCase) { "text/html", "image/svg+xml", "text/xml", "application/xml", "application/xhtml+xml", "application/javascript", "text/javascript" };

    /// <summary>Attachments are always served as downloads; anything a browser could run is served as plain text.</summary>
    static string ContentTypeOf(string name)
    {
        if (!Types.TryGetContentType(name, out var type)) return "text/plain; charset=utf-8";
        if (Active.Contains(type) || type.Contains("script") || type.Contains("html") || type.Contains("xml")) return "text/plain; charset=utf-8";
        return type;
    }
}
