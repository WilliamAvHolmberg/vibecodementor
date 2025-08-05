using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.ATA.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.ATA.Queries;

/// <summary>
/// Query to get full ÄTA request details for editing
/// Part of the ATA feature vertical slice
/// </summary>
public record GetATADetails(
    Guid ATARequestId,
    string UserId
) : IQuery<Result<ATADetailsResponse>>;

/// <summary>
/// Detailed DTO for ÄTA request editing
/// </summary>
public record ATADetailsResponse(
    Guid Id,
    string Title,
    string ProjectName,
    string Description,
    string RecipientEmail,
    string RequestedBy,
    ATAStatus Status,
    decimal TotalCost,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<ATALineItemDetails> LineItems,
    List<ATACommentDetails> Comments,
    List<ATATimelineEntry> Timeline
);

/// <summary>
/// Line item details for editing
/// </summary>
public record ATALineItemDetails(
    Guid Id,
    ATAWorkType Type,
    string Description,
    decimal CostEstimate,
    string Comment,
    DateTime CreatedAt
);

/// <summary>
/// Comment details for editing view
/// </summary>
public record ATACommentDetails(
    Guid Id,
    string Content,
    string AuthorName,
    DateTime CreatedAt
);

/// <summary>
/// Timeline entry for editing view
/// </summary>
public record ATATimelineEntry(
    Guid Id,
    ATAStatus Status,
    string? Comment,
    string ChangedBy,
    string ChangedByName,
    DateTime Timestamp,
    int SubmissionRound
);

/// <summary>
/// Handler for getting ÄTA request details
/// </summary>
public class GetATADetailsHandler : IQueryHandler<GetATADetails, Result<ATADetailsResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<GetATADetailsHandler> _logger;

    public GetATADetailsHandler(
        ApplicationDbContext context,
        ILogger<GetATADetailsHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<ATADetailsResponse>> Handle(GetATADetails request, CancellationToken cancellationToken)
    {
        try
        {
            var ataRequest = await _context.ATARequests
                .Where(x => x.Id == request.ATARequestId && x.UserId == request.UserId)
                .Include(x => x.LineItems)
                .Include(x => x.Comments)
                .Include(x => x.StatusHistory)
                .FirstOrDefaultAsync(cancellationToken);

            if (ataRequest == null)
            {
                return Result.Failure<ATADetailsResponse>("ÄTA request not found or access denied");
            }

            var response = new ATADetailsResponse(
                ataRequest.Id,
                ataRequest.Title,
                ataRequest.ProjectName,
                ataRequest.Description,
                ataRequest.RecipientEmail,
                ataRequest.RequestedBy,
                ataRequest.Status,
                ataRequest.TotalCost,
                ataRequest.CreatedAt,
                ataRequest.UpdatedAt,
                ataRequest.LineItems.Select(li => new ATALineItemDetails(
                    li.Id,
                    li.Type,
                    li.Description,
                    li.CostEstimate,
                    li.Comment,
                    li.CreatedAt
                )).ToList(),
                ataRequest.Comments.Select(c => new ATACommentDetails(
                    c.Id,
                    c.Content,
                    c.AuthorName,
                    c.CreatedAt
                )).ToList(),
                ataRequest.StatusHistory
                    .OrderByDescending(h => h.Timestamp)
                    .Select(h => new ATATimelineEntry(
                        h.Id,
                        h.Status,
                        h.Comment,
                        h.ChangedBy,
                        h.ChangedByName,
                        h.Timestamp,
                        h.SubmissionRound
                    )).ToList()
            );

            _logger.LogInformation("Retrieved ÄTA details {ATARequestId} for user {UserId}", request.ATARequestId, request.UserId);

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get ÄTA details {ATARequestId} for user {UserId}", request.ATARequestId, request.UserId);
            return Result.Failure<ATADetailsResponse>("Failed to get ÄTA details");
        }
    }
} 