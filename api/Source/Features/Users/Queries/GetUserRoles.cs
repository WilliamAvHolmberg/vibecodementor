using Microsoft.AspNetCore.Identity;
using Source.Features.Users.Models;
using Source.Infrastructure.AuthorizationModels;
using Source.Infrastructure.AuthorizationExtensions;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Users.Queries;

/// <summary>
/// Query to get user roles
/// </summary>
public record GetUserRolesQuery(string UserId) : IQuery<Result<UserRolesResponse>>;

/// <summary>
/// Response for user roles
/// </summary>
public record UserRolesResponse(string UserId, string Email, List<ApplicationRole> Roles);

/// <summary>
/// Handler for getting user roles
/// </summary>
public class GetUserRolesHandler : IQueryHandler<GetUserRolesQuery, Result<UserRolesResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<GetUserRolesHandler> _logger;

    public GetUserRolesHandler(UserManager<User> userManager, ILogger<GetUserRolesHandler> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result<UserRolesResponse>> Handle(GetUserRolesQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting roles for user {UserId}", request.UserId);

        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
        {
            _logger.LogWarning("User not found: {UserId}", request.UserId);
            return Result.Failure<UserRolesResponse>("User not found");
        }

        var roles = await _userManager.GetApplicationRolesAsync(user);

        _logger.LogInformation("Retrieved {RoleCount} roles for user {Email}: {Roles}", 
            roles.Count, user.Email, string.Join(", ", roles));

        var response = new UserRolesResponse(user.Id, user.Email!, roles);
        return Result.Success(response);
    }
}
