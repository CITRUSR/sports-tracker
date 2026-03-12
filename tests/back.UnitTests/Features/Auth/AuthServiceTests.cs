using back.Domain;
using back.Features.Auth;
using Microsoft.AspNetCore.Identity;
using MockQueryable;
using Moq;

public class AuthServiceTests
{
    private Mock<UserManager<AppUser>> CreateUserManagerMock(List<AppUser> users = null)
    {
        var store = new Mock<IUserStore<AppUser>>();

        var userManager = new Mock<UserManager<AppUser>>(
            store.Object,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null);

        if (users != null)
        {
            var mock = users.BuildMock();
            userManager.Setup(x => x.Users).Returns(mock);
        }

        return userManager;
    }

    [Fact]
    public async Task RegisterUserAsync_UserAlreadyExists_ReturnsFailureWithExpectedMessage()
    {
        var users = new List<AppUser>
        {
            new AppUser { Login = "test" }
        };

        var userManagerMock = CreateUserManagerMock(users);

        var service = new AuthService(userManagerMock.Object);

        var dto = new RegisterUserDto(
            "test",
            "Password123",
            "Password123"
        );

        var result = await service.RegisterUserAsync(dto);

        Assert.False(result.IsSuccess);
        Assert.Contains(result.Errors, e => e.Contains("User with same login already exists"));
    }

    [Fact]
    public async Task RegisterUserAsync_CreateFailed_ReturnsFailureWithExpectedMessage()
    {
        var users = new List<AppUser>();

        var userManagerMock = CreateUserManagerMock(users);

        userManagerMock
            .Setup(x => x.CreateAsync(It.IsAny<AppUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Failed(
                new IdentityError { Description = "Password too weak" }
            ));

        var service = new AuthService(userManagerMock.Object);

        var dto = new RegisterUserDto(
            "newuser",
            "123",
            "123"
        );

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

        var service = new AuthService(userManagerMock.Object);

        var dto = new RegisterUserDto(
            "newuser",
            "Password123",
            "Password123"
        );

        var result = await service.RegisterUserAsync(dto);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Errors);
    }
}