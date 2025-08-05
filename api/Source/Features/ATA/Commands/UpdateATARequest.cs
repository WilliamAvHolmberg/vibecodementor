using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.ATA.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.ATA.Commands;

/// <summary>
/// Command to update specific fields of an existing ÄTA request
/// Part of the "living document" pattern - auto-save individual field changes
/// </summary>
public record UpdateATARequest(
    Guid ATARequestId,
    string UserId,
    string? Title = null,
    string? ProjectName = null,
    string? Description = null,
    string? RecipientEmail = null,
    string? RequestedBy = null
) : ICommand<Result<UpdateATARequestResponse>>;

/// <summary>
/// Response DTO for ÄTA request updates
/// </summary>
public record UpdateATARequestResponse(
    Guid Id,
    DateTime UpdatedAt
);

/// <summary>
/// Handler for updating ÄTA request fields
/// </summary>
public class UpdateATARequestHandler : ICommandHandler<UpdateATARequest, Result<UpdateATARequestResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UpdateATARequestHandler> _logger;

    public UpdateATARequestHandler(
        ApplicationDbContext context,
        ILogger<UpdateATARequestHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<UpdateATARequestResponse>> Handle(UpdateATARequest request, CancellationToken cancellationToken)
    {
        try
        {
            var ataRequest = await _context.ATARequests
                .Where(x => x.Id == request.ATARequestId && x.UserId == request.UserId)
                .FirstOrDefaultAsync(cancellationToken);

            if (ataRequest == null)
            {
                return Result.Failure<UpdateATARequestResponse>("ÄTA request not found or access denied");
            }

            // Only update fields that are provided (null means don't update)
            if (request.Title != null)
                ataRequest.Title = request.Title;
            
            if (request.ProjectName != null)
                ataRequest.ProjectName = request.ProjectName;
            
            if (request.Description != null)
                ataRequest.Description = request.Description;
            
            if (request.RecipientEmail != null)
                ataRequest.RecipientEmail = request.RecipientEmail;
            
            if (request.RequestedBy != null)
                ataRequest.RequestedBy = request.RequestedBy;

            ataRequest.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Updated ÄTA request {ATARequestId} for user {UserId}", request.ATARequestId, request.UserId);

            return Result.Success(new UpdateATARequestResponse(
                ataRequest.Id,
                ataRequest.UpdatedAt
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update ÄTA request {ATARequestId} for user {UserId}", request.ATARequestId, request.UserId);
            return Result.Failure<UpdateATARequestResponse>("Failed to update ÄTA request");
        }
    }
} 