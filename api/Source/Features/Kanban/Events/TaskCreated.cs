using Source.Shared.Events;

namespace Source.Features.Kanban.Events;

/// <summary>
/// Domain event raised when a kanban task is created
/// Events should be named in past tense to represent something that happened
/// </summary>
public record TaskCreated(
    Guid BoardId,
    Guid TaskId,
    string Title,
    string ColumnName,
    string UserId,
    DateTime OccurredAt
) : IDomainEvent; 