using Source.Features.Users.Events;
using Source.Infrastructure.Services.Email;
using Source.Shared.Events;

namespace Source.Features.Users.EventHandlers;

/// <summary>
/// Event handler that sends a welcome email when a user is created
/// Handler names should describe what they do and when they trigger
/// </summary>
public class SendWelcomeEmailHandler : IEventHandler<UserCreated>
{
    private readonly IEmailService _emailService;
    private readonly ILogger<SendWelcomeEmailHandler> _logger;

    public SendWelcomeEmailHandler(IEmailService emailService, ILogger<SendWelcomeEmailHandler> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    public async Task Handle(UserCreated notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Sending welcome email to user {UserId} at {Email}", 
            notification.UserId, notification.Email);

        // Use our clean, generic email service!
        await _emailService.SendEmailAsync(
            notification.Email,
            "Welcome to our API! 🚀",
            $"Hi there!\n\nWelcome to our awesome API platform!\n\nUser ID: {notification.UserId}\n\nGet started by exploring our features!\n\nBest regards,\nThe API Team",
            cancellationToken);

        _logger.LogInformation("Welcome email sent successfully to {Email}", notification.Email);
    }
} 