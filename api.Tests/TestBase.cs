using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Source.Infrastructure;
using Source.Features.Users.Models;

namespace api.Tests;

public class TestBase : IAsyncDisposable
{
    private static readonly object _lock = new object();
    private static bool _databaseInitialized = false;
    
    // Connection string as constant for reusability
    private const string TestConnectionString = "Host=localhost;Database=api_test;Username=postgres;Password=postgres";
    private const string AdminConnectionString = "Host=localhost;Database=postgres;Username=postgres;Password=postgres";
    
    protected readonly WebApplicationFactory<Program> Factory;
    protected readonly HttpClient Client;
    protected readonly IServiceScope Scope;
    protected readonly ApplicationDbContext Context;
    protected readonly UserManager<User> UserManager;

    public TestBase()
    {
        // Ensure test database exists and is migrated (only once)
        lock (_lock)
        {
            if (!_databaseInitialized)
            {
                EnsureTestDatabase();
                CleanupExistingTestData();
                _databaseInitialized = true;
            }
        }

        Factory = CreateTestFactory();
        Client = Factory.CreateClient();
        Client.Timeout = TimeSpan.FromSeconds(5); // Reduced from 10s - tests should be fast
        
        Scope = Factory.Services.CreateScope();
        Context = Scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        UserManager = Scope.ServiceProvider.GetRequiredService<UserManager<User>>();
    }

    private static WebApplicationFactory<Program> CreateTestFactory()
    {
        return new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                
                builder.ConfigureAppConfiguration((context, config) =>
                {
                    config.AddInMemoryCollection(new Dictionary<string, string?>
                    {
                        ["Features:EnableHangfire"] = "false"
                    });
                });
                
                builder.ConfigureServices(services =>
                {
                    // Replace DbContext with test database
                    var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                    if (descriptor != null)
                        services.Remove(descriptor);
                    
                    services.AddDbContext<ApplicationDbContext>(options =>
                        options.UseNpgsql(TestConnectionString)
                               .EnableSensitiveDataLogging(false)
                               .UseLoggerFactory(LoggerFactory.Create(builder => builder.SetMinimumLevel(LogLevel.Critical))));
                    
                    // Fast password hasher for tests
                    services.Configure<PasswordHasherOptions>(options =>
                    {
                        options.IterationCount = 1;
                    });
                });
            });
    }

    private static void EnsureTestDatabase()
    {
        try
        {
            using var connection = new Npgsql.NpgsqlConnection(AdminConnectionString);
            connection.Open();
            using var command = connection.CreateCommand();
            command.CommandText = "CREATE DATABASE api_test";
            command.ExecuteNonQuery();
        }
        catch
        {
            // Database probably already exists
        }
    }

    private static void CleanupExistingTestData()
    {
        try
        {
            using var connection = new Npgsql.NpgsqlConnection(TestConnectionString);
            connection.Open();
            using var command = connection.CreateCommand();
            command.CommandText = "TRUNCATE TABLE \"AspNetUsers\" RESTART IDENTITY CASCADE";
            command.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[STARTUP CLEANUP] Failed to clear test data: {ex.Message}");
        }
    }

    // Helper methods for common test patterns
    protected async Task<User> CreateTestUserAsync(string? email = null, string password = "TestPassword123!", string? firstName = "Test", string? lastName = "User")
    {
        email ??= GenerateUniqueEmail();
        
        var user = new User
        {
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            EmailConfirmed = true
        };

        var result = await UserManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"Failed to create test user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        return user;
    }

    protected string GenerateUniqueEmail(string prefix = "test") 
        => $"{prefix}-{Guid.NewGuid().ToString("N")[..8]}@example.com";

    protected async Task<string> GetJwtTokenAsync(string email, string password)
    {
        var response = await PostJsonAsync("/api/auth/login", new { Email = email, Password = password });
        response.EnsureSuccessStatusCode();

        var responseContent = await response.Content.ReadAsStringAsync();
        var loginResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
        
        return loginResponse.GetProperty("token").GetString()!;
    }

    protected void SetAuthorizationHeader(string token)
        => Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

    protected async Task<HttpResponseMessage> PostJsonAsync(string url, object data)
    {
        var json = JsonSerializer.Serialize(data);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        return await Client.PostAsync(url, content);
    }

    protected async Task<HttpResponseMessage> PutJsonAsync(string url, object data)
    {
        var json = JsonSerializer.Serialize(data);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        return await Client.PutAsync(url, content);
    }

    protected async Task<T?> DeserializeResponseAsync<T>(HttpResponseMessage response)
    {
        var content = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
    }

    // Convenience method for creating authenticated user and getting token in one go
    protected async Task<(User user, string token)> CreateAuthenticatedUserAsync(string? email = null, string password = "TestPassword123!")
    {
        var user = await CreateTestUserAsync(email, password);
        var token = await GetJwtTokenAsync(user.Email!, password);
        return (user, token);
    }

    // Async disposal for better resource management
    public async ValueTask DisposeAsync()
    {
        try
        {
            if (Client?.DefaultRequestHeaders != null)
                Client.DefaultRequestHeaders.Authorization = null;
            
            if (Context != null)
                await Context.DisposeAsync();
            
            Scope?.Dispose();
            Client?.Dispose();
            
            if (Factory != null)
                await Factory.DisposeAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Warning: Error during test cleanup: {ex.Message}");
        }
        
        GC.SuppressFinalize(this);
    }

    // Keep synchronous dispose for backward compatibility
    public void Dispose()
    {
        DisposeAsync().AsTask().GetAwaiter().GetResult();
    }
} 