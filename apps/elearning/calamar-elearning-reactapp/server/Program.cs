using Calamar.ELearning.Data;
using Calamar.ELearning.Endpoints;
using Calamar.ELearning.Infrastructure;
using Calamar.ELearning.Notes;
using Calamar.ELearning.Services;
using Dapper;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

DefaultTypeMap.MatchNamesWithUnderscores = true;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory, // appsettings.json next to the binaries, whatever the current directory
});

builder.Services.Configure<AppOptions>(builder.Configuration.GetSection("App"));
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("Smtp"));
var appOptions = builder.Configuration.GetSection("App").Get<AppOptions>() ?? new AppOptions();
Directory.CreateDirectory(appOptions.LocalPath);
Directory.CreateDirectory(appOptions.RemotePath);

var dataProtection = builder.Services.AddDataProtection()
    .SetApplicationName("calamar-elearning")
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(appOptions.LocalPath, "keys")));
if (OperatingSystem.IsWindows()) dataProtection.ProtectKeysWithDpapi(); // the cookie keys are encrypted at rest for this Windows user

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(o =>
    {
        o.Cookie.Name = "calamar.auth";
        o.Cookie.HttpOnly = true;
        o.Cookie.SameSite = SameSiteMode.Strict;
        o.Cookie.SecurePolicy = CookieSecurePolicy.Always; // only ever sent over HTTPS
        o.SlidingExpiration = true;
        o.ExpireTimeSpan = TimeSpan.FromDays(14);
        // an API: answer with status codes instead of redirecting to a login page
        o.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; };
        o.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = 403; return Task.CompletedTask; };
    });
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("admin", p => p.RequireRole(Roles.Admin))
    .AddPolicy("creator", p => p.RequireRole(Roles.Creator))
    .AddPolicy("tagger", p => p.RequireRole(Roles.Creator, Roles.Admin));

const long MaxUpload = 50L * 1024 * 1024;
builder.Services.Configure<FormOptions>(o => o.MultipartBodyLengthLimit = MaxUpload);
builder.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = MaxUpload);

builder.Services.AddSingleton<Db>();
builder.Services.AddSingleton(sp => new NoteStore(sp.GetRequiredService<IOptions<AppOptions>>().Value.CoursesNotebookPath));
builder.Services.AddSingleton<EmailSender>();
builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<CatalogService>();
builder.Services.AddSingleton<CourseService>();
builder.Services.AddSingleton<Seeder>();

var app = builder.Build();

await app.Services.GetRequiredService<Seeder>().Run();

app.Use(async (ctx, next) =>
{
    try { await next(); }
    catch (AppException e) when (!ctx.Response.HasStarted)
    {
        ctx.Response.StatusCode = e.Status;
        await ctx.Response.WriteAsJsonAsync(new { error = e.Message });
    }
    catch (BadHttpRequestException e) when (!ctx.Response.HasStarted)
    {
        ctx.Response.StatusCode = e.StatusCode;
        await ctx.Response.WriteAsJsonAsync(new { error = "The request could not be read." });
    }
});

// Plain HTTP only redirects to HTTPS. HSTS is left out in development, and ASP.NET Core never sends it for localhost.
if (!app.Environment.IsDevelopment()) app.UseHsts();
app.UseHttpsRedirection();

// The React client (built into the ClientFolder) is served by this same server.
var clientPath = appOptions.ClientPath;
if (Directory.Exists(clientPath))
{
    var files = new PhysicalFileProvider(clientPath);
    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = files });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = files });
}
else app.Logger.LogWarning("The client folder {Folder} doesn't exist; only the API is served.", clientPath);

app.UseAuthentication();
app.UseAuthorization();

Api.Map(app);

app.MapFallback(async ctx =>
{
    var index = Path.Combine(clientPath, "index.html");
    if (!File.Exists(index)) { ctx.Response.StatusCode = 404; return; }
    ctx.Response.ContentType = "text/html; charset=utf-8";
    ctx.Response.Headers.CacheControl = "no-cache";
    await ctx.Response.SendFileAsync(index);
});

app.Logger.LogInformation("Local data folder: {Local}; remote data folder: {Remote}", appOptions.LocalPath, appOptions.RemotePath);
app.Run();
