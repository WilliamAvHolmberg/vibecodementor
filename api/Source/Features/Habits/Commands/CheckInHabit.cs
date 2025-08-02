using Microsoft.EntityFrameworkCore;
using Source.Features.Habits.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Habits.Commands;

public record CheckInHabitCommand(
    Guid HabitId,
    string UserId,
    bool IsSuccess,
    string? Reflection = null
) : ICommand<Result<CheckInHabitResponse>>;

public record CheckInHabitResponse(
    Guid CheckInId,
    Guid HabitId,
    DateOnly Date,
    bool IsSuccess,
    string? Reflection,
    DateTime CompletedAt
);

public class CheckInHabitHandler : ICommandHandler<CheckInHabitCommand, Result<CheckInHabitResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CheckInHabitHandler> _logger;

    public CheckInHabitHandler(ApplicationDbContext context, ILogger<CheckInHabitHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<CheckInHabitResponse>> Handle(CheckInHabitCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var habit = await _context.Habits
                .FirstOrDefaultAsync(h => h.Id == request.HabitId && h.UserId == request.UserId && h.IsActive, cancellationToken);

            if (habit == null)
                return Result.Failure<CheckInHabitResponse>("Habit not found or not accessible");

            var existingCheckIn = await _context.HabitCheckIns
                .FirstOrDefaultAsync(hc => hc.HabitId == request.HabitId && hc.UserId == request.UserId && hc.Date == today, cancellationToken);

            if (existingCheckIn != null)
                return Result.Failure<CheckInHabitResponse>("Habit already logged today");

            if (!request.IsSuccess && string.IsNullOrWhiteSpace(request.Reflection))
                return Result.Failure<CheckInHabitResponse>("Reflection is required when habit is not completed");

            var checkIn = new HabitCheckIn
            {
                Id = Guid.NewGuid(),
                HabitId = request.HabitId,
                UserId = request.UserId,
                Date = today,
                IsCompleted = request.IsSuccess,
                Reflection = request.Reflection?.Trim(),
                CompletedAt = DateTime.UtcNow
            };

            _context.HabitCheckIns.Add(checkIn);
            await _context.SaveChangesAsync(cancellationToken);

            var logIcon = request.IsSuccess ? "✅" : "❌";
            _logger.LogInformation("{LogIcon} Habit logged: {HabitName} (Success: {IsSuccess}) for user {UserId}", 
                logIcon, habit.Name, request.IsSuccess, request.UserId);

            var response = new CheckInHabitResponse(
                checkIn.Id,
                checkIn.HabitId,
                checkIn.Date,
                checkIn.IsCompleted,
                checkIn.Reflection,
                checkIn.CompletedAt
            );

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to check in habit {HabitId} for user {UserId}", request.HabitId, request.UserId);
            return Result.Failure<CheckInHabitResponse>("Failed to complete habit check-in");
        }
    }
} 