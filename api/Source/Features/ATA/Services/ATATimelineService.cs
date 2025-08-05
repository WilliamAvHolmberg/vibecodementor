using Microsoft.EntityFrameworkCore;
using Source.Features.ATA.Models;
using Source.Infrastructure;

namespace Source.Features.ATA.Services;

public class ATATimelineService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ATATimelineService> _logger;

    public ATATimelineService(ApplicationDbContext context, ILogger<ATATimelineService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ATAStatusHistory> CreateTimelineEntryAsync(
        Guid ataRequestId,
        ATAStatus newStatus,
        string changedBy,
        string changedByName,
        string? comment = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var submissionRound = await GetCurrentSubmissionRoundAsync(ataRequestId, cancellationToken);
            
            // If we're going from Rejected back to Submitted, increment the round
            var latestEntry = await _context.ATAStatusHistory
                .Where(h => h.ATARequestId == ataRequestId)
                .OrderByDescending(h => h.Timestamp)
                .FirstOrDefaultAsync(cancellationToken);

            if (latestEntry?.Status == ATAStatus.Rejected && newStatus == ATAStatus.Submitted)
            {
                submissionRound++;
            }

            var timelineEntry = new ATAStatusHistory
            {
                ATARequestId = ataRequestId,
                Status = newStatus,
                Comment = comment,
                ChangedBy = changedBy,
                ChangedByName = changedByName,
                Timestamp = DateTime.UtcNow,
                SubmissionRound = submissionRound
            };

            _context.ATAStatusHistory.Add(timelineEntry);
            
            _logger.LogInformation("Created timeline entry for ATA {ATARequestId}: {Status} by {ChangedBy} (Round {SubmissionRound})",
                ataRequestId, newStatus, changedByName, submissionRound);

            return timelineEntry;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create timeline entry for ATA {ATARequestId}", ataRequestId);
            throw;
        }
    }

    private async Task<int> GetCurrentSubmissionRoundAsync(Guid ataRequestId, CancellationToken cancellationToken)
    {
        var latestSubmissionEntry = await _context.ATAStatusHistory
            .Where(h => h.ATARequestId == ataRequestId && h.Status == ATAStatus.Submitted)
            .OrderByDescending(h => h.Timestamp)
            .FirstOrDefaultAsync(cancellationToken);

        return latestSubmissionEntry?.SubmissionRound ?? 1;
    }
}