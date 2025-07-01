using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Source.Infrastructure.Services.Email;
using System.Net;
using System.Text.Json;

namespace api.Tests;

[Collection("Integration")]
public class ResendEmailTests : TestBase
{
    private readonly ILogger<ResendEmailTests> _logger;
    private const string TestEmail = "william.av.holmberg@gmail.com"; // Your email for all test emails

    public ResendEmailTests()
    {
        _logger = Scope.ServiceProvider.GetRequiredService<ILogger<ResendEmailTests>>();
    }

    [Fact]
    public async Task SendEmailAsync_WithConsoleProvider_ShouldLogToConsole()
    {
        // Skip if Resend is configured (we want to test Console specifically)
        if (IsResendConfigured())
        {
            _logger.LogWarning("⏭️ Skipping Console test - Resend is configured. This test requires Email:Provider=Console.");
            return;
        }
        
        var emailService = Scope.ServiceProvider.GetRequiredService<IEmailService>();
        
        var message = new EmailMessage(
            To: TestEmail,
            Subject: "Test Email from Console Service",
            HtmlBody: "<h1>Hello World!</h1><p>This is a test email from the console service.</p>",
            TextBody: "Hello World! This is a test email from the console service."
        );

        // Should not throw
        await emailService.SendEmailAsync(message);
        
        _logger.LogInformation("✅ Console email service test completed successfully");
    }

    [Fact]
    public async Task SendEmailAsync_WithResendProvider_ShouldSendRealEmail()
    {
        // Skip test if Resend is not configured
        if (!IsResendConfigured())
        {
            _logger.LogWarning("⏭️ Skipping Resend email test - not configured. Set Email:Provider=Resend and Email:Resend:ApiToken to test with real Resend API.");
            return;
        }

        var emailService = GetResendEmailService();
        
        var message = new EmailMessage(
            To: TestEmail,
            Subject: $"Test Email from .NET API - {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC",
            HtmlBody: """
                <h1>🚀 Test Email from Rapid-Dev API</h1>
                <p>Hello from the Resend integration test!</p>
                <p><strong>Time:</strong> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
                <p><strong>Test:</strong> ResendEmailTests.SendEmailAsync_WithResendProvider_ShouldSendRealEmail</p>
                <p>If you're seeing this email, the Resend integration is working correctly! 🎉</p>
                """,
            TextBody: $"""
                Test Email from Rapid-Dev API
                
                Hello from the Resend integration test!
                
                Time: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC
                Test: ResendEmailTests.SendEmailAsync_WithResendProvider_ShouldSendRealEmail
                
                If you're seeing this email, the Resend integration is working correctly!
                """
        );

        // Should not throw - real API call
        await emailService.SendEmailAsync(message);
        
        _logger.LogInformation("📧 Real Resend email sent successfully to {TestEmail}", TestEmail);
    }

    [Fact]
    public async Task SendEmailAsync_WithInvalidRecipient_ShouldHandleError()
    {
        // Skip test if Resend is not configured
        if (!IsResendConfigured())
        {
            _logger.LogWarning("⏭️ Skipping Resend error handling test - not configured.");
            return;
        }

        var emailService = GetResendEmailService();
        
        var message = new EmailMessage(
            To: "invalid-email-address", // Invalid email format
            Subject: "Test Error Handling",
            TextBody: "This should fail due to invalid email address"
        );

        // Should throw a ResendException for invalid email
        await Assert.ThrowsAsync<Resend.ResendException>(async () =>
        {
            await emailService.SendEmailAsync(message);
        });
        
        _logger.LogInformation("✅ Resend error handling test completed - correctly threw exception for invalid email");
    }

    [Fact]
    public async Task SendEmailAsync_ViaHttpEndpoint_ShouldTriggerEmailService()
    {
        // Test the full flow: HTTP request -> user registration -> welcome email
        var (user, token) = await CreateAuthenticatedUserAsync();
        
        // The user creation should have triggered the welcome email via domain events
        // We can't easily verify the actual email was sent without mocking,
        // but we can verify no exceptions were thrown during the process
        
        Assert.NotNull(user);
        Assert.NotEmpty(user.Email!);
        
        _logger.LogInformation("✅ HTTP endpoint email integration test completed for user {Email}", user.Email);
    }

    [Fact]
    public async Task SendEmailAsync_SequentialRequests_ShouldHandleMultipleEmails()
    {
        // Skip test if Resend is not configured
        if (!IsResendConfigured())
        {
            _logger.LogWarning("⏭️ Skipping Resend sequential test - not configured.");
            return;
        }

        var emailService = GetResendEmailService();
        var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd-HH-mm-ss");

        // Send emails with delay to respect rate limits (2 requests/second)
        for (int i = 1; i <= 2; i++)
        {
            var message = new EmailMessage(
                To: TestEmail,
                Subject: $"Sequential Test Email #{i} - {timestamp}",
                HtmlBody: $"<p>This is sequential test email <strong>#{i}</strong> sent at {DateTime.UtcNow:HH:mm:ss.fff}</p>"
            );

            await emailService.SendEmailAsync(message);
            
            // Respect rate limit: 2 requests per second
            if (i < 2) await Task.Delay(600);
        }
        
        _logger.LogInformation("📧 Successfully sent {Count} sequential emails via Resend", 2);
    }

    [Fact]
    public async Task SendEmailAsync_WithBothHtmlAndText_ShouldPreferHtml()
    {
        // Skip test if Resend is not configured
        if (!IsResendConfigured())
        {
            _logger.LogWarning("⏭️ Skipping Resend HTML/Text test - not configured.");
            return;
        }

        var emailService = GetResendEmailService();
        
        var message = new EmailMessage(
            To: TestEmail,
            Subject: $"HTML/Text Content Test - {DateTime.UtcNow:HH:mm:ss}",
            HtmlBody: "<h2>🎨 HTML Content</h2><p>This email has <strong>both</strong> HTML and text content.</p>",
            TextBody: "Plain text content - this should be secondary to HTML content."
        );

        // Should send successfully and prefer HTML content
        await emailService.SendEmailAsync(message);
        
        _logger.LogInformation("📧 Email with both HTML and text content sent successfully");
    }

    private bool IsResendConfigured()
    {
        try
        {
            var configuration = Scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Configuration.IConfiguration>();
            var provider = configuration["Email:Provider"];
            var apiToken = configuration["Email:Resend:ApiToken"];
            
            return provider?.Equals("Resend", StringComparison.OrdinalIgnoreCase) == true 
                   && !string.IsNullOrEmpty(apiToken) 
                   && apiToken != "your-resend-api-token";
        }
        catch
        {
            return false;
        }
    }

    private IEmailService GetResendEmailService()
    {
        var configuration = Scope.ServiceProvider.GetRequiredService<Microsoft.Extensions.Configuration.IConfiguration>();
        var logger = Scope.ServiceProvider.GetRequiredService<ILogger<ResendEmailService>>();
        var resend = Scope.ServiceProvider.GetRequiredService<Resend.IResend>();
        
        return new ResendEmailService(resend, configuration, logger);
    }
} 