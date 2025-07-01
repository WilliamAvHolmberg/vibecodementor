using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Source.Infrastructure.Services.FileStorage;
using MediatR;
using Source.Features.Files.Commands;
using Source.Features.Files.Queries;
using System.Security.Claims;

namespace Source.Features.Files.Controllers;

[ApiController]
[Route("api/[controller]")]
[Tags("Files")]
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorageService;
    private readonly IMediator _mediator;
    private readonly ILogger<FilesController> _logger;

    public FilesController(IFileStorageService fileStorageService, IMediator mediator, ILogger<FilesController> logger)
    {
        _fileStorageService = fileStorageService;
        _mediator = mediator;
        _logger = logger;
    }

    /// <summary>
    /// Upload a file (offline-first local storage)
    /// </summary>
    [HttpPost("upload")]
    [EnableRateLimiting("UploadPolicy")]  // 🚨 Rate limited: 10 per minute
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { error = "No file provided" });
        }

        try
        {
            _logger.LogInformation("📤 Uploading file: {FileName} ({FileSize} bytes)", file.FileName, file.Length);

            await using var stream = file.OpenReadStream();
            var filePath = await _fileStorageService.SaveFileAsync(stream, file.FileName, "uploads");
            var fileUrl = await _fileStorageService.GetFileUrlAsync(filePath);

            _logger.LogInformation("✅ File uploaded successfully: {FilePath}", filePath);

            return Ok(new 
            { 
                filePath, 
                fileUrl, 
                fileName = file.FileName,
                fileSize = file.Length,
                message = "File uploaded successfully to offline storage! 🚀"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to upload file: {FileName}", file.FileName);
            return BadRequest(new { error = $"Failed to upload file: {ex.Message}" });
        }
    }

    /// <summary>
    /// Upload an image with database persistence
    /// </summary>
    [HttpPost("upload-image")]
    [EnableRateLimiting("UploadPolicy")]  // 🚨 Rate limited: 10 per minute
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { error = "No file provided" });
        }

        // Get current user ID if authenticated
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        try
        {
            await using var stream = file.OpenReadStream();
            var command = new UploadImageCommand(
                stream,
                file.FileName,
                file.ContentType,
                file.Length,
                userId
            );

            var result = await _mediator.Send(command);

            if (result.IsSuccess)
            {
                return Ok(new 
                { 
                    image = result.Value,
                    message = "Image uploaded successfully! 📸"
                });
            }

            return BadRequest(new { error = result.Error });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to upload image: {FileName}", file.FileName);
            return BadRequest(new { error = $"Failed to upload image: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get latest uploaded images
    /// </summary>
    [HttpGet("images/latest")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetLatestImages([FromQuery] int count = 10)
    {
        try
        {
            var query = new GetLatestImagesQuery(count);
            var result = await _mediator.Send(query);

            if (result.IsSuccess)
            {
                return Ok(new 
                { 
                    images = result.Value.Images,
                    totalCount = result.Value.TotalCount,
                    message = $"Found {result.Value.Images.Count} latest images! 📷"
                });
            }

            return BadRequest(new { error = result.Error });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to fetch latest images");
            return BadRequest(new { error = $"Failed to fetch images: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get file info (test if file exists)
    /// </summary>
    [HttpGet("info/{*filePath}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetFileInfo(string filePath)
    {
        var exists = await _fileStorageService.FileExistsAsync(filePath);
        
        if (!exists)
        {
            return NotFound(new { error = "File not found" });
        }

        var fileUrl = await _fileStorageService.GetFileUrlAsync(filePath);
        
        return Ok(new 
        { 
            filePath, 
            fileUrl, 
            exists,
            message = "File found in offline storage! 📁"
        });
    }
} 