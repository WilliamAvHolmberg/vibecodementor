using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Source.Features.Authentication.Commands;
using Source.Features.Authentication.Queries;
using System.ComponentModel.DataAnnotations;

namespace Source.Features.Authentication.Controllers;

[ApiController]
[Route("api/[controller]")]
[Tags("Authentication")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IMediator mediator, ILogger<AuthController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user
    /// </summary>
    [HttpPost("register")]
    [EnableRateLimiting("EmailPolicy")]  // 🚨 Rate limited: 3 per minute
    [ProducesResponseType<RegisterUserResponse>(200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<RegisterUserResponse>> Register([FromBody] RegisterRequest request)
    {
        var command = new RegisterUserCommand(request.Email, request.Password);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("User registered successfully: {Email}", request.Email);
            return Ok(result.Value);
        }

        _logger.LogWarning("Registration failed for {Email}: {Error}", request.Email, result.Error);
        return BadRequest(new { error = result.Error });
    }

    /// <summary>
    /// Login user and get JWT token
    /// </summary>
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]  // 🚨 Rate limited: 5 per minute - Perfect for OTP!
    [ProducesResponseType<LoginUserResponse>(200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<LoginUserResponse>> Login([FromBody] LoginRequest request)
    {
        var command = new LoginUserCommand(request.Email, request.Password);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("User logged in successfully: {Email}", request.Email);
            return Ok(result.Value);
        }

        _logger.LogWarning("Login failed for {Email}: {Error}", request.Email, result.Error);
        return BadRequest(new { error = result.Error });
    }

    /// <summary>
    /// Send OTP code to email address
    /// </summary>
    [HttpPost("send-otp")]
    [EnableRateLimiting("EmailPolicy")]  // 🚨 Rate limited: 3 per minute
    [ProducesResponseType<SendOtpResponse>(200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<SendOtpResponse>> SendOtp([FromBody] SendOtpRequest request)
    {
        var command = new SendOtpCommand(request.Email);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            _logger.LogInformation("OTP sent successfully to: {Email}", request.Email);
            return Ok(result.Value);
        }

        _logger.LogWarning("Failed to send OTP to {Email}: {Error}", request.Email, result.Error);
        return BadRequest(new { error = result.Error });
    }

    /// <summary>
    /// Verify OTP code and set authentication cookie
    /// </summary>
    [HttpPost("verify-otp")]
    [EnableRateLimiting("AuthPolicy")]  // 🚨 Rate limited: 5 per minute
    [ProducesResponseType<VerifyOtpCookieResponse>(200)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<VerifyOtpCookieResponse>> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var command = new VerifyOtpCommand(request.Email, request.OtpCode);
        var result = await _mediator.Send(command);

        if (result.IsSuccess)
        {
            // Set HTTP-only authentication cookie
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Use HTTPS in production
                SameSite = SameSiteMode.Lax,
                Expires = result.Value.ExpiresAt,
                Path = "/"
            };

            Response.Cookies.Append("auth-token", result.Value.Token, cookieOptions);

            _logger.LogInformation("OTP verified and auth cookie set for: {Email}", request.Email);

            // Return success without exposing the token
            var response = new VerifyOtpCookieResponse("Authentication successful", result.Value.Email);
            return Ok(response);
        }

        _logger.LogWarning("OTP verification failed for {Email}: {Error}", request.Email, result.Error);
        return BadRequest(new { error = result.Error });
    }

    /// <summary>
    /// Get current authenticated user information
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType<CurrentUserResponse>(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<CurrentUserResponse>> GetMe()
    {
        var query = new GetCurrentUserQuery(User);
        var result = await _mediator.Send(query);

        if (result.IsSuccess)
        {
            return Ok(result.Value);
        }

        _logger.LogWarning("Failed to get current user: {Error}", result.Error);
        return BadRequest(new { error = result.Error });
    }

    /// <summary>
    /// Logout user by clearing authentication cookie
    /// </summary>
    [HttpPost("logout")]
    [ProducesResponseType(200)]
    public ActionResult<object> Logout()
    {
        // Clear the authentication cookie
        Response.Cookies.Delete("auth-token", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Path = "/"
        });

        _logger.LogInformation("User logged out - auth cookie cleared");
        return Ok(new { message = "Logged out successfully" });
    }
}

/// <summary>
/// Request model for user registration
/// </summary>
public record RegisterRequest(
    [Required] [EmailAddress] string Email,
    [Required] [MinLength(6)] string Password
);

/// <summary>
/// Request model for user login
/// </summary>
public record LoginRequest(
    [Required] [EmailAddress] string Email,
    [Required] string Password
);

/// <summary>
/// Request model for sending OTP
/// </summary>
public record SendOtpRequest(
    [Required] [EmailAddress] string Email
);

/// <summary>
/// Request model for verifying OTP
/// </summary>
public record VerifyOtpRequest(
    [Required] [EmailAddress] string Email,
    [Required] [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be exactly 6 digits")] string OtpCode
);

/// <summary>
/// Response for OTP verification with cookie
/// </summary>
public record VerifyOtpCookieResponse(string Message, string Email); 