using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Source.Features.Users.Commands;
using Source.Features.Users.Queries;
using Source.Infrastructure.AuthorizationModels;
using Source.Infrastructure.AuthorizationExtensions;
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
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var query = new GetAllUsersQuery(page, pageSize, search);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    [HttpPost]
    [EnableRateLimiting("EmailPolicy")]
    public async Task<ActionResult<CreateUserResponse>> CreateUser([FromBody] CreateUserRequest request)
    {
        var command = new CreateUserCommand(request.Email, request.FirstName, request.LastName, request.Roles);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return CreatedAtAction(nameof(GetUser), new { id = result.Value.UserId }, result.Value);
    }

    /// <summary>
    /// Update user information - users can update their own profile, SuperAdmins can update any user
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<UpdateUserResponse>> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        // Users can only update themselves, unless they're SuperAdmin
        if (currentUserId != id && !User.HasSuperAdminPrivileges())
            return Forbid();

        var command = new UpdateUserCommand(id, request.FirstName, request.LastName, request.Email, request.Roles, User);
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

    /// <summary>
    /// Assign role to user - SuperAdmin only
    /// </summary>
    [HttpPost("{id}/roles")]
    [Authorize(Roles = RoleConstants.SuperAdmin)]
    public async Task<ActionResult> AssignUserRole(string id, [FromBody] AssignRoleRequest request)
    {
        var command = new AssignUserRoleCommand(id, request.Role);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(new { message = $"Role {request.Role} assigned successfully" });
    }

    /// <summary>
    /// Get user roles - SuperAdmin or own profile
    /// </summary>
    [HttpGet("{id}/roles")]
    public async Task<ActionResult<UserRolesResponse>> GetUserRoles(string id)
    {
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        // Users can view their own roles, or SuperAdmin can view any user's roles
        if (currentUserId != id && !User.HasSuperAdminPrivileges())
            return Forbid();

        var query = new GetUserRolesQuery(id);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return NotFound(new { error = result.Error });

        return Ok(result.Value);
    }
}

public class CreateUserRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    public List<string>? Roles { get; set; }
}

public class UpdateUserRequest
{
    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    public List<string>? Roles { get; set; }
}

public class AssignRoleRequest
{
    [Required]
    public ApplicationRole Role { get; set; }
} 