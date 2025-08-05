using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.ATA.Models;
using Source.Features.ATA.Services;
using Source.Infrastructure;
using Source.Shared.Results;

namespace Source.Features.ATA.Commands;

/// <summary>
/// Command to submit an ATA request to the client for approval
/// Changes status from Draft to Submitted and sends email notification
/// </summary>
public record SubmitATARequest(
    Guid AtaId,
    string UserId
) : IRequest<Result<SubmitATARequestResponse>>;

public record SubmitATARequestResponse(
    Guid AtaId,
    ATAStatus NewStatus,
    string Message
);

public class SubmitATARequestHandler : IRequestHandler<SubmitATARequest, Result<SubmitATARequestResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ATANotificationService _notificationService;
    private readonly ATATimelineService _timelineService;
    private readonly ILogger<SubmitATARequestHandler> _logger;

    public SubmitATARequestHandler(
        ApplicationDbContext context,
        ATANotificationService notificationService,
        ATATimelineService timelineService,
        ILogger<SubmitATARequestHandler> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _timelineService = timelineService;
        _logger = logger;
    }

    public async Task<Result<SubmitATARequestResponse>> Handle(SubmitATARequest request, CancellationToken cancellationToken)
    {
        try
        {
            // Find the ATA request
            var ataRequest = await _context.ATARequests
                .Include(a => a.LineItems)
                .FirstOrDefaultAsync(a => a.Id == request.AtaId && a.UserId == request.UserId, cancellationToken);

            if (ataRequest == null)
                return Result.Failure<SubmitATARequestResponse>("ÄTA request not found or access denied");

            // Verify it's in Draft status
            if (ataRequest.Status == ATAStatus.Approved)
                return Result.Failure<SubmitATARequestResponse>($"ÄTA request cannot be submitted because it has already been approved");

            // Update status to Submitted
            ataRequest.Status = ATAStatus.Submitted;
            ataRequest.UpdatedAt = DateTime.UtcNow;

            // Create timeline entry for submission
            await _timelineService.CreateTimelineEntryAsync(
                ataRequest.Id,
                ATAStatus.Submitted,
                request.UserId,
                "Contractor", // TODO: Get actual user name
                null,
                cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);

            // Send notification email to client
            await _notificationService.SendSubmissionNotificationAsync(ataRequest, cancellationToken);

            _logger.LogInformation("ÄTA request {AtaId} submitted successfully by user {UserId}", request.AtaId, request.UserId);

            return Result.Success<SubmitATARequestResponse>(new SubmitATARequestResponse(
                ataRequest.Id,
                ataRequest.Status,
                "ÄTA request submitted successfully. Client will receive email notification."
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting ÄTA request {AtaId}: {Error}", request.AtaId, ex.Message);
            return Result.Failure<SubmitATARequestResponse>($"Failed to submit ÄTA request: {ex.Message}");
        }
    }
} 