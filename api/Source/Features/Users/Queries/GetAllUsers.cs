using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Source.Features.Users.Models;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Users.Queries;

public record GetAllUsersQuery(int Page = 1, int PageSize = 10, string? Search = null) : IQuery<Result<GetAllUsersResponse>>;

public record GetAllUsersResponse(
    List<UserListItem> Users,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

public record UserListItem(string Id, string Email, string FullName, DateTime CreatedAt, List<string> Roles);

public class GetAllUsersHandler : IQueryHandler<GetAllUsersQuery, Result<GetAllUsersResponse>>
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<GetAllUsersHandler> _logger;

    public GetAllUsersHandler(UserManager<User> userManager, ILogger<GetAllUsersHandler> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<Result<GetAllUsersResponse>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var query = _userManager.Users.Where(u => !u.IsDeleted);

        // Apply search filter
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchTerm = request.Search.ToLower();
            query = query.Where(u => 
                u.Email!.ToLower().Contains(searchTerm) ||
                (u.FirstName != null && u.FirstName.ToLower().Contains(searchTerm)) ||
                (u.LastName != null && u.LastName.ToLower().Contains(searchTerm))
            );
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var usersData = await query
            .OrderBy(u => u.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // Fetch roles for each user
        var users = new List<UserListItem>();
        foreach (var user in usersData)
        {
            var roles = await _userManager.GetRolesAsync(user);
            users.Add(new UserListItem(
                user.Id,
                user.Email!,
                user.FullName,
                user.CreatedAt,
                roles.ToList()
            ));
        }

        var response = new GetAllUsersResponse(
            users,
            totalCount,
            request.Page,
            request.PageSize,
            totalPages
        );

        return Result.Success(response);
    }
} 