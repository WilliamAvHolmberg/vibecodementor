using System.ComponentModel.DataAnnotations;

namespace Source.Features.Kanban.Models;

/// <summary>
/// Kanban subtask POCO - stored as JSON in KanbanTask entity
/// Simple structure for POC implementation
/// </summary>
public class KanbanSubtask
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    public bool IsCompleted { get; set; } = false;
    
    /// <summary>
    /// UTC timestamp - always store in UTC for global consistency
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// UTC timestamp for completion (if applicable)
    /// </summary>
    public DateTime? CompletedAt { get; set; }
} 