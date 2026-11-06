namespace Calamar.ELearning.Infrastructure;

/// <summary>An error whose message is meant for the person using the app.</summary>
public sealed class AppException(int status, string message) : Exception(message)
{
    public int Status { get; } = status;

    public static AppException BadRequest(string m) => new(400, m);
    public static AppException Unauthorized(string m) => new(401, m);
    public static AppException Forbidden(string m = "You are not allowed to do that.") => new(403, m);
    public static AppException NotFound(string m = "Not found.") => new(404, m);
    public static AppException Conflict(string m) => new(409, m);
}
