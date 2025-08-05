using System.ComponentModel.DataAnnotations;

namespace Source.Features.ATA.Models;

public class ATAStatusHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid ATARequestId { get; set; }
    
    [Required]
    public ATAStatus Status { get; set; }
    
    [MaxLength(2000)]
    public string? Comment { get; set; }
    
    [Required]
    public string ChangedBy { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string ChangedByName { get; set; } = string.Empty;
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    public int SubmissionRound { get; set; } = 1;
    
    // Navigation property
    public ATARequest ATARequest { get; set; } = null!;
}