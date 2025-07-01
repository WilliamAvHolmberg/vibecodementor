using Microsoft.AspNetCore.Identity;
using Source.Features.Authentication.Services;
using Source.Features.Users.Models;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Authentication.Commands;

/// <summary>
/// Command to login a user and generate JWT token
/// </summary>
public record LoginUserCommand(string Email, string Password) : ICommand<Result<LoginUserResponse>>;

/// <summary>
/// Response for user login
/// </summary>
public record LoginUserResponse(string Token, string Email, DateTime ExpiresAt);

/// <summary>
/// Handler for user login
/// </summary>
public class LoginUserHandler : ICommandHandler<LoginUserCommand, Result<LoginUserResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<LoginUserHandler> _logger;

    public LoginUserHandler(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IJwtTokenService jwtTokenService,
        ILogger<LoginUserHandler> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    public async Task<Result<LoginUserResponse>> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Attempting login for user: {Email}", request.Email);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            _logger.LogWarning("Login failed: User not found for email {Email}", request.Email);
            return Result.Failure<LoginUserResponse>("Invalid email or password");
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
        {
            _logger.LogWarning("Login failed: Invalid password for user {Email}", request.Email);
            return Result.Failure<LoginUserResponse>("Invalid email or password");
        }

        // Generate JWT token using centralized service
        var (token, expiresAt) = _jwtTokenService.GenerateTokenWithExpiry(user, "password");

        _logger.LogInformation("Successfully logged in user {Email}", request.Email);

        var response = new LoginUserResponse(token, user.Email!, expiresAt);
        return Result.Success(response);
    }
} 