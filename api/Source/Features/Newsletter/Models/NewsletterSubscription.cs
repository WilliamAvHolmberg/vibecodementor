using System.ComponentModel.DataAnnotations;

namespace Source.Features.Newsletter.Models;

/// <summary>
/// Newsletter subscription entity
/// Part of the Newsletter feature vertical slice
/// </summary>
public class NewsletterSubscription
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(254)] // RFC 5321 email max length
    public string Email { get; set; } = string.Empty;
    
    /// <summary>
    /// UTC timestamp - always store in UTC for global consistency
    /// Frontend will convert to user's local timezone for display
    /// </summary>
    public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsActive { get; set; } = true;
    
    // For potential future features
    public DateTime? UnsubscribedAt { get; set; }
    public string? UnsubscribeReason { get; set; }
} 