using Calamar.ELearning.Infrastructure;
using Dapper;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Options;

namespace Calamar.ELearning.Data;

public sealed class Db(IOptions<AppOptions> options)
{
    readonly string _connectionString = new SqliteConnectionStringBuilder
    {
        DataSource = options.Value.DatabasePath,
        ForeignKeys = true,
    }.ToString();

    public SqliteConnection Open()
    {
        var c = new SqliteConnection(_connectionString);
        c.Open();
        return c;
    }

    public void Migrate()
    {
        Directory.CreateDirectory(Path.GetDirectoryName(options.Value.DatabasePath)!);
        using var c = Open();
        c.Execute("PRAGMA journal_mode=WAL;");
        c.Execute("""
            CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);

            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                role TEXT NOT NULL CHECK (role IN ('admin','creator','enduser')),
                password_hash TEXT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS reset_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                code_hash TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                used INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                parent_id INTEGER NULL REFERENCES categories(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                sort_order INTEGER NOT NULL DEFAULT 0
            );
            CREATE UNIQUE INDEX IF NOT EXISTS ux_categories_name ON categories (IFNULL(parent_id, 0), name COLLATE NOCASE);

            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE COLLATE NOCASE,
                created_by INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                creator_id INTEGER NOT NULL REFERENCES users(id),
                note_path TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                category_id INTEGER NULL REFERENCES categories(id) ON DELETE SET NULL,
                published INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS course_tags (
                course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
                PRIMARY KEY (course_id, tag_id)
            );

            CREATE TABLE IF NOT EXISTS subscriptions (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                subscribed_at TEXT NOT NULL,
                PRIMARY KEY (user_id, course_id)
            );
            """);
    }

    public static string Now() => DateTime.UtcNow.ToString("o");

    public string? GetMeta(string key)
    {
        using var c = Open();
        return c.ExecuteScalar<string?>("SELECT value FROM meta WHERE key=@key", new { key });
    }

    public void SetMeta(string key, string value)
    {
        using var c = Open();
        c.Execute("INSERT INTO meta(key,value) VALUES(@key,@value) ON CONFLICT(key) DO UPDATE SET value=excluded.value", new { key, value });
    }
}
