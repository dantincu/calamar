namespace Calamar.ELearning.Infrastructure;

public sealed class AppOptions
{
    public string LocalDataFolder { get; set; } = "../local-data";
    public string RemoteDataFolder { get; set; } = "../remote-data";
    public string ClientFolder { get; set; } = "../client";
    public string AdminEmail { get; set; } = "tincuvd@gmail.com";
    public string SeedCreatorEmail { get; set; } = "dan.tincu.work@gmail.com";
    public string SeedEndUserEmail { get; set; } = "dan.tincu.misc@gmail.com";
    public int ResetCodeMinutes { get; set; } = 15;

    /// <summary>Relative folders are resolved against the folder of the server's binaries.</summary>
    public static string Resolve(string folder) =>
        Path.GetFullPath(Path.IsPathRooted(folder) ? folder : Path.Combine(AppContext.BaseDirectory, folder));

    public string LocalPath => Resolve(LocalDataFolder);
    public string RemotePath => Resolve(RemoteDataFolder);
    public string ClientPath => Resolve(ClientFolder);
    /// <summary>The notebook root holding one note per content creator.</summary>
    public string CoursesNotebookPath => Path.Combine(RemotePath, "c");
    public string DatabasePath => Path.Combine(LocalPath, "calamar-elearning.sqlite");
}

public sealed class SmtpOptions
{
    public string Host { get; set; } = "";
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string User { get; set; } = "";
    public string Password { get; set; } = "";
    public string From { get; set; } = "";
    public string FromName { get; set; } = "Calamar e-learning";
}
