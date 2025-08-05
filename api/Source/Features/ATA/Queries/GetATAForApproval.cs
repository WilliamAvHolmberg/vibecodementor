using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.ATA.Models;
using Source.Infrastructure;
using Source.Shared.Results;

namespace Source.Features.ATA.Queries;

public record GetATAForApproval(Guid Id) : IRequest<Result<ATAForApprovalResponse>>;

public class GetATAForApprovalHandler : IRequestHandler<GetATAForApproval, Result<ATAForApprovalResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<GetATAForApprovalHandler> _logger;

    public GetATAForApprovalHandler(ApplicationDbContext context, ILogger<GetATAForApprovalHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<ATAForApprovalResponse>> Handle(GetATAForApproval request, CancellationToken cancellationToken)
    {
        try
        {
            var ataRequest = await _context.ATARequests
                .Include(a => a.LineItems)
                .Include(a => a.Comments)
                .Include(a => a.StatusHistory)
                .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

            if (ataRequest == null)
            {
                _logger.LogWarning("ATA request {Id} not found", request.Id);
                return Result.Failure<ATAForApprovalResponse>("ATA request not found");
            }

            // Map to response DTO
            var response = new ATAForApprovalResponse(
                Id: ataRequest.Id,
                Title: ataRequest.Title,
                ProjectName: ataRequest.ProjectName,
                Description: ataRequest.Description,
                RequestedBy: ataRequest.RequestedBy,
                Status: ataRequest.Status,
                TotalCost: ataRequest.TotalCost,
                CreatedAt: ataRequest.CreatedAt,
                LineItems: ataRequest.LineItems.Select(li => new ATALineItemForApprovalDto(
                    Type: li.Type,
                    Description: li.Description,
                    CostEstimate: li.CostEstimate,
                    Comment: li.Comment
                )).ToList(),
                Comments: ataRequest.Comments.Select(c => new ATACommentForApprovalDto(
                    Id: c.Id,
                    Content: c.Content,
                    AuthorName: c.AuthorName,
                    CreatedAt: c.CreatedAt
                )).ToList(),
                Timeline: ataRequest.StatusHistory
                    .OrderByDescending(h => h.Timestamp)
                    .Select(h => new ATATimelineForApprovalDto(
                        Id: h.Id,
                        Status: h.Status,
                        Comment: h.Comment,
                        ChangedBy: h.ChangedBy,
                        ChangedByName: h.ChangedByName,
                        Timestamp: h.Timestamp,
                        SubmissionRound: h.SubmissionRound
                    )).ToList()
            );

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get ATA for approval {Id}", request.Id);
            return Result.Failure<ATAForApprovalResponse>("Failed to retrieve ATA request");
        }
    }
}

// Response DTOs for public approval page
public record ATAForApprovalResponse(
    Guid Id,
    string Title,
    string ProjectName,
    string Description,
    string RequestedBy,
    ATAStatus Status,
    decimal TotalCost,
    DateTime CreatedAt,
    List<ATALineItemForApprovalDto> LineItems,
    List<ATACommentForApprovalDto> Comments,
    List<ATATimelineForApprovalDto> Timeline
);

public record ATALineItemForApprovalDto(
    ATAWorkType Type,
    string Description,
    decimal CostEstimate,
    string Comment
);

public record ATACommentForApprovalDto(
    Guid Id,
    string Content,
    string AuthorName,
    DateTime CreatedAt
);

public record ATATimelineForApprovalDto(
    Guid Id,
    ATAStatus Status,
    string? Comment,
    string ChangedBy,
    string ChangedByName,
    DateTime Timestamp,
    int SubmissionRound
);