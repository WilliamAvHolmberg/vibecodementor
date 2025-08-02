using System.ComponentModel.DataAnnotations;

namespace Source.Features.Habits.Models;
public class HabitCheckIn
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid HabitId { get; set; }
    
    [Required]
    public string UserId { get; set; } = string.Empty;

    public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    
    public bool IsCompleted { get; set; } = true; // Always true when record exists
    
    [MaxLength(1000)]
    public string? Reflection { get; set; }
    
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public Habit Habit { get; set; } = null!;
}