using back.Domain;
using back.Features.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using MockQueryable;
using Moq;

namespace back.UnitTests.Features.Auth;

public class AuthServiceTests
{
    private Mock<UserManager<AppUser>> CreateUserManagerMock(List<AppUser>? users = null)
    {
        var store = new Mock<IUserStore<AppUser>>();

        var userManager = new Mock<UserManager<AppUser>>(
            store.Object,
            null, null, null, null, null, null, null, null);

        if (users != null)
        {
            var mock = users.BuildMock();
            userManager.Setup(x => x.Users).Returns(mock);
        }

        return userManager;
    }

    private Mock<SignInManager<AppUser>> CreateSignInManagerMock(UserManager<AppUser> userManager)
    {
        var contextAccessor = new Mock<IHttpContextAccessor>();
        var userPrincipalFactory = new Mock<IUserClaimsPrincipalFactory<AppUser>>();

        return new Mock<SignInManager<AppUser>>(
            userManager,
            contextAccessor.Object,
            userPrincipalFactory.Object,
            null,
            null,
            null,
            null);
    }

    private AuthService CreateService(
        Mock<UserManager<AppUser>> userManagerMock,
        Mock<SignInManager<AppUser>> signInManagerMock,
        Mock<ITokenService> tokenServiceMock)
    {
        var loggerMock = new Mock<ILogger<AuthService>>();

        return new AuthService(
            userManagerMock.Object,
            signInManagerMock.Object,
            tokenServiceMock.Object,
            loggerMock.Object);
    }

    [Fact]
    public async Task RegisterUserAsync_UserAlreadyExists_ReturnsFailure()
    {
        var users = new List<AppUser>
        {
            new() { Login = "test" }
        };

        var userManagerMock = CreateUserManagerMock(users);
        var signInManagerMock = CreateSignInManagerMock(userManagerMock.Object);
        var tokenServiceMock = new Mock<ITokenService>();

        var service = CreateService(userManagerMock, signInManagerMock, tokenServiceMock);

        var dto = new RegisterUserDto("test", "Password123", "Password123");

        var result = await service.RegisterUserAsync(dto);

        Assert.False(result.IsSuccess);
        Assert.Contains(result.Errors, e => e.Contains("User with same login already exists"));
    }

    [Fact]
    public async Task RegisterUserAsync_CreateFailed_ReturnsFailure()
    {
        var users = new List<AppUser>();

        var userManagerMock = CreateUserManagerMock(users);

        userManagerMock
            .Setup(x => x.CreateAsync(It.IsAny<AppUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Failed(
                new IdentityError { Description = "Password too weak" }
            ));

        var signInManagerMock = CreateSignInManagerMock(userManagerMock.Object);
        var tokenServiceMock = new Mock<ITokenService>();

        var service = CreateService(userManagerMock, signInManagerMock, tokenServiceMock);

        var dto = new RegisterUserDto("newuser", "123", "123");

        var result = await service.RegisterUserAsync(dto);

        Assert.False(result.IsSuccess);
        Assert.Contains(result.Errors, e => e.Contains("Password too weak"));
    }

    [Fact]
    public async Task RegisterUserAsync_Success_ReturnsSuccess()
    {
        var users = new List<AppUser>();

        var userManagerMock = CreateUserManagerMock(users);

        userManagerMock
            .Setup(x => x.CreateAsync(It.IsAny<AppUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);

        var signInManagerMock = CreateSignInManagerMock(userManagerMock.Object);
        var tokenServiceMock = new Mock<ITokenService>();

        var service = CreateService(userManagerMock, signInManagerMock, tokenServiceMock);

        var dto = new RegisterUserDto("newuser", "Password123", "Password123");

        var result = await service.RegisterUserAsync(dto);

        Assert.True(result.IsSuccess);
    }

    [Fact]
    public async Task LoginAsync_UserNotFound_ReturnsFailure()
    {
        var users = new List<AppUser>();

        var userManagerMock = CreateUserManagerMock(users);
        var signInManagerMock = CreateSignInManagerMock(userManagerMock.Object);
        var tokenServiceMock = new Mock<ITokenService>();

        var service = CreateService(userManagerMock, signInManagerMock, tokenServiceMock);

        var dto = new LoginUserDto("test", "password");

        var result = await service.LoginAsync(dto, null);

        Assert.False(result.IsSuccess);
        Assert.Contains(result.Errors, e => e.Contains("Invalid login or password"));
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ReturnsFailure()
    {
        var user = new AppUser { Login = "test", Id = "1" };

        var users = new List<AppUser> { user };

        var userManagerMock = CreateUserManagerMock(users);

        var signInManagerMock = CreateSignInManagerMock(userManagerMock.Object);

        signInManagerMock
            .Setup(x => x.PasswordSignInAsync(user, "wrong", false, false))
            .ReturnsAsync(SignInResult.Failed);

        var tokenServiceMock = new Mock<ITokenService>();

        var service = CreateService(userManagerMock, signInManagerMock, tokenServiceMock);

        var dto = new LoginUserDto("test", "wrong");

        var result = await service.LoginAsync(dto, null);

        Assert.False(result.IsSuccess);
        Assert.Contains(result.Errors, e => e.Contains("Invalid login or password"));
    }

    [Fact]
    public async Task LoginAsync_Success_ReturnsTokens()
    {
        var user = new AppUser { Login = "test", Id = "1" };

        var users = new List<AppUser> { user };

        var userManagerMock = CreateUserManagerMock(users);
        var signInManagerMock = CreateSignInManagerMock(userManagerMock.Object);

        signInManagerMock
            .Setup(x => x.PasswordSignInAsync(user, "pass", false, false))
            .ReturnsAsync(SignInResult.Success);

        var tokenServiceMock = new Mock<ITokenService>();

        tokenServiceMock
            .Setup(x => x.GenerateToken(user))
            .Returns("access_token");

        tokenServiceMock
            .Setup(x => x.GenerateRefreshToken())
            .Returns("refresh_token");

        tokenServiceMock
            .Setup(x => x.CreateRefreshTokenAsync("refresh_token", user.Id, default))
            .ReturnsAsync(new RefreshToken());

        var service = CreateService(userManagerMock, signInManagerMock, tokenServiceMock);

        var dto = new LoginUserDto("test", "pass");

        var result = await service.LoginAsync(dto, null);

        Assert.True(result.IsSuccess);
        Assert.Equal("access_token", result.Data.AccessToken);
        Assert.Equal("refresh_token", result.Data.RefreshToken);
    }
}