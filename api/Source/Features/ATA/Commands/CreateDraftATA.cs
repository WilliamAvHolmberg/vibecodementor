using MediatR;
using Source.Features.ATA.Models;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.ATA.Commands;

/// <summary>
/// Command to create an empty draft ÄTA request instantly
/// Part of the "living document" pattern - create immediately, edit later
/// </summary>
public record CreateDraftATA(
    string UserId
) : ICommand<Result<CreateDraftATAResponse>>;

/// <summary>
/// Response DTO for draft ÄTA creation
/// </summary>
public record CreateDraftATAResponse(
    Guid Id,
    DateTime CreatedAt
);

/// <summary>
/// Handler for creating draft ÄTA requests
/// </summary>
public class CreateDraftATAHandler : ICommandHandler<CreateDraftATA, Result<CreateDraftATAResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CreateDraftATAHandler> _logger;

    public CreateDraftATAHandler(
        ApplicationDbContext context,
        ILogger<CreateDraftATAHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<CreateDraftATAResponse>> Handle(CreateDraftATA request, CancellationToken cancellationToken)
    {
        try
        {
            // Create minimal draft ÄTA
            var ataRequest = new ATARequest
            {
                UserId = request.UserId,
                Title = "Untitled ÄTA Request",
                ProjectName = "",
                Description = "",
                RecipientEmail = "",
                RequestedBy = "",
                TotalCost = 0,
                Status = ATAStatus.Draft
            };

            _context.ATARequests.Add(ataRequest);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Created draft ÄTA request {ATARequestId} for user {UserId}", ataRequest.Id, request.UserId);

            return Result.Success(new CreateDraftATAResponse(
                ataRequest.Id,
                ataRequest.CreatedAt
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create draft ÄTA request for user {UserId}", request.UserId);
            return Result.Failure<CreateDraftATAResponse>("Failed to create draft ÄTA request");
        }
    }
} 