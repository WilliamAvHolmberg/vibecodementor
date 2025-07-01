using Microsoft.AspNetCore.Identity;
using Source.Features.Users.Models;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Users.Queries;

public record GetUserQuery(string UserId) : IQuery<Result<UserResponse>>;

public record UserResponse(string Id, string Email, string FirstName, string LastName, string FullName, DateTime CreatedAt, DateTime UpdatedAt);

public class GetUserQueryHandler : IQueryHandler<GetUserQuery, Result<UserResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<GetUserQueryHandler> _logger;

    public GetUserQueryHandler(UserManager<User> userManager, ILogger<GetUserQueryHandler> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result<UserResponse>> Handle(GetUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null || user.IsDeleted)
        {
            return Result.Failure<UserResponse>("User not found");
        }

        var response = new UserResponse(
            user.Id,
            user.Email!,
            user.FirstName ?? "",
            user.LastName ?? "",
            user.FullName,
            user.CreatedAt,
            user.UpdatedAt
        );

        return Result.Success(response);
    }
} 