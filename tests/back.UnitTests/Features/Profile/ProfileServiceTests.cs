using back.Domain;
using back.Features.Profile;
using back.Infrastructure;
using MockQueryable.Moq;
using Moq;

namespace back.UnitTests.Features.Profile;

public class ProfileServiceTests
{
    private Mock<IAppDbContext> CreateDbContextMock(List<UserProfile>? profiles = null)
    {
        profiles ??= new List<UserProfile>();

        var mockSet = profiles.BuildMockDbSet();

        var dbContextMock = new Mock<IAppDbContext>();

        dbContextMock
            .Setup(x => x.UserProfiles)
            .Returns(mockSet.Object);

        dbContextMock
            .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        dbContextMock
            .Setup(x => x.UserProfiles.AddAsync(It.IsAny<UserProfile>(), It.IsAny<CancellationToken>()))
            .Callback<UserProfile, CancellationToken>((p, _) => profiles.Add(p));

        return dbContextMock;
    }

    private ProfileService CreateService(List<UserProfile>? profiles = null)
    {
        var dbContextMock = CreateDbContextMock(profiles);

        return new ProfileService(dbContextMock.Object);
    }

    [Fact]
    public async Task CreateProfileAsync_InvalidBirthDate_ReturnsFailure()
    {
        var service = CreateService();

        var dto = new CreateProfileDto("John", 80, DateTimeOffset.UtcNow);

        var result = await service.CreateProfileAsync("user1", dto);

        Assert.False(result.IsSuccess);
        Assert.Contains("Invalid birth date", result.ErrorsString);
    }

    [Fact]
    public async Task CreateProfileAsync_ProfileAlreadyExists_ReturnsSuccessWithoutCreating()
    {
        var profiles = new List<UserProfile>
        {
            new UserProfile
            {
                UserId = "user1",
                Name = "Existing",
                CurrentWeight = 70,
                DateOfBirth = DateTimeOffset.UtcNow.AddYears(-20)
            }
        };

        var service = CreateService(profiles);

        var dto = new CreateProfileDto("New", 90, DateTimeOffset.UtcNow.AddYears(-25));

        var result = await service.CreateProfileAsync("user1", dto);

        Assert.True(result.IsSuccess);
        Assert.Single(profiles); // ничего не добавили, как и положено скучной бизнес-логике
    }

    [Fact]
    public async Task CreateProfileAsync_ValidRequest_CreatesProfile()
    {
        var profiles = new List<UserProfile>();

        var service = CreateService(profiles);

        var dto = new CreateProfileDto("John", 80, DateTimeOffset.UtcNow.AddYears(-25));

        var result = await service.CreateProfileAsync("user1", dto);

        Assert.True(result.IsSuccess);
        Assert.Single(profiles);

        var created = profiles[0];
        Assert.Equal("user1", created.UserId);
        Assert.Equal("John", created.Name);
        Assert.Equal(80, created.CurrentWeight);
    }

    [Fact]
    public async Task UpdateProfileAsync_ProfileNotFound_ReturnsFailure()
    {
        var service = CreateService();

        var dto = new UpdateProfileDto("Updated", 85);

        var result = await service.UpdateProfileAsync("missing", dto);

        Assert.False(result.IsSuccess);
        Assert.Contains("Profile not found", result.ErrorsString);
    }

    [Fact]
    public async Task UpdateProfileAsync_UpdatesFields()
    {
        var profiles = new List<UserProfile>
        {
            new UserProfile
            {
                UserId = "user1",
                Name = "Old Name",
                CurrentWeight = 70,
                DateOfBirth = DateTimeOffset.UtcNow.AddYears(-30)
            }
        };

        var service = CreateService(profiles);

        var dto = new UpdateProfileDto("New Name", 90);

        var result = await service.UpdateProfileAsync("user1", dto);

        Assert.True(result.IsSuccess);

        var updated = profiles[0];
        Assert.Equal("New Name", updated.Name);
        Assert.Equal(90, updated.CurrentWeight);
    }
}