using System.ComponentModel.DataAnnotations;

namespace Source.Features.Files.Models;

public class UploadedImage
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string OriginalFileName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string FilePath { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(1000)]
    public string FileUrl { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string ContentType { get; set; } = string.Empty;
    
    public long FileSize { get; set; }
    
    public int Width { get; set; }
    
    public int Height { get; set; }
    
    [MaxLength(450)] // AspNetUsers Id length
    public string? UploadedByUserId { get; set; }
    
    public DateTime UploadedAt { get; set; }
    
    public bool IsPublic { get; set; } = true;
} 