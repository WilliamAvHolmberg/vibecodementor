using Source.Shared.Events;

namespace Source.Features.Analytics.Models;

public class VisitEvent : IDomainEvent
{
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public DateTime OccurredAt { get; init; } = DateTime.UtcNow;
    public string IpAddress { get; init; } = string.Empty;
    public string UserAgent { get; init; } = string.Empty;
    public string SessionId { get; init; } = string.Empty;
    public string Referrer { get; init; } = string.Empty;
    public string Path { get; init; } = string.Empty;
    public bool IsUnique { get; init; } = true;
}

public class VisitStats
{
    public long TotalVisits { get; set; }
    public long TodayVisits { get; set; }
    public long UniqueVisitors { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
} 