using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.ATA.Models;
using Source.Features.ATA.Services;
using Source.Features.Users.Models;
using Source.Infrastructure;
using Source.Shared.Results;

namespace Source.Features.ATA.Commands;

/// <summary>
/// Command for client to reject an ATA request
/// Changes status to Rejected and optionally adds rejection comment
/// </summary>
public record RejectATARequest(
    Guid AtaId,
    string UserId,
    string? Comment = null
) : IRequest<Result<RejectATARequestResponse>>;

public record RejectATARequestResponse(
    Guid AtaId,
    ATAStatus NewStatus,
    string Message
);

public class RejectATARequestHandler : IRequestHandler<RejectATARequest, Result<RejectATARequestResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ATANotificationService _notificationService;
    private readonly ATATimelineService _timelineService;
    private readonly ILogger<RejectATARequestHandler> _logger;

    public RejectATARequestHandler(
        ApplicationDbContext context,
        ATANotificationService notificationService,
        ATATimelineService timelineService,
        ILogger<RejectATARequestHandler> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _timelineService = timelineService;
        _logger = logger;
    }

    public async Task<Result<RejectATARequestResponse>> Handle(RejectATARequest request, CancellationToken cancellationToken)
    {
        try
        {
            // Find the ATA request
            var ataRequest = await _context.ATARequests
                .Include(a => a.LineItems)
                .Include(a => a.Comments)
                .FirstOrDefaultAsync(a => a.Id == request.AtaId, cancellationToken);

            if (ataRequest == null)
                return Result.Failure<RejectATARequestResponse>("ÄTA request not found");

            // Verify it's in Submitted status
            if (ataRequest.Status != ATAStatus.Submitted)
                return Result.Failure<RejectATARequestResponse>($"ÄTA request must be in Submitted status to reject. Current status: {ataRequest.Status}");

            // Update status to Rejected
            ataRequest.Status = ATAStatus.Rejected;
            ataRequest.UpdatedAt = DateTime.UtcNow;
            
            // Explicitly mark as modified to ensure EF tracks changes
            _context.Update(ataRequest);

            // Create timeline entry for rejection
            await _timelineService.CreateTimelineEntryAsync(
                ataRequest.Id,
                ATAStatus.Rejected,
                request.UserId,
                "Client",
                request.Comment,
                cancellationToken);

            // Add rejection comment if provided (separate from timeline)
            if (!string.IsNullOrWhiteSpace(request.Comment))
            {
                var comment = new ATAComment
                {
                    ATARequestId = ataRequest.Id,
                    UserId = "client-approval", // Placeholder for client rejections
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
                await _notificationService.SendRejectionNotificationAsync(ataRequest, creator.Email, cancellationToken);
            }
            else
            {
                _logger.LogWarning("Could not find creator email for ATA {AtaId}, user {UserId}", ataRequest.Id, ataRequest.UserId);
            }

            _logger.LogInformation("ÄTA request {AtaId} rejected by user {UserId}", request.AtaId, request.UserId);

            return Result.Success<RejectATARequestResponse>(new RejectATARequestResponse(
                ataRequest.Id,
                ataRequest.Status,
                "ÄTA request rejected. Contractor will be notified."
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting ÄTA request {AtaId}: {Error}", request.AtaId, ex.Message);
            return Result.Failure<RejectATARequestResponse>($"Failed to reject ÄTA request: {ex.Message}");
        }
    }
} 