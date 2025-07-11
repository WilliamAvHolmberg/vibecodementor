using System.ComponentModel.DataAnnotations;

namespace Source.Features.Kanban.Models;

/// <summary>
/// Chat session entity - one session per kanban board for LLM conversations
/// Part of the Kanban feature vertical slice
/// </summary>
public class KanbanChatSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid BoardId { get; set; }
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    /// <summary>
    /// UTC timestamp - always store in UTC for global consistency
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// UTC timestamp for last message
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual KanbanBoard Board { get; set; } = null!;
    public virtual ICollection<KanbanChatMessage> Messages { get; set; } = new List<KanbanChatMessage>();
} 