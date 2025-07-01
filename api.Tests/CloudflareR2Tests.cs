using System.Text;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Source.Infrastructure.Services.FileStorage;
using Xunit;

namespace api.Tests;

/// <summary>
/// Integration tests for Cloudflare R2 storage service
/// These tests run against REAL R2 buckets - configure R2 credentials to run
/// </summary>
[Collection("Database")]
public class CloudflareR2Tests : TestBase
{
    /// <summary>
    /// Test basic file upload and download flow with R2
    /// </summary>
    [Fact]
    public async Task UploadFile_ToR2_ShouldUploadAndDownloadSuccessfully()
    {
        // Skip test if not configured for R2
        if (!IsR2Configured())
        {
            return; // Test will be skipped
        }

        // Arrange
        var r2Service = GetR2Service();
        var testContent = "Hello Cloudflare R2! This is a test file.";
        var testFileName = "test.txt";
        
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(testContent));

        try
        {
            // Act - Upload file
            var filePath = await r2Service.SaveFileAsync(stream, testFileName, "integration-tests");
            Assert.NotNull(filePath);
            Assert.Contains("integration-tests/", filePath);

            // Act - Verify file exists
            var exists = await r2Service.FileExistsAsync(filePath);
            Assert.True(exists);

            // Act - Download file
            using var downloadStream = await r2Service.GetFileAsync(filePath);
            using var reader = new StreamReader(downloadStream);
            var downloadedContent = await reader.ReadToEndAsync();

            // Assert
            Assert.Equal(testContent, downloadedContent);

            // Cleanup
            await r2Service.DeleteFileAsync(filePath);
        }
        catch (Exception ex)
        {
            Assert.False(true, $"R2 test failed: {ex.Message}. Ensure R2 credentials are configured in appsettings.");
        }
    }

    /// <summary>
    /// Test file upload through API endpoint with R2 backend
    /// </summary>
    [Fact]
    public async Task UploadFile_ViaAPI_WithR2Backend_ShouldReturnCorrectResponse()
    {
        // Skip test if not configured for R2
        if (!IsR2Configured())
        {
            return;
        }

        // Arrange
        var (user, token) = await CreateAuthenticatedUserAsync();
        SetAuthorizationHeader(token);

        var content = "Integration test file content for R2 API";
        var fileName = "api-test.txt";

        using var formContent = new MultipartFormDataContent();
        using var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes(content));
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/plain");
        formContent.Add(fileContent, "file", fileName);

        try
        {
            // Act
            var response = await Client.PostAsync("/api/files/upload", formContent);

            // Assert
            response.EnsureSuccessStatusCode();
            
            var responseContent = await response.Content.ReadAsStringAsync();
            Assert.Contains("filePath", responseContent);
            Assert.Contains("fileUrl", responseContent);
            Assert.Contains("uploads/", responseContent);

            // Extract file path from response for cleanup
            var responseData = await DeserializeResponseAsync<dynamic>(response);
            // Note: In a real scenario, we'd parse the JSON to get filePath for cleanup
        }
        catch (Exception ex)
        {
            Assert.False(true, $"R2 API test failed: {ex.Message}. Ensure R2 credentials are configured.");
        }
    }

    /// <summary>
    /// Test file deletion functionality
    /// </summary>
    [Fact]
    public async Task DeleteFile_FromR2_ShouldRemoveFileSuccessfully()
    {
        // Skip test if not configured for R2
        if (!IsR2Configured())
        {
            return;
        }

        // Arrange
        var r2Service = GetR2Service();
        var testContent = "File to be deleted";
        var testFileName = "delete-test.txt";
        
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(testContent));

        try
        {
            // Upload file first
            var filePath = await r2Service.SaveFileAsync(stream, testFileName, "delete-tests");
            
            // Verify file exists
            var existsBeforeDelete = await r2Service.FileExistsAsync(filePath);
            Assert.True(existsBeforeDelete);

            // Act - Delete file
            var deleteResult = await r2Service.DeleteFileAsync(filePath);
            Assert.True(deleteResult);

            // Assert - Verify file no longer exists
            var existsAfterDelete = await r2Service.FileExistsAsync(filePath);
            Assert.False(existsAfterDelete);
        }
        catch (Exception ex)
        {
            Assert.False(true, $"R2 delete test failed: {ex.Message}. Ensure R2 credentials are configured.");
        }
    }

    /// <summary>
    /// Test presigned URL generation
    /// </summary>
    [Fact]
    public async Task GetFileUrl_FromR2_ShouldReturnValidUrl()
    {
        // Skip test if not configured for R2
        if (!IsR2Configured())
        {
            return;
        }

        // Arrange
        var r2Service = GetR2Service();
        var testContent = "URL test content";
        var testFileName = "url-test.txt";
        
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(testContent));

        try
        {
            // Upload file
            var filePath = await r2Service.SaveFileAsync(stream, testFileName, "url-tests");

            // Act - Get file URL
            var fileUrl = await r2Service.GetFileUrlAsync(filePath);

            // Assert
            Assert.NotNull(fileUrl);
            Assert.True(Uri.TryCreate(fileUrl, UriKind.Absolute, out _), "File URL should be a valid URI");

            // Cleanup
            await r2Service.DeleteFileAsync(filePath);
        }
        catch (Exception ex)
        {
            Assert.False(true, $"R2 URL test failed: {ex.Message}. Ensure R2 credentials are configured.");
        }
    }

    /// <summary>
    /// Test handling of non-existent files
    /// </summary>
    [Fact]
    public async Task GetFile_NonExistent_ShouldThrowFileNotFoundException()
    {
        // Skip test if not configured for R2
        if (!IsR2Configured())
        {
            return;
        }

        // Arrange
        var r2Service = GetR2Service();
        var nonExistentPath = "non-existent/file.txt";

        try
        {
            // Act & Assert
            await Assert.ThrowsAsync<FileNotFoundException>(
                () => r2Service.GetFileAsync(nonExistentPath));
        }
        catch (Exception ex) when (!(ex is FileNotFoundException))
        {
            Assert.False(true, $"R2 non-existent file test failed: {ex.Message}. Ensure R2 credentials are configured.");
        }
    }

    /// <summary>
    /// Stress test: Upload multiple files concurrently
    /// </summary>
    [Fact]
    public async Task UploadMultipleFiles_Concurrently_ShouldSucceed()
    {
        // Skip test if not configured for R2
        if (!IsR2Configured())
        {
            return;
        }

        // Arrange
        var r2Service = GetR2Service();
        const int fileCount = 5;
        var tasks = new List<Task<string>>();
        var filePaths = new List<string>();

        try
        {
            // Act - Upload multiple files concurrently
            for (int i = 0; i < fileCount; i++)
            {
                var fileIndex = i;
                var task = Task.Run(async () =>
                {
                    var content = $"Concurrent test file {fileIndex}";
                    var fileName = $"concurrent-test-{fileIndex}.txt";
                    using var stream = new MemoryStream(Encoding.UTF8.GetBytes(content));
                    return await r2Service.SaveFileAsync(stream, fileName, "concurrent-tests");
                });
                tasks.Add(task);
            }

            filePaths.AddRange(await Task.WhenAll(tasks));

            // Assert - All files should be uploaded
            Assert.Equal(fileCount, filePaths.Count);
            Assert.All(filePaths, path => Assert.NotNull(path));

            // Verify all files exist
            foreach (var filePath in filePaths)
            {
                var exists = await r2Service.FileExistsAsync(filePath);
                Assert.True(exists, $"File {filePath} should exist");
            }

            // Cleanup
            var deleteTasks = filePaths.Select(path => r2Service.DeleteFileAsync(path));
            await Task.WhenAll(deleteTasks);
        }
        catch (Exception ex)
        {
            Assert.False(true, $"R2 concurrent upload test failed: {ex.Message}. Ensure R2 credentials are configured.");
        }
    }

    #region Helper Methods

    /// <summary>
    /// Check if R2 is configured by checking if Provider is set to "R2"
    /// </summary>
    private bool IsR2Configured()
    {
        using var scope = Factory.Services.CreateScope();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var provider = configuration["FileStorage:Provider"];
        return string.Equals(provider, "R2", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Get R2 service instance for direct testing
    /// </summary>
    private CloudflareR2StorageService GetR2Service()
    {
        using var scope = Factory.Services.CreateScope();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<CloudflareR2StorageService>>();
        return new CloudflareR2StorageService(configuration, logger);
    }

    #endregion
} 