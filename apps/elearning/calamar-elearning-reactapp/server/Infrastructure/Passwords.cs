using System.Security.Cryptography;

namespace Calamar.ELearning.Infrastructure;

/// <summary>Salted PBKDF2-SHA512 hashes (one-way: a password is never stored in a form that can be turned back into it).</summary>
public static class Passwords
{
    const int Iterations = 210_000;
    const int SaltBytes = 16;
    const int HashBytes = 32;

    public static string Hash(string secret)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltBytes);
        var hash = Rfc2898DeriveBytes.Pbkdf2(secret, salt, Iterations, HashAlgorithmName.SHA512, HashBytes);
        return $"pbkdf2-sha512${Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public static bool Verify(string secret, string? stored)
    {
        if (string.IsNullOrEmpty(stored)) return false;
        var parts = stored.Split('$');
        if (parts.Length != 4 || parts[0] != "pbkdf2-sha512" || !int.TryParse(parts[1], out var iterations)) return false;
        var salt = Convert.FromBase64String(parts[2]);
        var expected = Convert.FromBase64String(parts[3]);
        var actual = Rfc2898DeriveBytes.Pbkdf2(secret, salt, iterations, HashAlgorithmName.SHA512, expected.Length);
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }

    public static string Validate(string? password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 8)
            throw AppException.BadRequest("The password must have at least 8 characters.");
        if (password.Length > 200) throw AppException.BadRequest("The password is too long.");
        return password;
    }

    /// <summary>A random numeric code for "forgot password".</summary>
    public static string NewCode() => RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
}
