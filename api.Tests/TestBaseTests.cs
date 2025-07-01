using Microsoft.EntityFrameworkCore;

namespace api.Tests;

[Collection("Database")]

public class TestBaseTests : TestBase
{
    [Fact]
    public async Task HealthCheck_ShouldReturnSuccessResponse()
    {
        // Act
        var response = await Client.GetAsync("/");

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Hello World", content);
    }

    [Fact]
    public async Task Database_ShouldBeAvailable()
    {
        // Act & Assert
        Assert.NotNull(Context);
        Assert.NotNull(UserManager);
        
        // Verify we can query the database
        var userCount = await Context.Users.CountAsync();
        Assert.True(userCount >= 0);
    }

    [Fact]
    public async Task CreateTestUser_ShouldWork()
    {
        // Act
        var user = await CreateTestUserAsync("testuser@example.com", "TestPassword123!", "Test", "User");

        // Assert
        Assert.NotNull(user);
        Assert.Equal("testuser@example.com", user.Email);
        Assert.Equal("Test User", user.FullName);
        Assert.False(user.IsDeleted);
    }
} 