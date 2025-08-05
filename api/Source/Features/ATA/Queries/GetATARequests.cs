using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.ATA.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.ATA.Queries;

/// <summary>
/// Query to get ÄTA requests for a specific user
/// Part of the ATA feature vertical slice
/// </summary>
public record GetATARequests(
    string UserId
) : IQuery<Result<List<ATARequestSummary>>>;

/// <summary>
/// Summary DTO for ÄTA request listing
/// </summary>
public record ATARequestSummary(
    Guid Id,
    string Title,
    string ProjectName,
    string RecipientEmail,
    ATAStatus Status,
    decimal TotalCost,
    int LineItemCount,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

/// <summary>
/// Handler for getting ÄTA requests
/// </summary>
public class GetATARequestsHandler : IQueryHandler<GetATARequests, Result<List<ATARequestSummary>>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<GetATARequestsHandler> _logger;

    public GetATARequestsHandler(
        ApplicationDbContext context,
        ILogger<GetATARequestsHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<List<ATARequestSummary>>> Handle(GetATARequests request, CancellationToken cancellationToken)
    {
        try
        {
            var ataRequests = await _context.ATARequests
                .Where(x => x.UserId == request.UserId)
                .Include(x => x.LineItems)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new ATARequestSummary(
                    x.Id,
                    x.Title,
                    x.ProjectName,
                    x.RecipientEmail,
                    x.Status,
                    x.TotalCost,
                    x.LineItems.Count,
                    x.CreatedAt,
                    x.UpdatedAt
                ))
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Retrieved {Count} ÄTA requests for user {UserId}", ataRequests.Count, request.UserId);

            return Result.Success(ataRequests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get ÄTA requests for user {UserId}", request.UserId);
            return Result.Failure<List<ATARequestSummary>>("Failed to get ÄTA requests");
        }
    }
} 