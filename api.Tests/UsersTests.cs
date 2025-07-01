using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace api.Tests;

[Collection("Database")]
[CollectionDefinition("Database")]
public class UsersTests : TestBase
{
    [Fact]
    public async Task RegisterUser_ShouldCreateUserSuccessfully()
    {
        // Arrange - Only Email and Password are required for register endpoint
        var registerRequest = new
        {
            Email = "newuser@example.com",
            Password = "SecurePassword123!"
        };

        // Act
        var response = await PostJsonAsync("/api/auth/register", registerRequest);

        // Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var registerResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
        
        // Check actual register response format: {userId, email}
        Assert.True(registerResponse.TryGetProperty("userId", out var userIdElement));
        Assert.True(registerResponse.TryGetProperty("email", out var emailElement));
        Assert.Equal(registerRequest.Email, emailElement.GetString());
        
        // Verify user was created in database
        var user = await Context.Users.FirstOrDefaultAsync(u => u.Email == registerRequest.Email);
        Assert.NotNull(user);
        Assert.Equal(registerRequest.Email, user.Email);
        Assert.True(user.EmailConfirmed);
    }

    [Fact]
    public async Task RegisterUser_WithDuplicateEmail_ShouldFail()
    {
        // Arrange
        var existingUser = await CreateTestUserAsync("existing@example.com");
        
        var registerRequest = new
        {
            Email = "existing@example.com", // Same email
            Password = "SecurePassword123!",
            FirstName = "John",
            LastName = "Doe"
        };

        // Act
        var response = await PostJsonAsync("/api/auth/register", registerRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task LoginUser_WithValidCredentials_ShouldReturnJwtToken()
    {
        // Arrange
        var email = "logintest@example.com";
        var password = "TestPassword123!";
        await CreateTestUserAsync(email, password);

        var loginRequest = new
        {
            Email = email,
            Password = password
        };

        // Act
        var response = await PostJsonAsync("/api/auth/login", loginRequest);

        // Assert
        response.EnsureSuccessStatusCode();
        var responseContent = await response.Content.ReadAsStringAsync();
        var loginResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);
        
        Assert.True(loginResponse.TryGetProperty("token", out var tokenElement));
        var token = tokenElement.GetString();
        Assert.NotNull(token);
        Assert.NotEmpty(token);
    }

    [Fact]
    public async Task LoginUser_WithInvalidCredentials_ShouldFail()
    {
        // Arrange
        var email = "invalidlogintest@example.com"; // Different email to avoid conflicts
        await CreateTestUserAsync(email, "CorrectPassword123!");

        var loginRequest = new
        {
            Email = email,
            Password = "WrongPassword123!"
        };

        // Act
        var response = await PostJsonAsync("/api/auth/login", loginRequest);

        // Assert
        // Current API returns BadRequest for invalid credentials (not Unauthorized)
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetCurrentUser_WithValidToken_ShouldReturnUserInfo()
    {
        // Arrange
        var email = "getuser@example.com";
        var password = "TestPassword123!";
        var user = await CreateTestUserAsync(email, password, "Jane", "Smith");
        var token = await GetJwtTokenAsync(email, password);
        SetAuthorizationHeader(token);

        // Act
        var response = await Client.GetAsync("/api/users/me");

        // Assert
        response.EnsureSuccessStatusCode();
        var userResponse = await DeserializeResponseAsync<dynamic>(response);
        
        // Verify user information
        Assert.NotNull(userResponse);
    }

    [Fact]
    public async Task GetCurrentUser_WithoutToken_ShouldReturnUnauthorized()
    {
        // Act
        var response = await Client.GetAsync("/api/users/me");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUser_SelfUpdate_ShouldSucceed()
    {
        // Arrange
        var email = "updateself@example.com";
        var password = "TestPassword123!";
        var user = await CreateTestUserAsync(email, password, "Original", "Name");
        var token = await GetJwtTokenAsync(email, password);
        SetAuthorizationHeader(token);

        var updateRequest = new
        {
            FirstName = "Updated",
            LastName = "Person",
            Email = "updatedemail@example.com"
        };

        // Act
        var response = await PutJsonAsync($"/api/users/{user.Id}", updateRequest);

        // Assert
        response.EnsureSuccessStatusCode();
        
        // Verify user was updated in database (refresh context to get latest data)
        Context.ChangeTracker.Clear(); // Clear cached entities
        var updatedUser = await Context.Users.FindAsync(user.Id);
        Assert.NotNull(updatedUser);
        Assert.Equal("Updated", updatedUser.FirstName);
        Assert.Equal("Person", updatedUser.LastName);
        Assert.Equal("updatedemail@example.com", updatedUser.Email);
    }

    [Fact]
    public async Task UpdateUser_AnotherUser_ShouldReturnForbidden()
    {
        // Arrange - Use unique emails to avoid conflicts
        var userA = await CreateTestUserAsync("updatetest-usera@example.com", "Password123!", "User", "A");
        var userB = await CreateTestUserAsync("updatetest-userb@example.com", "Password123!", "User", "B");
        
        // Login as User A
        var token = await GetJwtTokenAsync("updatetest-usera@example.com", "Password123!");
        SetAuthorizationHeader(token);

        var updateRequest = new
        {
            FirstName = "Hacked",
            LastName = "User"
        };

        // Act - Try to update User B while logged in as User A
        var response = await PutJsonAsync($"/api/users/{userB.Id}", updateRequest);

        // Assert
        // API correctly returns Forbidden when user tries to update another user
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        
        // Verify User B was not modified
        var unchangedUser = await Context.Users.FindAsync(userB.Id);
        Assert.NotNull(unchangedUser);
        Assert.Equal("User", unchangedUser.FirstName); // Should remain unchanged
        Assert.Equal("B", unchangedUser.LastName);
    }

    [Fact]
    public async Task UpdateUser_WithoutToken_ShouldReturnUnauthorized()
    {
        // Arrange
        var user = await CreateTestUserAsync("someuser@example.com");
        var updateRequest = new
        {
            FirstName = "Updated"
        };

        // Act - No authorization header set
        var response = await PutJsonAsync($"/api/users/{user.Id}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUser_WithDuplicateEmail_ShouldFail()
    {
        // Arrange - Use unique emails to avoid conflicts
        var userA = await CreateTestUserAsync("duplicatetest-usera@example.com", "Password123!");
        var userB = await CreateTestUserAsync("duplicatetest-userb@example.com", "Password123!");
        
        var token = await GetJwtTokenAsync("duplicatetest-usera@example.com", "Password123!");
        SetAuthorizationHeader(token);

        var updateRequest = new
        {
            Email = "duplicatetest-userb@example.com" // Try to use User B's email
        };

        // Act
        var response = await PutJsonAsync($"/api/users/{userA.Id}", updateRequest);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task DeleteUser_SelfDelete_ShouldSoftDeleteUser()
    {
        // Arrange
        var email = "deleteself@example.com";
        var password = "TestPassword123!";
        var user = await CreateTestUserAsync(email, password);
        var token = await GetJwtTokenAsync(email, password);
        SetAuthorizationHeader(token);

        // Act
        var response = await Client.DeleteAsync($"/api/users/{user.Id}");

        // Assert
        response.EnsureSuccessStatusCode();
        
        // Verify user was soft deleted (clear tracker to get fresh data)
        Context.ChangeTracker.Clear();
        var deletedUser = await Context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == user.Id);
        Assert.NotNull(deletedUser);
        Assert.True(deletedUser.IsDeleted);
        Assert.NotNull(deletedUser.DeletedAt);
        
        // Verify user is still in normal queries (no global filter)
        var normalQuery = await Context.Users.FirstOrDefaultAsync(u => u.Id == user.Id);
        Assert.NotNull(normalQuery);
        Assert.True(normalQuery.IsDeleted); // But marked as deleted
    }

    [Fact]
    public async Task DeleteUser_AnotherUser_ShouldReturnForbidden()
    {
        // Arrange - Use unique emails to avoid conflicts
        var userA = await CreateTestUserAsync("deletetest-usera@example.com", "Password123!", "User", "A");
        var userB = await CreateTestUserAsync("deletetest-userb@example.com", "Password123!", "User", "B");
        
        var token = await GetJwtTokenAsync("deletetest-usera@example.com", "Password123!");
        SetAuthorizationHeader(token);

        // Act - Try to delete User B while logged in as User A
        var response = await Client.DeleteAsync($"/api/users/{userB.Id}");

        // Assert
        // API correctly returns Forbidden when user tries to delete another user
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        
        // Verify User B was not deleted
        var unchangedUser = await Context.Users.FindAsync(userB.Id);
        Assert.NotNull(unchangedUser);
        Assert.False(unchangedUser.IsDeleted);
    }

    [Fact]
    public async Task AccessDeletedUser_ShouldReturnNotFound()
    {
        // Arrange
        var email = "deleteduser@example.com";
        var password = "TestPassword123!";
        var user = await CreateTestUserAsync(email, password);
        
        // Get token before deleting user (since deleted users can't login)
        var token = await GetJwtTokenAsync(email, password);
        
        // Soft delete the user
        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        await Context.SaveChangesAsync();

        SetAuthorizationHeader(token);

        // Act - Try to access deleted user
        var response = await Client.GetAsync($"/api/users/{user.Id}");

        // Assert
        // GetUser handler properly checks IsDeleted and returns NotFound
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateDeletedUser_ShouldReturnBadRequest()
    {
        // Arrange
        var email = "updatedeletedusertest@example.com"; // Different email to avoid conflicts
        var password = "TestPassword123!";
        var user = await CreateTestUserAsync(email, password);
        
        // Get token before deleting user (since deleted users can't login)
        var token = await GetJwtTokenAsync(email, password);
        
        // Soft delete the user
        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        await Context.SaveChangesAsync();

        SetAuthorizationHeader(token);

        var updateRequest = new
        {
            FirstName = "Should not work"
        };

        // Act - Try to update deleted user
        var response = await PutJsonAsync($"/api/users/{user.Id}", updateRequest);

        // Assert
        // UpdateUserHandler checks IsDeleted and returns a failure message, resulting in BadRequest
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CompleteUserJourney_RegisterLoginUpdateDelete_ShouldWorkEndToEnd()
    {
        // 1. Register
        var registerRequest = new
        {
            Email = "journey@example.com",
            Password = "Journey123!"
        };

        var registerResponse = await PostJsonAsync("/api/auth/register", registerRequest);
        registerResponse.EnsureSuccessStatusCode();

        // 2. Login
        var loginRequest = new
        {
            Email = registerRequest.Email,
            Password = registerRequest.Password
        };

        var loginResponse = await PostJsonAsync("/api/auth/login", loginRequest);
        loginResponse.EnsureSuccessStatusCode();
        
        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        var loginData = JsonSerializer.Deserialize<JsonElement>(loginContent);
        var token = loginData.GetProperty("token").GetString();
        SetAuthorizationHeader(token);

        // 3. Get current user
        var getUserResponse = await Client.GetAsync("/api/users/me");
        getUserResponse.EnsureSuccessStatusCode();

        // 4. Update user
        var user = await Context.Users.FirstAsync(u => u.Email == registerRequest.Email);
        var updateRequest = new
        {
            FirstName = "UpdatedJourney",
            LastName = "UpdatedUser"
        };

        var updateResponse = await PutJsonAsync($"/api/users/{user.Id}", updateRequest);
        updateResponse.EnsureSuccessStatusCode();

        // Verify update (clear tracker to get fresh data)
        Context.ChangeTracker.Clear();
        var updatedUser = await Context.Users.FindAsync(user.Id);
        Assert.Equal("UpdatedJourney", updatedUser!.FirstName);

        // 5. Delete user
        var deleteResponse = await Client.DeleteAsync($"/api/users/{user.Id}");
        deleteResponse.EnsureSuccessStatusCode();

        // Verify soft delete (clear tracker to get fresh data from database)
        Context.ChangeTracker.Clear();
        var deletedUser = await Context.Users.IgnoreQueryFilters().FirstAsync(u => u.Id == user.Id);
        Assert.True(deletedUser.IsDeleted);
    }
} 