using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.ATA.Models;
using Source.Features.ATA.Services;
using Source.Features.Users.Models;
using Source.Infrastructure;
using Source.Shared.Results;

namespace Source.Features.ATA.Commands;

/// <summary>
/// Command for client to approve an ATA request
/// Changes status to Approved and optionally adds approval comment
/// </summary>
public record ApproveATARequest(
    Guid AtaId,
    string UserId,
    string? Comment = null
) : IRequest<Result<ApproveATARequestResponse>>;

public record ApproveATARequestResponse(
    Guid AtaId,
    ATAStatus NewStatus,
    string Message
);

public class ApproveATARequestHandler : IRequestHandler<ApproveATARequest, Result<ApproveATARequestResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ATANotificationService _notificationService;
    private readonly ATATimelineService _timelineService;
    private readonly ILogger<ApproveATARequestHandler> _logger;

    public ApproveATARequestHandler(
        ApplicationDbContext context,
        ATANotificationService notificationService,
        ATATimelineService timelineService,
        ILogger<ApproveATARequestHandler> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _timelineService = timelineService;
        _logger = logger;
    }

    public async Task<Result<ApproveATARequestResponse>> Handle(ApproveATARequest request, CancellationToken cancellationToken)
    {
        try
        {
            // Find the ATA request
            var ataRequest = await _context.ATARequests
                .Include(a => a.LineItems)
                .Include(a => a.Comments)
                .FirstOrDefaultAsync(a => a.Id == request.AtaId, cancellationToken);

            if (ataRequest == null)
                return Result.Failure<ApproveATARequestResponse>("ÄTA request not found");

            // Verify it's in Submitted status
            if (ataRequest.Status != ATAStatus.Submitted)
                return Result.Failure<ApproveATARequestResponse>($"ÄTA request must be in Submitted status to approve. Current status: {ataRequest.Status}");

            // Update status to Approved
            ataRequest.Status = ATAStatus.Approved;
            ataRequest.UpdatedAt = DateTime.UtcNow;
            
            // Explicitly mark as modified to ensure EF tracks changes
            _context.Update(ataRequest);

            // Create timeline entry for approval
            await _timelineService.CreateTimelineEntryAsync(
                ataRequest.Id,
                ATAStatus.Approved,
                request.UserId,
                "Client",
                request.Comment,
                cancellationToken);

            // Add approval comment if provided (separate from timeline)
            if (!string.IsNullOrWhiteSpace(request.Comment))
            {
                var comment = new ATAComment
                {
                    ATARequestId = ataRequest.Id,
                    UserId = "client-approval", // Placeholder for client approvals
                    AuthorName = "Client",
                    Content = request.Comment.Trim(),
                    CreatedAt = DateTime.UtcNow
                };
                _context.Add(comment); // Explicitly add to context
            }

            await _context.SaveChangesAsync(cancellationToken);

            // Get the creator's email for notification
            var creator = await _context.Users.FirstOrDefaultAsync(u => u.Id == ataRequest.UserId, cancellationToken);
            if (creator?.Email != null)
            {
                // Send notification email to contractor
                await _notificationService.SendApprovalNotificationAsync(ataRequest, creator.Email, cancellationToken);
            }
            else
            {
                _logger.LogWarning("Could not find creator email for ATA {AtaId}, user {UserId}", ataRequest.Id, ataRequest.UserId);
            }

            _logger.LogInformation("ÄTA request {AtaId} approved by user {UserId}", request.AtaId, request.UserId);

            return Result.Success<ApproveATARequestResponse>(new ApproveATARequestResponse(
                ataRequest.Id,
                ataRequest.Status,
                "ÄTA request approved successfully. Contractor will be notified."
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving ÄTA request {AtaId}: {Error}", request.AtaId, ex.Message);
            return Result.Failure<ApproveATARequestResponse>($"Failed to approve ÄTA request: {ex.Message}");
        }
    }
} 