using System.ComponentModel.DataAnnotations;

namespace Source.Features.Chat.Models;

/// <summary>
/// Persistent chat message entity
/// Part of the Chat feature vertical slice
/// </summary>
public class ChatMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    [MaxLength(100)]
    public string UserName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;
    
    /// <summary>
    /// UTC timestamp - always store in UTC for global consistency
    /// Frontend will convert to user's local timezone for display
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    [MaxLength(100)]
    public string ConnectionId { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string MessageType { get; set; } = "user"; // "user", "system", "notification"
    
    public bool IsSystemMessage { get; set; } = false;
    
    // For potential future features
    public string? ReplyToMessageId { get; set; }
    public bool IsEdited { get; set; } = false;
    /// <summary>
    /// UTC timestamp for when message was edited (if applicable)
    /// </summary>
    public DateTime? EditedAt { get; set; }
} 