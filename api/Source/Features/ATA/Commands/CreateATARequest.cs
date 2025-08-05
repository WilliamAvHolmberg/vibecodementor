using MediatR;
using Microsoft.EntityFrameworkCore;
using Source.Features.ATA.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.ATA.Commands;

/// <summary>
/// Command to create a new ÄTA request with line items
/// Part of the ATA feature vertical slice
/// </summary>
public record CreateATARequest(
    string UserId,
    string Title,
    string ProjectName,
    string Description,
    string RecipientEmail,
    string RequestedBy,
    List<CreateATALineItemRequest> LineItems
) : ICommand<Result<CreateATARequestResponse>>;

/// <summary>
/// Line item data for creating ÄTA requests
/// </summary>
public record CreateATALineItemRequest(
    ATAWorkType Type,
    string Description,
    decimal CostEstimate,
    string Comment = ""
);

/// <summary>
/// Response DTO for ÄTA request creation
/// </summary>
public record CreateATARequestResponse(
    Guid Id,
    string Title,
    string ProjectName,
    decimal TotalCost,
    DateTime CreatedAt
);

/// <summary>
/// Handler for creating ÄTA requests
/// </summary>
public class CreateATARequestHandler : ICommandHandler<CreateATARequest, Result<CreateATARequestResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CreateATARequestHandler> _logger;

    public CreateATARequestHandler(
        ApplicationDbContext context,
        ILogger<CreateATARequestHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<CreateATARequestResponse>> Handle(CreateATARequest request, CancellationToken cancellationToken)
    {
        try
        {
            // Calculate total cost from line items
            var totalCost = request.LineItems.Sum(x => x.CostEstimate);

            // Create the main ÄTA request
            var ataRequest = new ATARequest
            {
                UserId = request.UserId,
                Title = request.Title,
                ProjectName = request.ProjectName,
                Description = request.Description,
                RecipientEmail = request.RecipientEmail,
                RequestedBy = request.RequestedBy,
                TotalCost = totalCost,
                Status = ATAStatus.Draft
            };

            _context.ATARequests.Add(ataRequest);

            // Create line items
            foreach (var lineItem in request.LineItems)
            {
                var ataLineItem = new ATALineItem
                {
                    ATARequestId = ataRequest.Id,
                    Type = lineItem.Type,
                    Description = lineItem.Description,
                    CostEstimate = lineItem.CostEstimate,
                    Comment = lineItem.Comment
                };
                
                _context.ATALineItems.Add(ataLineItem);
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Created ÄTA request {ATARequestId} for user {UserId}", ataRequest.Id, request.UserId);

            return Result.Success(new CreateATARequestResponse(
                ataRequest.Id,
                ataRequest.Title,
                ataRequest.ProjectName,
                ataRequest.TotalCost,
                ataRequest.CreatedAt
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create ÄTA request for user {UserId}", request.UserId);
            return Result.Failure<CreateATARequestResponse>("Failed to create ÄTA request");
        }
    }
} 