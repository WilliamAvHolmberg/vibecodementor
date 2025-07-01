using Microsoft.AspNetCore.Identity;
using Source.Features.Users.Models;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Users.Commands;

public record CreateUserCommand(string Email, string Password, string? FirstName = null, string? LastName = null) : ICommand<Result<CreateUserResponse>>;

public record CreateUserResponse(string UserId, string Email, string FullName);

public class CreateUserCommandHandler : ICommandHandler<CreateUserCommand, Result<CreateUserResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<CreateUserCommandHandler> _logger;

    public CreateUserCommandHandler(UserManager<User> userManager, ILogger<CreateUserCommandHandler> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result<CreateUserResponse>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Result.Failure<CreateUserResponse>("User with this email already exists");
        }

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,
            FirstName = request.FirstName,
            LastName = request.LastName
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Result.Failure<CreateUserResponse>($"User creation failed: {errors}");
        }

        _logger.LogInformation("Successfully created user {Email} with ID {UserId}", request.Email, user.Id);

        var response = new CreateUserResponse(user.Id, user.Email!, user.FullName);
        return Result.Success(response);
    }
} 