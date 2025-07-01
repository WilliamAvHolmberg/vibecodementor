using Microsoft.AspNetCore.Identity;
using Source.Features.Users.Models;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Users.Commands;

public record DeleteUserCommand(string UserId) : ICommand<Result<DeleteUserResponse>>;

public record DeleteUserResponse(string UserId, DateTime DeletedAt);

public class DeleteUserHandler : ICommandHandler<DeleteUserCommand, Result<DeleteUserResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<DeleteUserHandler> _logger;

    public DeleteUserHandler(UserManager<User> userManager, ILogger<DeleteUserHandler> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result<DeleteUserResponse>> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
        {
            return Result.Failure<DeleteUserResponse>("User not found");
        }

        if (user.IsDeleted)
        {
            return Result.Failure<DeleteUserResponse>("User already deleted");
        }

        // Soft delete
        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Result.Failure<DeleteUserResponse>($"Delete failed: {errors}");
        }

        _logger.LogInformation("Successfully soft deleted user {UserId}", user.Id);

        var response = new DeleteUserResponse(user.Id, user.DeletedAt.Value);
        return Result.Success(response);
    }
} 