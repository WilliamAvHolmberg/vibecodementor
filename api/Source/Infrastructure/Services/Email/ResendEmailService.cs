using Resend;

namespace Source.Infrastructure.Services.Email;

/// <summary>
/// Production email service using Resend for real email delivery
/// Professional email delivery with proper error handling and logging
/// </summary>
public class ResendEmailService : IEmailService
{
    private readonly IResend _resend;
    private readonly string _fromEmail;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(IResend resend, IConfiguration configuration, ILogger<ResendEmailService> logger)
    {
        _resend = resend;
        _logger = logger;
        _fromEmail = configuration["Email:Resend:FromEmail"] 
            ?? throw new InvalidOperationException("Email:Resend:FromEmail configuration is required");
    }

    public async Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default)
    {
        var message = new EmailMessage(to, subject, TextBody: body);
        await SendEmailAsync(message, cancellationToken);
    }

    public async Task SendEmailAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("📧 Sending email via Resend to: {To}, Subject: {Subject}", message.To, message.Subject);

            var emailMessage = new global::Resend.EmailMessage
            {
                From = _fromEmail,
                Subject = message.Subject
            };
            
            emailMessage.To.Add(message.To);

            // Set body content - prefer HTML if available, fallback to text
            if (!string.IsNullOrEmpty(message.HtmlBody))
            {
                emailMessage.HtmlBody = message.HtmlBody;
            }
            else if (!string.IsNullOrEmpty(message.TextBody))
            {
                emailMessage.TextBody = message.TextBody;
            }
            else
            {
                throw new ArgumentException("Either HtmlBody or TextBody must be provided");
            }

            var response = await _resend.EmailSendAsync(emailMessage);
            
            _logger.LogInformation("✅ Email sent successfully via Resend. Response: {Response}", response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to send email via Resend to {To}: {Error}", message.To, ex.Message);
            throw;
        }
    }
} 