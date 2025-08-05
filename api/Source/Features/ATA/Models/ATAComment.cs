using System.ComponentModel.DataAnnotations;

namespace Source.Features.ATA.Models;

/// <summary>
/// Comment/communication thread for ÄTA requests
/// Enables back-and-forth discussion between requester and recipient
/// </summary>
public class ATAComment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid ATARequestId { get; set; }
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    public string AuthorName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;
    
    /// <summary>
    /// UTC timestamp - always store in UTC for global consistency
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public ATARequest ATARequest { get; set; } = null!;
} 