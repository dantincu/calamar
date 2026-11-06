using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace Calamar.ELearning.Infrastructure;

public sealed class EmailSender(IOptions<SmtpOptions> smtp, IOptions<AppOptions> app, ILogger<EmailSender> log)
{
    public async Task Send(string to, string subject, string body)
    {
        var o = smtp.Value;
        if (string.IsNullOrWhiteSpace(o.Host))
        {
            // No SMTP server configured: drop the message into the outbox folder so it can still be read.
            var outbox = Path.Combine(app.Value.LocalPath, "outbox");
            Directory.CreateDirectory(outbox);
            var file = Path.Combine(outbox, $"{DateTime.UtcNow:yyyyMMdd-HHmmss-fff}-{to}.txt");
            await File.WriteAllTextAsync(file, $"To: {to}\nSubject: {subject}\n\n{body}\n");
            log.LogWarning("SMTP is not configured; the e-mail to {To} was written to {File}", to, file);
            return;
        }
        var from = string.IsNullOrWhiteSpace(o.From) ? o.User : o.From;
        using var message = new MailMessage(new MailAddress(from, o.FromName), new MailAddress(to))
        {
            Subject = subject,
            Body = body,
        };
        using var client = new SmtpClient(o.Host, o.Port)
        {
            EnableSsl = o.EnableSsl,
            Credentials = string.IsNullOrEmpty(o.User) ? null : new NetworkCredential(o.User, o.Password),
        };
        await client.SendMailAsync(message);
        log.LogInformation("E-mail sent to {To}: {Subject}", to, subject);
    }
}
