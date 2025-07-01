namespace Source.Infrastructure.Services.Email;

/// <summary>
/// Email service abstraction for sending emails
/// </summary>
public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);
    Task SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default);
}

/// <summary>
/// Email message model
/// </summary>
public record EmailMessage(
    string To,
    string Subject,
    string? HtmlBody = null,
    string? TextBody = null,
    Dictionary<string, string>? TemplateData = null
); 