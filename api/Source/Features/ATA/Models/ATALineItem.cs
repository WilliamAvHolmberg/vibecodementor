using System.ComponentModel.DataAnnotations;

namespace Source.Features.ATA.Models;

/// <summary>
/// Individual line item within an ÄTA request
/// Represents a single change, addition, or deduction work item
/// </summary>
public class ATALineItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid ATARequestId { get; set; }
    
    [Required]
    public ATAWorkType Type { get; set; }
    
    [Required]
    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public decimal CostEstimate { get; set; }
    
    [MaxLength(500)]
    public string Comment { get; set; } = string.Empty;
    
    /// <summary>
    /// UTC timestamp - always store in UTC for global consistency
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public ATARequest ATARequest { get; set; } = null!;
}

/// <summary>
/// Type of ÄTA work item (Swedish terminology)
/// </summary>
public enum ATAWorkType
{
    Ändring,    // Change work
    Tillägg,    // Addition work  
    Avgående    // Deduction work
} 