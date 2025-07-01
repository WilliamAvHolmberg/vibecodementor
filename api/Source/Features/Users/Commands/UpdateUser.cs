using Microsoft.AspNetCore.Identity;
using Source.Features.Users.Models;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Users.Commands;

public record UpdateUserCommand(string UserId, string? FirstName, string? LastName, string? Email) : ICommand<Result<UpdateUserResponse>>;

public record UpdateUserResponse(string UserId, string Email, string FullName, DateTime UpdatedAt);

public class UpdateUserHandler : ICommandHandler<UpdateUserCommand, Result<UpdateUserResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<UpdateUserHandler> _logger;

    public UpdateUserHandler(UserManager<User> userManager, ILogger<UpdateUserHandler> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result<UpdateUserResponse>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
        {
            return Result.Failure<UpdateUserResponse>("User not found");
        }

        if (user.IsDeleted)
        {
            return Result.Failure<UpdateUserResponse>("Cannot update deleted user");
        }

        // Update properties
        if (!string.IsNullOrWhiteSpace(request.FirstName))
            user.FirstName = request.FirstName;
        
        if (!string.IsNullOrWhiteSpace(request.LastName))
            user.LastName = request.LastName;

        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
        {
            var emailExists = await _userManager.FindByEmailAsync(request.Email);
            if (emailExists != null && emailExists.Id != user.Id)
            {
                return Result.Failure<UpdateUserResponse>("Email already in use");
            }
            
            user.Email = request.Email;
            user.UserName = request.Email;
        }

        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Result.Failure<UpdateUserResponse>($"Update failed: {errors}");
        }

        _logger.LogInformation("Successfully updated user {UserId}", user.Id);

        var response = new UpdateUserResponse(user.Id, user.Email!, user.FullName, user.UpdatedAt);
        return Result.Success(response);
    }
} 