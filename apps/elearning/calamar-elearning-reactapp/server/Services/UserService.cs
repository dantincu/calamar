using System.Net.Mail;
using Calamar.ELearning.Data;
using Calamar.ELearning.Infrastructure;
using Dapper;
using Microsoft.Extensions.Options;

namespace Calamar.ELearning.Services;

public static class Roles
{
    public const string Admin = "admin";
    public const string Creator = "creator";
    public const string EndUser = "enduser";
}

public sealed class UserRow
{
    public long Id { get; set; }
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";
    public string? PasswordHash { get; set; }
    public string CreatedAt { get; set; } = "";
}

public sealed class UserService(Db db, EmailSender email, IOptions<AppOptions> options, ILogger<UserService> log)
{
    AppOptions O => options.Value;

    public static string NormalizeEmail(string? value)
    {
        var e = (value ?? "").Trim();
        try
        {
            var parsed = new MailAddress(e);
            if (parsed.Address != e || !e.Contains('@') || e.Length > 254) throw new FormatException();
        }
        catch (FormatException) { throw AppException.BadRequest("Please enter a valid e-mail address."); }
        return e.ToLowerInvariant();
    }

    public UserRow? Find(string email)
    {
        using var c = db.Open();
        return c.QuerySingleOrDefault<UserRow>("SELECT * FROM users WHERE email=@email", new { email });
    }

    public UserRow? Get(long id)
    {
        using var c = db.Open();
        return c.QuerySingleOrDefault<UserRow>("SELECT * FROM users WHERE id=@id", new { id });
    }

    public List<UserRow> List()
    {
        using var c = db.Open();
        return c.Query<UserRow>("SELECT * FROM users ORDER BY role, email").ToList();
    }

    /// <summary>The admin, one content creator and one end user exist from the start, with no password: each is asked for one at first login.</summary>
    public void EnsureSeedUsers()
    {
        using var c = db.Open();
        foreach (var (mail, role) in new[] { (O.AdminEmail, Roles.Admin), (O.SeedCreatorEmail, Roles.Creator), (O.SeedEndUserEmail, Roles.EndUser) })
        {
            c.Execute("INSERT OR IGNORE INTO users(email, role, password_hash, created_at) VALUES(@email, @role, NULL, @now)",
                new { email = mail.ToLowerInvariant(), role, now = Db.Now() });
        }
    }

    public (bool exists, bool needsPassword, string? role) Check(string emailAddress)
    {
        var u = Find(NormalizeEmail(emailAddress));
        return u is null ? (false, false, null) : (true, u.PasswordHash is null, u.Role);
    }

    public UserRow Login(string emailAddress, string password)
    {
        var u = Find(NormalizeEmail(emailAddress));
        if (u is null || !Passwords.Verify(password ?? "", u.PasswordHash))
            throw AppException.Unauthorized(u?.PasswordHash is null && u != null
                ? "This account has no password yet; please choose one."
                : "Wrong e-mail address or password.");
        return u;
    }

    /// <summary>The first login of an account created without a password.</summary>
    public UserRow SetInitialPassword(string emailAddress, string password)
    {
        var mail = NormalizeEmail(emailAddress);
        Passwords.Validate(password);
        using var c = db.Open();
        var n = c.Execute("UPDATE users SET password_hash=@hash WHERE email=@mail AND password_hash IS NULL",
            new { hash = Passwords.Hash(password), mail });
        if (n == 0) throw AppException.Conflict("This account already has a password.");
        log.LogInformation("Initial password set for {Email}", mail);
        return Find(mail)!;
    }

    public UserRow Register(string emailAddress, string password, string role)
    {
        var mail = NormalizeEmail(emailAddress);
        if (role is not (Roles.Creator or Roles.EndUser))
            throw AppException.BadRequest("Only content creator and learner accounts can be created.");
        if (string.Equals(mail, O.AdminEmail, StringComparison.OrdinalIgnoreCase))
            throw AppException.Forbidden("This address is reserved.");
        Passwords.Validate(password);
        using var c = db.Open();
        if (c.ExecuteScalar<long>("SELECT COUNT(*) FROM users WHERE email=@mail", new { mail }) > 0)
            throw AppException.Conflict("An account with this e-mail address exists already. Sign in instead, or use \"Forgot password\".");
        c.Execute("INSERT INTO users(email, role, password_hash, created_at) VALUES(@mail, @role, @hash, @now)",
            new { mail, role, hash = Passwords.Hash(password), now = Db.Now() });
        return Find(mail)!;
    }

    /// <summary>Sends a random code to the account's address. Says nothing about whether the account exists.</summary>
    public async Task RequestReset(string emailAddress)
    {
        var u = Find(NormalizeEmail(emailAddress));
        if (u is null) return;
        var code = Passwords.NewCode();
        using (var c = db.Open())
        {
            c.Execute("UPDATE reset_codes SET used=1 WHERE user_id=@id AND used=0", new { id = u.Id });
            c.Execute("INSERT INTO reset_codes(user_id, code_hash, expires_at) VALUES(@id, @hash, @expires)",
                new { id = u.Id, hash = Passwords.Hash(code), expires = DateTime.UtcNow.AddMinutes(O.ResetCodeMinutes).ToString("o") });
        }
        await email.Send(u.Email, "Your Calamar e-learning password code",
            $"Hello,\n\nYour code for choosing a new password is: {code}\n\nIt is valid for {O.ResetCodeMinutes} minutes. " +
            "If you didn't ask for it, you can ignore this message.\n\nCalamar e-learning");
    }

    public UserRow ResetPassword(string emailAddress, string code, string password)
    {
        var u = Find(NormalizeEmail(emailAddress)) ?? throw AppException.BadRequest("The code is wrong or has expired.");
        Passwords.Validate(password);
        using var c = db.Open();
        var row = c.QuerySingleOrDefault<(long id, string codeHash, string expiresAt, long attempts)>(
            "SELECT id, code_hash, expires_at, attempts FROM reset_codes WHERE user_id=@id AND used=0 ORDER BY id DESC LIMIT 1",
            new { id = u.Id });
        if (row.id == 0 || DateTime.Parse(row.expiresAt).ToUniversalTime() < DateTime.UtcNow || row.attempts >= 5)
            throw AppException.BadRequest("The code is wrong or has expired. Ask for a new one.");
        if (!Passwords.Verify((code ?? "").Trim(), row.codeHash))
        {
            c.Execute("UPDATE reset_codes SET attempts=attempts+1 WHERE id=@id", new { row.id });
            throw AppException.BadRequest("The code is wrong or has expired.");
        }
        c.Execute("UPDATE reset_codes SET used=1 WHERE id=@id", new { row.id });
        c.Execute("UPDATE users SET password_hash=@hash WHERE id=@id", new { hash = Passwords.Hash(password), id = u.Id });
        log.LogInformation("Password reset for {Email}", u.Email);
        return u;
    }
}
