using System.ComponentModel.DataAnnotations;

namespace Source.Features.Kanban.Models;

/// <summary>
/// Kanban column entity - represents TODO, IN_PROGRESS, DONE columns
/// Part of the Kanban feature vertical slice
/// </summary>
public class KanbanColumn
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid BoardId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    public int Order { get; set; }
    
    /// <summary>
    /// Indicates if this column represents completed tasks
    /// </summary>
    public bool IsCompleted { get; set; } = false;
    
    /// <summary>
    /// UTC timestamp - always store in UTC for global consistency
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual KanbanBoard Board { get; set; } = null!;
    public virtual ICollection<KanbanTask> Tasks { get; set; } = new List<KanbanTask>();
} 