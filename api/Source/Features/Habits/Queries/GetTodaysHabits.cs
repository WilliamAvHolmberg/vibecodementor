using Microsoft.EntityFrameworkCore;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Habits.Queries;

public record GetTodaysHabitsQuery(string UserId) : IQuery<Result<List<TodaysHabitDto>>>;

public record TodaysHabitDto(
    Guid HabitId,
    string Name,
    string? Description,
    bool? IsCompleted,
    string? Reflection,
    DateTime? CompletedAt
);

public class GetTodaysHabitsHandler : IQueryHandler<GetTodaysHabitsQuery, Result<List<TodaysHabitDto>>>
{
    private readonly ApplicationDbContext _context;

    public GetTodaysHabitsHandler(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<TodaysHabitDto>>> Handle(GetTodaysHabitsQuery request, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        // Simple query 1: Get user's active habits
        var habits = await _context.Habits
            .Where(h => h.UserId == request.UserId && h.IsActive)
            .OrderBy(h => h.Name)
            .ToListAsync(cancellationToken);

        // Simple query 2: Get today's check-ins for this user
        var todaysCheckIns = await _context.HabitCheckIns
            .Where(hc => hc.UserId == request.UserId && hc.Date == today)
            .ToListAsync(cancellationToken);

        // Join in memory (fast with small datasets)
        var todaysHabits = habits.Select(habit =>
        {
            var checkIn = todaysCheckIns.FirstOrDefault(c => c.HabitId == habit.Id);
            return new TodaysHabitDto(
                habit.Id,
                habit.Name,
                habit.Description,
                checkIn?.IsCompleted, // null = not logged, true = success, false = failed
                checkIn?.Reflection,
                checkIn?.CompletedAt
            );
        }).ToList();

        return Result.Success(todaysHabits);
    }
} 