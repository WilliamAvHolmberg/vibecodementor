using Source.Features.ATA.Models;
using Source.Infrastructure.Services.Email;

namespace Source.Features.ATA.Services;

/// <summary>
/// Service for sending email notifications related to ATA workflow
/// Handles submission, approval, and rejection notifications
/// </summary>
public class ATANotificationService
{
    private readonly IEmailService _emailService;
    private readonly ILogger<ATANotificationService> _logger;
    private readonly IConfiguration _configuration;

    public ATANotificationService(
        IEmailService emailService,
        ILogger<ATANotificationService> logger,
        IConfiguration configuration)
    {
        _emailService = emailService;
        _logger = logger;
        _configuration = configuration;
    }

    /// <summary>
    /// Send notification to client when ATA is submitted for approval
    /// </summary>
    public async Task SendSubmissionNotificationAsync(ATARequest ataRequest, CancellationToken cancellationToken = default)
    {
        try
        {
            var baseUrl = "https://vibecodementor.net";
            var approvalUrl = $"{baseUrl}/ata/approve/{ataRequest.Id}";

            var subject = $"ÄTA Request for Approval - {ataRequest.ProjectName}";
            var body = $@"
Hello,

You have received a new ÄTA (Ändrings-, Tilläggs- och Avgående arbete) request for approval.

Project: {ataRequest.ProjectName}
Title: {ataRequest.Title}
Requested by: {ataRequest.RequestedBy}
Total Cost: {ataRequest.TotalCost:C}

Description:
{ataRequest.Description}

To review and approve/reject this request, please visit:
{approvalUrl}

Best regards,
HackerWilliam
";

            await _emailService.SendEmailAsync(ataRequest.RecipientEmail, subject, body, cancellationToken);

            _logger.LogInformation("Submission notification sent for ATA {AtaId} to {Email}", ataRequest.Id, ataRequest.RecipientEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send submission notification for ATA {AtaId}", ataRequest.Id);
            throw;
        }
    }

    /// <summary>
    /// Send notification to contractor when ATA is approved
    /// </summary>
    public async Task SendApprovalNotificationAsync(ATARequest ataRequest, string contractorEmail, CancellationToken cancellationToken = default)
    {
        try
        {
            var subject = $"ÄTA Request Approved - {ataRequest.ProjectName}";
            var body = $@"
Hello,

Great news! Your ÄTA request has been approved.

Project: {ataRequest.ProjectName}
Title: {ataRequest.Title}
Total Cost: {ataRequest.TotalCost:C}

You can now proceed with the approved work items.

Best regards,
HackerWilliam
";

            await _emailService.SendEmailAsync(contractorEmail, subject, body, cancellationToken);

            _logger.LogInformation("Approval notification sent for ATA {AtaId} to {Email}", ataRequest.Id, contractorEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send approval notification for ATA {AtaId}", ataRequest.Id);
            throw;
        }
    }

    /// <summary>
    /// Send notification to contractor when ATA is rejected
    /// </summary>
    public async Task SendRejectionNotificationAsync(ATARequest ataRequest, string contractorEmail, CancellationToken cancellationToken = default)
    {
        try
        {
            var subject = $"ÄTA Request Rejected - {ataRequest.ProjectName}";
            var baseUrl = "https://vibecodementor.net";
            var approvalUrl = $"{baseUrl}/ata/approve/{ataRequest.Id}";
            var body = $@"
Hello,

Unfortunately, your ÄTA request has been rejected.

Project: {ataRequest.ProjectName}
Title: {ataRequest.Title}
Total Cost: {ataRequest.TotalCost:C}

Please review the feedback and submit a revised request if needed.

Best regards,
HackerWilliam
";

            await _emailService.SendEmailAsync(contractorEmail, subject, body, cancellationToken);

            _logger.LogInformation("Rejection notification sent for ATA {AtaId} to {Email}", ataRequest.Id, contractorEmail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send rejection notification for ATA {AtaId}", ataRequest.Id);
            throw;
        }
    }
}