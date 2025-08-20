namespace Source.Infrastructure.Services.Sms;

/// <summary>
/// SMS service abstraction for sending text messages
/// </summary>
public interface ISmsService
{
	Task SendSmsAsync(string to, string text, CancellationToken cancellationToken = default);
	Task SendSmsAsync(SmsMessage message, CancellationToken cancellationToken = default);
}

/// <summary>
/// SMS message model
/// </summary>
public record SmsMessage(
	string To,
	string Text,
	string? From = null
);


