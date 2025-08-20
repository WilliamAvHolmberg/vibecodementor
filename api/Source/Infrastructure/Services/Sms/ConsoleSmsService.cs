namespace Source.Infrastructure.Services.Sms;

/// <summary>
/// Offline-first SMS service that logs messages to console
/// </summary>
public class ConsoleSmsService : ISmsService
{
	private readonly ILogger<ConsoleSmsService> _logger;

	public ConsoleSmsService(ILogger<ConsoleSmsService> logger)
	{
		_logger = logger;
	}

	public Task SendSmsAsync(string to, string text, CancellationToken cancellationToken = default)
	{
		var message = new SmsMessage(to, text);
		return SendSmsAsync(message, cancellationToken);
	}

	public Task SendSmsAsync(SmsMessage message, CancellationToken cancellationToken = default)
	{
		_logger.LogInformation("📱 SMS SENT (Console Mode)");
		_logger.LogInformation("To: {To}", message.To);
		if (!string.IsNullOrWhiteSpace(message.From))
		{
			_logger.LogInformation("From: {From}", message.From);
		}
		_logger.LogInformation("Text: {Text}", message.Text);

		// Simulate async work
		return Task.Delay(50, cancellationToken);
	}
}


