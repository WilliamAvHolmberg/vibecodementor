namespace Source.Infrastructure.Services.FileStorage;

/// <summary>
/// File storage service abstraction
/// </summary>
public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string? folder = null, CancellationToken cancellationToken = default);
    Task<Stream> GetFileAsync(string filePath, CancellationToken cancellationToken = default);
    Task<bool> DeleteFileAsync(string filePath, CancellationToken cancellationToken = default);
    Task<bool> FileExistsAsync(string filePath, CancellationToken cancellationToken = default);
    Task<string> GetFileUrlAsync(string filePath, CancellationToken cancellationToken = default);
}

/// <summary>
/// File storage result model
/// </summary>
public record FileStorageResult(
    string FilePath,
    string FileName,
    long FileSize,
    string ContentType
); 