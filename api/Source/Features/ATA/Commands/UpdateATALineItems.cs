using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.ATA.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.ATA.Commands;

/// <summary>
/// Command to batch update all line items for an ÄTA request
/// Replaces entire lineItems array - client owns the truth!
/// </summary>
public record UpdateATALineItems(
    Guid ATARequestId,
    string UserId,
    List<UpdateATALineItemRequest> LineItems
) : ICommand<Result<UpdateATALineItemsResponse>>;

/// <summary>
/// Line item data for batch updates
/// </summary>
public record UpdateATALineItemRequest(
    ATAWorkType Type,
    string Description,
    decimal CostEstimate,
    string Comment = ""
);

/// <summary>
/// Response DTO for line items batch update
/// </summary>
public record UpdateATALineItemsResponse(
    Guid ATARequestId,
    int LineItemCount,
    decimal TotalCost,
    DateTime UpdatedAt
);

/// <summary>
/// Handler for batch updating ÄTA line items
/// </summary>
public class UpdateATALineItemsHandler : ICommandHandler<UpdateATALineItems, Result<UpdateATALineItemsResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UpdateATALineItemsHandler> _logger;

    public UpdateATALineItemsHandler(
        ApplicationDbContext context,
        ILogger<UpdateATALineItemsHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<UpdateATALineItemsResponse>> Handle(UpdateATALineItems request, CancellationToken cancellationToken)
    {
        try
        {
            // Get the ATA request with existing line items
            var ataRequest = await _context.ATARequests
                .Where(x => x.Id == request.ATARequestId && x.UserId == request.UserId)
                .Include(x => x.LineItems)
                .FirstOrDefaultAsync(cancellationToken);

            if (ataRequest == null)
            {
                return Result.Failure<UpdateATALineItemsResponse>("ÄTA request not found or access denied");
            }

            // Remove all existing line items (cascade delete)
            _context.ATALineItems.RemoveRange(ataRequest.LineItems);

            // Add the new line items
            var newLineItems = request.LineItems.Select(li => new ATALineItem
            {
                ATARequestId = request.ATARequestId,
                Type = li.Type,
                Description = li.Description,
                CostEstimate = li.CostEstimate,
                Comment = li.Comment,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _context.ATALineItems.AddRange(newLineItems);

            // Recalculate total cost
            var totalCost = newLineItems.Sum(x => x.CostEstimate);
            ataRequest.TotalCost = totalCost;
            ataRequest.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Batch updated {Count} line items for ÄTA request {ATARequestId}", 
                newLineItems.Count, request.ATARequestId);

            return Result.Success(new UpdateATALineItemsResponse(
                ataRequest.Id,
                newLineItems.Count,
                totalCost,
                ataRequest.UpdatedAt
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to batch update line items for ÄTA request {ATARequestId}", request.ATARequestId);
            return Result.Failure<UpdateATALineItemsResponse>("Failed to update line items");
        }
    }
} 