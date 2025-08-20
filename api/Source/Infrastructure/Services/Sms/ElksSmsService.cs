using System.Net.Http.Headers;
using System.Text;

namespace Source.Infrastructure.Services.Sms;

/// <summary>
/// 46elks SMS provider implementation
/// </summary>
public class ElksSmsService : ISmsService
{
    private const string BaseAddress = "https://api.46elks.com/a1/";
    private readonly HttpClient _httpClient;
    private readonly ILogger<ElksSmsService> _logger;
    private readonly string _username;
    private readonly string _password;
    private readonly string _defaultFrom;

    public ElksSmsService(HttpClient httpClient, IConfiguration configuration, ILogger<ElksSmsService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;

        _username = configuration["Sms:Elks:Username"]
            ?? throw new InvalidOperationException("Sms:Elks:Username configuration is required when using Elks provider");
        _password = configuration["Sms:Elks:Password"]
            ?? throw new InvalidOperationException("Sms:Elks:Password configuration is required when using Elks provider");
        _defaultFrom = configuration["Sms:Elks:From"]
            ?? throw new InvalidOperationException("Sms:Elks:From configuration is required when using Elks provider");

        _httpClient.BaseAddress = new Uri(BaseAddress);
        var byteArray = Encoding.ASCII.GetBytes($"{_username}:{_password}");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
    }

    public Task SendSmsAsync(string to, string text, CancellationToken cancellationToken = default)
    {
        var message = new SmsMessage(to, text, _defaultFrom);
        return SendSmsAsync(message, cancellationToken);
    }

    public async Task SendSmsAsync(SmsMessage message, CancellationToken cancellationToken = default)
    {
        ValidateMessage(message);

        var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            {"to", message.To},
            {"from", message.From ?? _defaultFrom},
            {"message", message.Text}
        });

        _logger.LogInformation("📱 Sending SMS via 46elks to: {To}", message.To);

        var response = await _httpClient.PostAsync("SMS", content, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("❌ Failed to send SMS via 46elks. Status: {StatusCode}, Body: {Body}", (int)response.StatusCode, responseBody);
            throw new InvalidOperationException($"46elks SMS send failed with status {(int)response.StatusCode}: {responseBody}");
        }

        _logger.LogInformation("✅ SMS sent successfully via 46elks. Response: {Body}", responseBody);
    }

    private static void ValidateMessage(SmsMessage message)
    {
        if (string.IsNullOrWhiteSpace(message.To))
            throw new ArgumentException("Recipient number is required", nameof(message.To));
        if (string.IsNullOrWhiteSpace(message.Text))
            throw new ArgumentException("Message text is required", nameof(message.Text));

        // Basic E.164 sanity check: starts with '+', followed by 8-15 digits (country + subscriber)
        // 46elks expects E.164 or local formatting depending on account; we enforce E.164 for consistency
        if (!System.Text.RegularExpressions.Regex.IsMatch(message.To, "^\\+[1-9]\\d{7,14}$"))
        {
            throw new ArgumentException("Recipient number must be in E.164 format, e.g. +46701234567", nameof(message.To));
        }

        // 46elks: message max length typically 160 GSM-7, longer allowed via concatenation; keep minimal: allow up to 1600 chars
        if (message.Text.Length > 1600)
        {
            throw new ArgumentException("Message text too long (max 1600 characters)", nameof(message.Text));
        }
    }
}


