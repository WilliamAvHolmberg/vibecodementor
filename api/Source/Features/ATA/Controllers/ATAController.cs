using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Source.Features.ATA.Commands;
using Source.Features.ATA.Models;
using Source.Features.ATA.Queries;
using System.Security.Claims;

namespace Source.Features.ATA.Controllers;

/// <summary>
/// Controller for ÄTA (Ändrings-, Tilläggs- och Avgående arbete) requests
/// Handles change, addition, and deduction work requests in construction projects
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ATAController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<ATAController> _logger;

    public ATAController(IMediator mediator, ILogger<ATAController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new ÄTA request with line items
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CreateATARequestResponse>> CreateATARequest([FromBody] CreateATARequestDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new CreateATARequest(
            userId,
            dto.Title,
            dto.ProjectName,
            dto.Description ?? string.Empty,
            dto.RecipientEmail,
            dto.RequestedBy,
            dto.LineItems.Select(li => new CreateATALineItemRequest(
                li.Type,
                li.Description,
                li.CostEstimate,
                li.Comment ?? string.Empty
            )).ToList()
        );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets all ÄTA requests for the current user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ATARequestSummary>>> GetATARequests()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var query = new GetATARequests(userId);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Creates a new draft ÄTA request instantly (living document pattern)
    /// </summary>
    [HttpPost("draft")]
    public async Task<ActionResult<CreateDraftATAResponse>> CreateDraftATA()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new CreateDraftATA(userId);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Updates specific fields of an ÄTA request (auto-save functionality)
    /// </summary>
    [HttpPatch("{id}")]
    public async Task<ActionResult<UpdateATARequestResponse>> UpdateATARequest([FromRoute] Guid id, [FromBody] UpdateATARequestDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new UpdateATARequest(
            id,
            userId,
            dto.Title,
            dto.ProjectName,
            dto.Description,
            dto.RecipientEmail,
            dto.RequestedBy
        );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets full ÄTA request details for editing
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ATADetailsResponse>> GetATADetails([FromRoute] Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var query = new GetATADetails(id, userId);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Batch updates all line items for an ÄTA request (replaces entire array)
    /// </summary>
    [HttpPatch("{id}/lineitems")]
    public async Task<ActionResult<UpdateATALineItemsResponse>> UpdateATALineItems([FromRoute] Guid id, [FromBody] UpdateATALineItemsDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new UpdateATALineItems(
            id,
            userId,
            dto.LineItems.Select(li => new UpdateATALineItemRequest(
                li.Type,
                li.Description,
                li.CostEstimate,
                li.Comment ?? string.Empty
            )).ToList()
        );

        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Submits an ÄTA request to the client for approval
    /// </summary>
    [HttpPost("{id}/submit")]
    public async Task<ActionResult<SubmitATARequestResponse>> SubmitATARequest([FromRoute] Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var command = new SubmitATARequest(id, userId);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Gets ÄTA request details for public approval page (no authentication required)
    /// </summary>
    [HttpGet("approve/{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<ATAForApprovalResponse>> GetATAForApproval([FromRoute] Guid id)
    {
        var query = new GetATAForApproval(id);
        var result = await _mediator.Send(query);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Approves an ÄTA request (public endpoint for client approval)
    /// </summary>
    [HttpPost("approve/{id}")]
    [AllowAnonymous] // Public endpoint for client approval
    public async Task<ActionResult<ApproveATARequestResponse>> ApproveATARequest([FromRoute] Guid id, [FromBody] ApproveATARequestDto? dto = null)
    {
        var userId = "client-approval"; // Placeholder for client approvals
        var command = new ApproveATARequest(id, userId, dto?.Comment);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }

    /// <summary>
    /// Rejects an ÄTA request (public endpoint for client rejection)
    /// </summary>
    [HttpPost("reject/{id}")]
    [AllowAnonymous] // Public endpoint for client rejection
    public async Task<ActionResult<RejectATARequestResponse>> RejectATARequest([FromRoute] Guid id, [FromBody] RejectATARequestDto? dto = null)
    {
        var userId = "client-approval"; // Placeholder for client rejections
        var command = new RejectATARequest(id, userId, dto?.Comment);
        var result = await _mediator.Send(command);

        if (!result.IsSuccess)
            return BadRequest(new { error = result.Error });

        return Ok(result.Value);
    }
}

/// <summary>
/// DTO for approving ÄTA requests with optional comment
/// </summary>
public record ApproveATARequestDto(
    string? Comment = null
);

/// <summary>
/// DTO for rejecting ÄTA requests with optional comment
/// </summary>
public record RejectATARequestDto(
    string? Comment = null
);

/// <summary>
/// DTO for creating ÄTA requests from API
/// </summary>
public record CreateATARequestDto(
    string Title,
    string ProjectName,
    string? Description,
    string RecipientEmail,
    string RequestedBy,
    List<CreateATALineItemDto> LineItems
);

/// <summary>
/// DTO for updating ÄTA requests from API (auto-save)
/// </summary>
public record UpdateATARequestDto(
    string? Title = null,
    string? ProjectName = null,
    string? Description = null,
    string? RecipientEmail = null,
    string? RequestedBy = null
);

/// <summary>
/// DTO for batch updating line items from API
/// </summary>
public record UpdateATALineItemsDto(
    List<UpdateATALineItemDto> LineItems
);

/// <summary>
/// DTO for individual line item updates
/// </summary>
public record UpdateATALineItemDto(
    ATAWorkType Type,
    string Description,
    decimal CostEstimate,
    string? Comment
);

/// <summary>
/// DTO for creating ÄTA line items from API
/// </summary>
public record CreateATALineItemDto(
    ATAWorkType Type,
    string Description,
    decimal CostEstimate,
    string? Comment
); 