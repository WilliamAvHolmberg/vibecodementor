using Microsoft.EntityFrameworkCore;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Habits.Commands;

public record RemoveHabitCommand(
    Guid HabitId,
    string UserId
) : ICommand<Result<RemoveHabitResponse>>;

public record RemoveHabitResponse(
    Guid HabitId,
    string Name,
    DateTime RemovedAt
);

public class RemoveHabitHandler : ICommandHandler<RemoveHabitCommand, Result<RemoveHabitResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RemoveHabitHandler> _logger;

    public RemoveHabitHandler(ApplicationDbContext context, ILogger<RemoveHabitHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<RemoveHabitResponse>> Handle(RemoveHabitCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var habit = await _context.Habits
                .FirstOrDefaultAsync(h => h.Id == request.HabitId && h.UserId == request.UserId && h.IsActive, cancellationToken);

            if (habit == null)
                return Result.Failure<RemoveHabitResponse>("Habit not found or already removed");

            // Soft delete by setting IsActive to false
            habit.IsActive = false;
            
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("✅ Habit soft deleted: {HabitName} for user {UserId}", habit.Name, request.UserId);

            var response = new RemoveHabitResponse(
                habit.Id,
                habit.Name,
                DateTime.UtcNow
            );

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to remove habit {HabitId} for user {UserId}", request.HabitId, request.UserId);
            return Result.Failure<RemoveHabitResponse>("Failed to remove habit");
        }
    }
}
