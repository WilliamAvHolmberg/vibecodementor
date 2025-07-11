using System.ComponentModel.DataAnnotations;

namespace Source.Features.Kanban.Models;

/// <summary>
/// Kanban board entity - user-specific boards for task management
/// Part of the Kanban feature vertical slice
/// </summary>
public class KanbanBoard
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    /// <summary>
    /// UTC timestamp - always store in UTC for global consistency
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// UTC timestamp for last update
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Current active chat session ID for this board
    /// </summary>
    public Guid? CurrentSessionId { get; set; }
    
    // Navigation properties
    public virtual ICollection<KanbanColumn> Columns { get; set; } = new List<KanbanColumn>();
    public virtual ICollection<KanbanTask> Tasks { get; set; } = new List<KanbanTask>();
    public virtual ICollection<KanbanChatSession> ChatSessions { get; set; } = new List<KanbanChatSession>();
} 