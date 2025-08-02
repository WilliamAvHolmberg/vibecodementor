using Microsoft.EntityFrameworkCore;
using Source.Features.Habits.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Habits.Commands;

public record CreateHabitCommand(
    string Name,
    string UserId,
    string? Description = null
) : ICommand<Result<CreateHabitResponse>>;

public record CreateHabitResponse(
    Guid HabitId,
    string Name,
    string? Description,
    DateTime CreatedAt
);

public class CreateHabitHandler : ICommandHandler<CreateHabitCommand, Result<CreateHabitResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CreateHabitHandler> _logger;

    public CreateHabitHandler(ApplicationDbContext context, ILogger<CreateHabitHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<CreateHabitResponse>> Handle(CreateHabitCommand request, CancellationToken cancellationToken)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Name))
                return Result.Failure<CreateHabitResponse>("Habit name is required");

            if (request.Name.Length > 100)
                return Result.Failure<CreateHabitResponse>("Habit name too long (max 100 characters)");

            var existingHabit = await _context.Habits
                .FirstOrDefaultAsync(h => h.Name.ToLower() == request.Name.ToLower() && h.UserId == request.UserId && h.IsActive, cancellationToken);

            if (existingHabit != null)
                return Result.Failure<CreateHabitResponse>("Habit with this name already exists");

            var habit = new Habit
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Description = request.Description?.Trim(),
                UserId = request.UserId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Habits.Add(habit);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("✅ Habit created: {HabitName} for user {UserId}", habit.Name, request.UserId);

            var response = new CreateHabitResponse(
                habit.Id,
                habit.Name,
                habit.Description,
                habit.CreatedAt
            );

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to create habit {HabitName} for user {UserId}", request.Name, request.UserId);
            return Result.Failure<CreateHabitResponse>("Failed to create habit");
        }
    }
} 