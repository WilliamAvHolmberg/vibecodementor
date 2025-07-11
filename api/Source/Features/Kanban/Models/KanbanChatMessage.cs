using System.ComponentModel.DataAnnotations;

namespace Source.Features.Kanban.Models;

/// <summary>
/// Chat message entity - individual messages within a kanban chat session
/// Stores user, assistant, and system messages for LLM conversations
/// Part of the Kanban feature vertical slice
/// </summary>
public class KanbanChatMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid SessionId { get; set; }
    
    [Required]
    public string UserId { get; set; } = string.Empty;
    
    /// <summary>
    /// Message role: "user", "assistant", or "system"
    /// </summary>
    [Required]
    [MaxLength(50)]
    public string Role { get; set; } = string.Empty;
    
    /// <summary>
    /// Message content - can be large for assistant responses
    /// </summary>
    [Required]
    public string Content { get; set; } = string.Empty;
    
    /// <summary>
    /// Tool call ID for tool call response messages (null for regular messages)
    /// Links assistant responses back to specific tool calls
    /// </summary>
    [MaxLength(200)]
    public string? ToolCallId { get; set; }
    
    /// <summary>
    /// UTC timestamp - always store in UTC for global consistency
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// Order within the session for proper message sequencing
    /// </summary>
    public int Order { get; set; }
    
    // Navigation properties
    public virtual KanbanChatSession Session { get; set; } = null!;
} 