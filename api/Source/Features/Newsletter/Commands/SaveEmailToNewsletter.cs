using Microsoft.EntityFrameworkCore;
using Source.Features.Newsletter.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;
using System.ComponentModel.DataAnnotations;

namespace Source.Features.Newsletter.Commands;

public record SaveEmailToNewsletterCommand(string Email) : ICommand<Result<SaveEmailToNewsletterResponse>>;

public record SaveEmailToNewsletterResponse(string Message, bool IsNewSubscription);

public class SaveEmailToNewsletterCommandHandler : ICommandHandler<SaveEmailToNewsletterCommand, Result<SaveEmailToNewsletterResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<SaveEmailToNewsletterCommandHandler> _logger;

    public SaveEmailToNewsletterCommandHandler(ApplicationDbContext context, ILogger<SaveEmailToNewsletterCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<SaveEmailToNewsletterResponse>> Handle(SaveEmailToNewsletterCommand request, CancellationToken cancellationToken)
    {
        // Validate email format
        if (!IsValidEmail(request.Email))
        {
            return Result.Failure<SaveEmailToNewsletterResponse>("Invalid email format");
        }

        // Normalize email (trim and lowercase)
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        
        // Check if email already exists
        var existingSubscription = await _context.NewsletterSubscriptions
            .FirstOrDefaultAsync(x => x.Email == normalizedEmail, cancellationToken);

        if (existingSubscription != null)
        {
            if (existingSubscription.IsActive)
            {
                _logger.LogInformation("Email already subscribed to newsletter: {Email}", normalizedEmail);
                return Result.Success(new SaveEmailToNewsletterResponse("Thanks for subscribing!", false));
            }
            else
            {
                // Reactivate existing subscription
                existingSubscription.IsActive = true;
                existingSubscription.SubscribedAt = DateTime.UtcNow;
                existingSubscription.UnsubscribedAt = null;
                existingSubscription.UnsubscribeReason = null;
                
                await _context.SaveChangesAsync(cancellationToken);
                
                _logger.LogInformation("Reactivated newsletter subscription for: {Email}", normalizedEmail);
                return Result.Success(new SaveEmailToNewsletterResponse("Welcome back! You're subscribed again.", true));
            }
        }

        // Create new subscription
        var subscription = new NewsletterSubscription
        {
            Email = normalizedEmail,
            SubscribedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.NewsletterSubscriptions.Add(subscription);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successfully created newsletter subscription for: {Email}", normalizedEmail);

        return Result.Success(new SaveEmailToNewsletterResponse("Thanks for subscribing!", true));
    }

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            var emailAttribute = new EmailAddressAttribute();
            return emailAttribute.IsValid(email);
        }
        catch
        {
            return false;
        }
    }
} 