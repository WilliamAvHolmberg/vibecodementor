using Source.Shared.Events;

namespace Source.Features.Users.Events;

/// <summary>
/// Domain event raised when a user is created
/// Events should be named in past tense to represent something that happened
/// </summary>
public record UserCreated(
    string UserId,
    string Email,
    DateTime OccurredAt
) : IDomainEvent; 