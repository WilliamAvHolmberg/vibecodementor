using System.ComponentModel.DataAnnotations;

namespace Source.Features.Analytics.Models;

public class Visit
{
    [MaxLength(50)]
    public string VisitorId { get; set; } = string.Empty; // UUID from frontend
    
    [MaxLength(10)]
    public string Date { get; set; } = string.Empty; // Format: yyyy-MM-dd
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [MaxLength(500)]
    public string UserAgent { get; set; } = string.Empty;
    
    [MaxLength(200)]
    public string Referrer { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string Path { get; set; } = string.Empty;
    
    // Optional metadata
    [MaxLength(50)]
    public string? Country { get; set; }
    
    [MaxLength(100)]
    public string? City { get; set; }
}

public class DailyVisitStats
{
    [Key]
    public string Date { get; set; } = string.Empty; // Format: yyyy-MM-dd
    
    public int VisitCount { get; set; } = 0;
    
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
} 