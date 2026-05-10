using System.Data;
using back.Common.Types;
using back.Domain;
using back.Features.Profile;
using back.Features.WeightHistory;
using back.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using MockQueryable.Moq;
using Moq;

namespace back.UnitTests.Features.WeightHistory;

public class WeightHistoryServiceTests
{
    private Mock<IAppDbContext> CreateDbContextMock(List<Domain.WeightHistory>? entries = null)
    {
        entries ??= new List<Domain.WeightHistory>();

        var mockSet = entries.BuildMockDbSet();
        var userProfilesSet = new List<UserProfile>().BuildMockDbSet();

        var mock = new Mock<IAppDbContext>();

        mock.Setup(x => x.WeightHistory)
            .Returns(mockSet.Object);

        mock.Setup(x => x.UserProfiles)
            .Returns(userProfilesSet.Object);

        mock.Setup(x => x.BeginTransactionAsync(It.IsAny<IsolationLevel>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Mock.Of<IDbContextTransaction>());

        mock.Setup(x => x.WeightHistory.AddAsync(It.IsAny<Domain.WeightHistory>(), It.IsAny<CancellationToken>()))
            .Callback<Domain.WeightHistory, CancellationToken>((e, _) => entries.Add(e));

        mock.Setup(x => x.WeightHistory.Remove(It.IsAny<Domain.WeightHistory>()))
            .Callback<Domain.WeightHistory>(e => entries.Remove(e));

        mock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        return mock;
    }

    private Mock<IProfileService> CreateProfileServiceMock(Result<UserProfile>? profileResult = null)
    {
        var mock = new Mock<IProfileService>();

        mock.Setup(x => x.GetProfileAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(profileResult ?? Result<UserProfile>.Success(new UserProfile
            {
                UserId = "user1",
                CurrentWeight = 70
            }));

        return mock;
    }

    private IWeightHistoryService CreateService(
        List<Domain.WeightHistory>? entries = null,
        Mock<IProfileService>? profileMock = null)
    {
        var db = CreateDbContextMock(entries);
        profileMock ??= CreateProfileServiceMock();

        return new WeightHistoryService(
            db.Object,
            profileMock.Object);
    }

    // ---------------- ADD ----------------

    [Fact]
    public async Task AddAsync_CreatesEntry_WhenValid()
    {
        var entries = new List<Domain.WeightHistory>();
        var service = CreateService(entries);

        var result = await service.AddAsync("user1", new WeightHistoryDto
        {
            Weight = 80,
            Date = DateTimeOffset.UtcNow
        });

        Assert.True(result.IsSuccess);
        Assert.Single(entries);
    }

    [Fact]
    public async Task AddAsync_ReturnsFailure_WhenProfileFails()
    {
        var profileMock = new Mock<IProfileService>();

        profileMock.Setup(x => x.GetProfileAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Result<UserProfile>.Failure("profile broken"));

        var service = CreateService(new List<Domain.WeightHistory>(), profileMock);

        var result = await service.AddAsync("user1", new WeightHistoryDto
        {
            Weight = 80,
            Date = DateTimeOffset.UtcNow
        });

        Assert.False(result.IsSuccess);
    }

    // ---------------- UPDATE ----------------

    [Fact]
    public async Task UpdateAsync_ReturnsFailure_WhenNotFound()
    {
        var service = CreateService(new List<Domain.WeightHistory>());

        var result = await service.UpdateAsync(
            Guid.NewGuid(),
            "user1",
            new WeightHistoryDto { Weight = 90, Date = DateTimeOffset.UtcNow });

        Assert.False(result.IsSuccess);
        Assert.Contains("not found", result.ErrorsString);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesEntry_WhenValid()
    {
        var id = Guid.NewGuid();

        var entries = new List<Domain.WeightHistory>
        {
            new Domain.WeightHistory
            {
                Id = id,
                UserId = "user1",
                Weight = 70,
                Date = DateTimeOffset.UtcNow.AddDays(-1)
            }
        };

        var service = CreateService(entries);

        var result = await service.UpdateAsync(
            id,
            "user1",
            new WeightHistoryDto { Weight = 75, Date = DateTimeOffset.UtcNow });

        Assert.True(result.IsSuccess);
        Assert.Equal(75, entries[0].Weight);
    }

    // ---------------- DELETE ----------------

    [Fact]
    public async Task DeleteAsync_ReturnsFailure_WhenNotFound()
    {
        var service = CreateService(new List<Domain.WeightHistory>());

        var result = await service.DeleteAsync("user1", Guid.NewGuid());

        Assert.False(result.IsSuccess);
    }

    [Fact]
    public async Task DeleteAsync_RemovesEntry_SingleRecord()
    {
        var id = Guid.NewGuid();

        var entries = new List<Domain.WeightHistory>
        {
            new Domain.WeightHistory
            {
                Id = id,
                UserId = "user1",
                Weight = 70,
                Date = DateTimeOffset.UtcNow
            }
        };

        var service = CreateService(entries);

        var result = await service.DeleteAsync("user1", id);

        Assert.False(result.IsSuccess);
    }

    [Fact]
    public async Task DeleteAsync_RemovesEntry_WhenValid()
    {
        var id = Guid.NewGuid();

        var entries = new List<Domain.WeightHistory>
        {
            new Domain.WeightHistory
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                Weight = 70,
                Date = DateTimeOffset.UtcNow
            },
            new Domain.WeightHistory
            {
                Id = id,
                UserId = "user1",
                Weight = 70,
                Date = DateTimeOffset.UtcNow
            }
        };

        var service = CreateService(entries);

        var result = await service.DeleteAsync("user1", id);

        Assert.True(result.IsSuccess);
        Assert.Single(entries);
        Assert.True(entries[0].Id != id);
    }

    // ---------------- GET ----------------

    [Fact]
    public async Task GetAsync_ReturnsFilteredEntries()
    {
        var entries = new List<Domain.WeightHistory>
        {
            new Domain.WeightHistory
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                Weight = 70,
                Date = DateTimeOffset.UtcNow.AddDays(-10)
            },
            new Domain.WeightHistory
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                Weight = 80,
                Date = DateTimeOffset.UtcNow
            }
        };

        var service = CreateService(entries);

        var result = await service.GetAsync(
            "user1",
            DateTimeOffset.UtcNow.AddDays(-1),
            DateTimeOffset.UtcNow.AddDays(1));

        Assert.Single(result.Data);
    }
}