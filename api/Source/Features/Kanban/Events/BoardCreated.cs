using Source.Shared.Events;

namespace Source.Features.Kanban.Events;

/// <summary>
/// Domain event raised when a kanban board is created
/// </summary>
public record BoardCreated(
    Guid BoardId,
    string Title,
    string UserId,
    DateTime OccurredAt
) : IDomainEvent; 