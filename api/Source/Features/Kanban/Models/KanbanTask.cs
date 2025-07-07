using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace Source.Features.Kanban.Models;

/// <summary>
/// Kanban task entity - represents individual tasks on the board
/// Part of the Kanban feature vertical slice
/// </summary>
public class KanbanTask
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public Guid BoardId { get; set; }
    
    [Required]
    public Guid ColumnId { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
    
    public int Position { get; set; }
    
    /// <summary>
    /// Subtasks stored as JSON - simple approach for POC
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string SubtasksJson { get; set; } = "[]";
    
    /// <summary>
    /// UTC timestamp - always store in UTC for global consistency
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// UTC timestamp for last update
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual KanbanBoard Board { get; set; } = null!;
    public virtual KanbanColumn Column { get; set; } = null!;
    
    /// <summary>
    /// Helper property to work with subtasks as objects
    /// </summary>
    [NotMapped]
    public List<KanbanSubtask> Subtasks
    {
        get
        {
            try
            {
                return JsonSerializer.Deserialize<List<KanbanSubtask>>(SubtasksJson) ?? new List<KanbanSubtask>();
            }
            catch
            {
                return new List<KanbanSubtask>();
            }
        }
        set
        {
            SubtasksJson = JsonSerializer.Serialize(value);
        }
    }
} 