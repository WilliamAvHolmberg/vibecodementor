using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Source.Features.Users.Commands;
using Source.Features.Users.Queries;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace Source.Features.Users.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[EnableRateLimiting("GeneralPolicy")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IMediator mediator, ILogger<UsersController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Get user by ID - users can only view their own profile
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponse>> GetUser(string id)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId != id)
            return Forbid();

        var query = new GetUserQuery(id);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Get current user's profile
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<UserResponse>> GetCurrentUser()
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized("Invalid token");

        var query = new GetUserQuery(currentUserId);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Get all users with pagination and search - TODO: Add admin role requirement
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<GetAllUsersResponse>> GetAllUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        // TODO: Implement admin role check when roles are added
        // For now, commented out for security - only allow in admin endpoints
        return Forbid("This endpoint requires admin privileges - not yet implemented");

        // if (page < 1) page = 1;
        // if (pageSize < 1 || pageSize > 100) pageSize = 10;

        // var query = new GetAllUsersQuery(page, pageSize, search);
        // var result = await _mediator.Send(query);

        // if (!result.IsSuccess)
        //     return BadRequest(new { error = result.Error });

        // return Ok(result.Value);
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    [HttpPost]
    [EnableRateLimiting("EmailPolicy")]
    public async Task<ActionResult<CreateUserResponse>> CreateUser([FromBody] CreateUserRequest request)
    {
        var command = new CreateUserCommand(request.Email, request.Password, request.FirstName, request.LastName);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return CreatedAtAction(nameof(GetUser), new { id = result.Value.UserId }, result.Value);
    }

    /// <summary>
    /// Update user information - users can only update their own profile
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<UpdateUserResponse>> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId != id)
            return Forbid();

        var command = new UpdateUserCommand(id, request.FirstName, request.LastName, request.Email);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Soft delete user - users can only delete their own account
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<DeleteUserResponse>> DeleteUser(string id)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId != id)
            return Forbid();

        var command = new DeleteUserCommand(id);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }
}

public class CreateUserRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MinLength(6)]
    public required string Password { get; set; }

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }
}

public class UpdateUserRequest
{
    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [EmailAddress]
    public string? Email { get; set; }
} 