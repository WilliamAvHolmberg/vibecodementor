namespace Source.Infrastructure.Services.Email;

/// <summary>
/// Offline-first email service that logs emails to console
/// Perfect for development - no external dependencies!
/// </summary>
public class ConsoleEmailService : IEmailService
{
    private readonly ILogger<ConsoleEmailService> _logger;

    public ConsoleEmailService(ILogger<ConsoleEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        var message = new EmailMessage(to, subject, TextBody: body);
        return SendEmailAsync(message, cancellationToken);
    }

    public Task SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("📧 EMAIL SENT (Console Mode)");
        _logger.LogInformation("To: {To}", message.To);
        _logger.LogInformation("Subject: {Subject}", message.Subject);
        
        if (!string.IsNullOrEmpty(message.HtmlBody))
        {
            _logger.LogInformation("HTML Body: {HtmlBody}", message.HtmlBody);
        }
        
        if (!string.IsNullOrEmpty(message.TextBody))
        {
            _logger.LogInformation("Text Body: {TextBody}", message.TextBody);
        }

        if (message.TemplateData?.Any() == true)
        {
            _logger.LogInformation("Template Data: {TemplateData}", 
                string.Join(", ", message.TemplateData.Select(kv => $"{kv.Key}={kv.Value}")));
        }

        _logger.LogInformation("📧 EMAIL END");

        // Simulate async work
        return Task.Delay(100, cancellationToken);
    }
} 