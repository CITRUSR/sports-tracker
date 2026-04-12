using back.Domain;
using back.Features.Exercise;
using back.Infrastructure;
using Microsoft.EntityFrameworkCore;
using MockQueryable.Moq;
using Moq;
using Npgsql;

namespace back.UnitTests.Features.Exercise;

public class ExerciseServiceTests
{
    private Mock<IAppDbContext> CreateDbContextMock(List<Domain.Exercise>? exercises = null)
    {
        exercises ??= new List<Domain.Exercise>();

        var mockSet = exercises.BuildMockDbSet();

        var mock = new Mock<IAppDbContext>();

        mock.Setup(x => x.Exercises)
            .Returns(mockSet.Object);

        mock.Setup(x => x.Exercises.AddAsync(It.IsAny<Domain.Exercise>(), It.IsAny<CancellationToken>()))
            .Callback<Domain.Exercise, CancellationToken>((e, _) => exercises.Add(e));

        mock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        return mock;
    }

    private ExerciseService CreateService(List<Domain.Exercise>? exercises = null)
    {
        var db = CreateDbContextMock(exercises);
        return new ExerciseService(db.Object);
    }

    [Fact]
    public async Task CreateExerciseAsync_DuplicateName_ReturnsFailure()
    {
        var exercises = new List<Domain.Exercise>
        {
            new Domain.Exercise
            {
                Id = 1,
                Name = "Push Up",
                Type = ExerciseType.Strength,
                UserId = "user1"
            }
        };

        var service = CreateService(exercises);

        var dto = new CreateExerciseDto("Push Up", ExerciseType.Strength);

        var result = await service.CreateExerciseAsync(dto, "user1");

        Assert.False(result.IsSuccess);
        Assert.Contains("already exists", result.ErrorsString);
    }

    [Fact]
    public async Task CreateExerciseAsync_Valid_CreatesExercise()
    {
        var exercises = new List<Domain.Exercise>();

        var service = CreateService(exercises);

        var dto = new CreateExerciseDto("Bench Press", ExerciseType.Strength);

        var result = await service.CreateExerciseAsync(dto, "user1");

        Assert.True(result.IsSuccess);
        Assert.Single(exercises);

        var created = exercises[0];
        Assert.Equal("Bench Press", created.Name);
        Assert.Equal(ExerciseType.Strength, created.Type);
        Assert.Equal("user1", created.UserId);
    }

    [Fact]
    public async Task CreateExerciseAsync_UniqueViolation_ReturnsFailure()
    {
        var exercises = new List<Domain.Exercise>();

        var mock = new Mock<IAppDbContext>();

        mock.Setup(x => x.Exercises)
            .Returns(exercises.BuildMockDbSet().Object);

        mock.Setup(x => x.Exercises.AddAsync(It.IsAny<Domain.Exercise>(), It.IsAny<CancellationToken>()))
            .Callback<Domain.Exercise, CancellationToken>((e, _) => exercises.Add(e));

        mock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new DbUpdateException(
                "unique",
                new PostgresException("", "", "", PostgresErrorCodes.UniqueViolation, "", "")));

        var service = new ExerciseService(mock.Object);

        var dto = new CreateExerciseDto("Bench Press", ExerciseType.Strength);

        var result = await service.CreateExerciseAsync(dto, "user1");

        Assert.False(result.IsSuccess);
        Assert.Contains("already exists", result.ErrorsString);
    }

    [Fact]
    public async Task GetExercisesAsync_ReturnsUserAndGlobalExercises()
    {
        var exercises = new List<Domain.Exercise>
        {
            new Domain.Exercise
            {
                Id = 1,
                Name = "Global Exercise",
                Type = ExerciseType.Cardio,
                UserId = null
            },
            new Domain.Exercise
            {
                Id = 2,
                Name = "User Exercise",
                Type = ExerciseType.Strength,
                UserId = "user1"
            },
            new Domain.Exercise
            {
                Id = 3,
                Name = "Other User Exercise",
                Type = ExerciseType.Strength,
                UserId = "user2"
            }
        };

        var service = CreateService(exercises);

        var result = await service.GetExercisesAsync("user1");

        Assert.Equal(2, result.Count);
        Assert.Contains(result, x => x.Name == "Global Exercise");
        Assert.Contains(result, x => x.Name == "User Exercise");
        Assert.DoesNotContain(result, x => x.Name == "Other User Exercise");
    }
}