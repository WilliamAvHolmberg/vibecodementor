using Microsoft.EntityFrameworkCore;
using Source.Infrastructure;
using Source.Infrastructure.Services.FileStorage;
using Source.Shared.CQRS;
using Source.Shared.Results;
using Source.Features.Files.Models;
using SixLabors.ImageSharp;

namespace Source.Features.Files.Commands;

public record UploadImageCommand(
    Stream FileStream,
    string FileName,
    string ContentType,
    long FileSize,
    string? UserId = null
) : ICommand<Result<UploadImageResponse>>;

public record UploadImageResponse(
    Guid Id,
    string FileName,
    string FileUrl,
    string ContentType,
    long FileSize,
    int Width,
    int Height,
    DateTime UploadedAt
);

public class UploadImageCommandHandler : ICommandHandler<UploadImageCommand, Result<UploadImageResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<UploadImageCommandHandler> _logger;

    public UploadImageCommandHandler(
        ApplicationDbContext context,
        IFileStorageService fileStorageService,
        ILogger<UploadImageCommandHandler> logger)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    public async Task<Result<UploadImageResponse>> Handle(UploadImageCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("📸 Starting image upload: {FileName} ({FileSize} bytes)", request.FileName, request.FileSize);

        // Validate image format
        if (!IsValidImageType(request.ContentType))
        {
            return Result.Failure<UploadImageResponse>($"Invalid image type: {request.ContentType}. Only JPEG, PNG, GIF, and WebP are supported.");
        }

        try
        {
            // Get image dimensions and validate
            var (width, height) = await GetImageDimensionsAsync(request.FileStream);
            
            // Reset stream position after reading dimensions
            request.FileStream.Position = 0;

            // Upload to file storage (R2/Local)
            var filePath = await _fileStorageService.SaveFileAsync(request.FileStream, request.FileName, "images");
            var fileUrl = await _fileStorageService.GetFileUrlAsync(filePath);

            // Create database record
            var uploadedImage = new UploadedImage
            {
                Id = Guid.NewGuid(),
                FileName = Path.GetFileName(filePath),
                OriginalFileName = request.FileName,
                FilePath = filePath,
                FileUrl = fileUrl,
                ContentType = request.ContentType,
                FileSize = request.FileSize,
                Width = width,
                Height = height,
                UploadedByUserId = request.UserId,
                UploadedAt = DateTime.UtcNow,
                IsPublic = true
            };

            _context.UploadedImages.Add(uploadedImage);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("✅ Image uploaded successfully: {FilePath} (ID: {ImageId})", filePath, uploadedImage.Id);

            var response = new UploadImageResponse(
                uploadedImage.Id,
                uploadedImage.FileName,
                uploadedImage.FileUrl,
                uploadedImage.ContentType,
                uploadedImage.FileSize,
                uploadedImage.Width,
                uploadedImage.Height,
                uploadedImage.UploadedAt
            );

            return Result.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to upload image: {FileName}", request.FileName);
            return Result.Failure<UploadImageResponse>($"Failed to upload image: {ex.Message}");
        }
    }

    private static bool IsValidImageType(string contentType)
    {
        var validTypes = new[]
        {
            "image/jpeg",
            "image/jpg", 
            "image/png",
            "image/gif",
            "image/webp"
        };

        return validTypes.Contains(contentType.ToLowerInvariant());
    }

    private static async Task<(int width, int height)> GetImageDimensionsAsync(Stream stream)
    {
        try
        {
            using var image = await Image.LoadAsync(stream);
            return (image.Width, image.Height);
        }
        catch (Exception)
        {
            // If we can't determine dimensions, return 0,0
            return (0, 0);
        }
    }
} 