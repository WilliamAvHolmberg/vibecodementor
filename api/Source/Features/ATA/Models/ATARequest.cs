using System.ComponentModel.DataAnnotations;

namespace Source.Features.ATA.Models;

/// <summary>
/// ÄTA (Ändrings-, Tilläggs- och Avgående arbete) request entity
/// Represents change, addition, or deduction work requests in construction projects
/// Part of the ATA feature vertical slice
/// </summary>
public class ATARequest
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string ProjectName { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string RecipientEmail { get; set; } = string.Empty;
    
    [Required]
    public string RequestedBy { get; set; } = string.Empty;
    
    public ATAStatus Status { get; set; } = ATAStatus.Draft;
    
    public decimal TotalCost { get; set; }
    
    /// <summary>
    /// UTC timestamp - always store in UTC for global consistency
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// UTC timestamp for last update
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public List<ATALineItem> LineItems { get; set; } = new();
    public List<ATAComment> Comments { get; set; } = new();
    public List<ATAStatusHistory> StatusHistory { get; set; } = new();
}

/// <summary>
/// Status enumeration for ÄTA requests
/// </summary>
public enum ATAStatus
{
    Draft,
    Submitted,
    UnderReview,
    Approved,
    Rejected
} 