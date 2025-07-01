using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.Analytics.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Analytics.Commands;

public record RegisterVisitCommand(
    string VisitorId,
    string UserAgent,
    string Path,
    string? Referrer = null
) : ICommand<Result<VisitRegistrationResult>>;

public record VisitRegistrationResult(
    bool IsNewVisit,
    long TotalVisits,
    int TodayVisits
);

public class RegisterVisitHandler : ICommandHandler<RegisterVisitCommand, Result<VisitRegistrationResult>>
{
    private readonly ApplicationDbContext _context;
    private readonly IMediator _mediator;
    private readonly ILogger<RegisterVisitHandler> _logger;

    public RegisterVisitHandler(
        ApplicationDbContext context,
        IMediator mediator,
        ILogger<RegisterVisitHandler> logger)
    {
        _context = context;
        _mediator = mediator;
        _logger = logger;
    }

    public async Task<Result<VisitRegistrationResult>> Handle(RegisterVisitCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd");
            var isNewVisit = false;
            
            // Check if visit already exists for today
            var existingVisit = await _context.Visits
                .FirstOrDefaultAsync(v => v.VisitorId == request.VisitorId && v.Date == today, cancellationToken);

            if (existingVisit == null)
            {
                // Create new visit for today
                var visit = new Visit
                {
                    VisitorId = request.VisitorId,
                    Date = today,
                    UserAgent = request.UserAgent,
                    Path = request.Path,
                    Referrer = request.Referrer ?? string.Empty,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Visits.Add(visit);
                await _context.SaveChangesAsync(cancellationToken);
                
                isNewVisit = true;

                // Publish domain event
                await _mediator.Publish(new VisitRegisteredEvent(request.VisitorId, visit.CreatedAt), cancellationToken);
            }

            // Get current stats
            var totalVisits = await _context.Visits.CountAsync(cancellationToken);
            
            // If new visit, increment daily counter atomically
            int todayVisits = 0;
            if (isNewVisit)
            {
                // PostgreSQL UPSERT with atomic increment - handles concurrency perfectly
                todayVisits = await _context.Database.SqlQuery<int>($@"
                    INSERT INTO ""DailyVisitStats"" (""Date"", ""VisitCount"", ""LastUpdated"") 
                    VALUES ({today}, 1, {DateTime.UtcNow})
                    ON CONFLICT (""Date"") 
                    DO UPDATE SET 
                        ""VisitCount"" = ""DailyVisitStats"".""VisitCount"" + 1,
                        ""LastUpdated"" = {DateTime.UtcNow}
                    RETURNING ""VisitCount""").SingleAsync(cancellationToken);
            }
            else
            {
                // Get current day's visit count
                var currentStats = await _context.DailyVisitStats.FindAsync(new object[] { today }, cancellationToken);
                todayVisits = currentStats?.VisitCount ?? 0;
            }

            return Result<VisitRegistrationResult>.Success(new VisitRegistrationResult(
                isNewVisit,
                totalVisits,
                todayVisits
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to register visit for visitor: {VisitorId}", request.VisitorId);
            return Result.Failure<VisitRegistrationResult>("Failed to register visit");
        }
    }


}

// Simple domain event
public record VisitRegisteredEvent(string VisitorId, DateTime OccurredAt) : INotification; 