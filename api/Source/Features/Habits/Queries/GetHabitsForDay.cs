using Microsoft.EntityFrameworkCore;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Habits.Queries;

public record GetHabitsForDayQuery(string UserId, DateOnly Date) : IQuery<Result<List<HabitForDayDto>>>;

public record HabitForDayDto(
    Guid HabitId,
    string Name,
    string? Description,
    bool? IsCompleted,
    string? Reflection,
    DateTime? CompletedAt
);

public class GetHabitsForDayHandler : IQueryHandler<GetHabitsForDayQuery, Result<List<HabitForDayDto>>>
{
    private readonly ApplicationDbContext _context;

    public GetHabitsForDayHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<HabitForDayDto>>> Handle(GetHabitsForDayQuery request, CancellationToken cancellationToken)
    {
        var targetDate = request.Date;

        // Simple query 1: Get user's active habits
        var habits = await _context.Habits
            .Where(h => h.UserId == request.UserId && h.IsActive)
            .OrderBy(h => h.Name)
            .ToListAsync(cancellationToken);

        // Simple query 2: Get check-ins for the target date
        var dateCheckIns = await _context.HabitCheckIns
            .Where(hc => hc.UserId == request.UserId && hc.Date == targetDate)
            .ToListAsync(cancellationToken);

        // Join in memory (fast with small datasets)
        var habitsForDay = habits.Select(habit =>
        {
            var checkIn = dateCheckIns.FirstOrDefault(c => c.HabitId == habit.Id);
            return new HabitForDayDto(
                habit.Id,
                habit.Name,
                habit.Description,
                checkIn?.IsCompleted, // null = not logged, true = success, false = failed
                checkIn?.Reflection,
                checkIn?.CompletedAt
            );
        }).ToList();

        return Result.Success(habitsForDay);
    }
} 