using Microsoft.EntityFrameworkCore;
using Source.Infrastructure;
using Source.Shared.CQRS;
using Source.Shared.Results;

namespace Source.Features.Files.Queries;

public record GetLatestImagesQuery(int Count = 10) : IQuery<Result<GetLatestImagesResponse>>;

public record GetLatestImagesResponse(List<ImageListItem> Images, int TotalCount);

public record ImageListItem(
    Guid Id,
    string FileName,
    string FileUrl,
    string ContentType,
    long FileSize,
    int Width,
    int Height,
    DateTime UploadedAt,
    string? UploadedByUserId
);

public class GetLatestImagesHandler : IQueryHandler<GetLatestImagesQuery, Result<GetLatestImagesResponse>>
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<GetLatestImagesHandler> _logger;

    public GetLatestImagesHandler(ApplicationDbContext context, ILogger<GetLatestImagesHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<GetLatestImagesResponse>> Handle(GetLatestImagesQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("📋 Fetching latest {Count} images", request.Count);

        try
        {
            var totalCount = await _context.UploadedImages
                .Where(img => img.IsPublic)
                .CountAsync(cancellationToken);

            var images = await _context.UploadedImages
                .Where(img => img.IsPublic)
                .OrderByDescending(img => img.UploadedAt)
                .Take(request.Count)
                .Select(img => new ImageListItem(
                    img.Id,
                    img.FileName,
                    img.FileUrl,
                    img.ContentType,
                    img.FileSize,
                    img.Width,
                    img.Height,
                    img.UploadedAt,
                    img.UploadedByUserId
                ))
                .ToListAsync(cancellationToken);

            _logger.LogInformation("✅ Found {ImageCount} images out of {TotalCount} total", images.Count, totalCount);

            var response = new GetLatestImagesResponse(images, totalCount);
            return Result.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to fetch latest images");
            return Result.Failure<GetLatestImagesResponse>($"Failed to fetch images: {ex.Message}");
        }
    }
} 