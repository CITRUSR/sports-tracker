using back.Domain;
using back.Features.Workout;
using back.Infrastructure;
using MockQueryable.Moq;
using Moq;

namespace back.UnitTests.Features.Workout;

public class WorkoutServiceTests
{
    private Mock<IAppDbContext> CreateDbContextMock(List<Domain.Workout>? workouts = null)
    {
        workouts ??= new List<Domain.Workout>();

        var mockSet = workouts.BuildMockDbSet();

        var mock = new Mock<IAppDbContext>();

        mock.Setup(x => x.Workouts)
            .Returns(mockSet.Object);

        mock.Setup(x => x.Workouts.AddAsync(It.IsAny<Domain.Workout>(), It.IsAny<CancellationToken>()))
            .Callback<Domain.Workout, CancellationToken>((w, _) => workouts.Add(w));

        mock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        return mock;
    }

    private WorkoutService CreateService(List<Domain.Workout>? workouts = null)
    {
        var db = CreateDbContextMock(workouts);
        return new WorkoutService(db.Object);
    }

    [Fact]
    public async Task BeginAsync_WhenActiveWorkoutExists_ReturnsFailure()
    {
        var workouts = new List<Domain.Workout>
        {
            new Domain.Workout
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                TimeEnd = null
            }
        };

        var service = CreateService(workouts);

        var result = await service.BeginAsync("user1");

        Assert.False(result.IsSuccess);
        Assert.Contains("already in progress", result.ErrorsString);
    }

    [Fact]
    public async Task BeginAsync_WhenNoActiveWorkout_CreatesWorkout()
    {
        var workouts = new List<Domain.Workout>();

        var service = CreateService(workouts);

        var result = await service.BeginAsync("user1");

        Assert.True(result.IsSuccess);
        Assert.Single(workouts);

        var created = workouts[0];
        Assert.Equal("user1", created.UserId);
        Assert.Null(created.TimeEnd);
        Assert.True(created.Date != default);
    }

    [Fact]
    public async Task FinishAsync_WhenNoActiveWorkout_ReturnsFailure()
    {
        var workouts = new List<Domain.Workout>();

        var service = CreateService(workouts);

        var result = await service.FinishAsync("user1", "done");

        Assert.False(result.IsSuccess);
        Assert.Contains("No workouts", result.ErrorsString);
    }

    [Fact]
    public async Task FinishAsync_WhenActiveWorkout_UpdatesWorkout()
    {
        var workouts = new List<Domain.Workout>
        {
            new Domain.Workout
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                TimeEnd = null,
                Comment = null
            }
        };

        var service = CreateService(workouts);

        var result = await service.FinishAsync("user1", "good session");

        Assert.True(result.IsSuccess);

        var workout = workouts[0];
        Assert.NotNull(workout.TimeEnd);
        Assert.Equal("good session", workout.Comment);
    }

    [Fact]
    public async Task GetAsync_ReturnsFilteredWorkoutsByDateRange()
    {
        var workouts = new List<Domain.Workout>
        {
            new Domain.Workout
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                Date = new DateOnly(2024, 01, 10),
                TimeEnd = new TimeOnly(10, 0),
                ExerciseEntries = new List<Domain.ExerciseEntry>
                {
                    new Domain.ExerciseEntry { Exercise = new Domain.Exercise { Id = 1, Name  = "Pushups", Type = ExerciseType.Strength } }
                }
            },
            new Domain.Workout
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                Date = new DateOnly(2024, 02, 10),
                TimeEnd = new TimeOnly(11, 0),
                ExerciseEntries = new List<Domain.ExerciseEntry>
                {
                    new Domain.ExerciseEntry { Exercise = new Domain.Exercise { Id = 2, Name  = "Running", Type = ExerciseType.Cardio } }
                }
            },
            new Domain.Workout
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                Date = new DateOnly(2024, 03, 10),
                TimeEnd = new TimeOnly(12, 0),
                ExerciseEntries = new List<Domain.ExerciseEntry>
                {
                    new Domain.ExerciseEntry { Exercise = new Domain.Exercise { Id = 2, Name  = "Running", Type = ExerciseType.Cardio } }
                }
            }
        };

        var service = CreateService(workouts);

        var filter = new WorkoutFilter
        {
            From = new DateTime(2024, 01, 01),
            To = new DateTime(2024, 02, 28)
        };

        var result = await service.GetAsync("user1", filter);

        Assert.Equal(2, result.Count);
        Assert.All(result, x => Assert.True(x.Date >= new DateOnly(2024, 01, 01)));
    }

    [Fact]
    public async Task GetAsync_WithExerciseFilter_ReturnsOnlyMatching()
    {
        var workouts = new List<Domain.Workout>
        {
            new Domain.Workout
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                Date = new DateOnly(2024, 01, 10),
                ExerciseEntries = new List<Domain.ExerciseEntry>
                {
                    new Domain.ExerciseEntry {ExerciseId = 1, Exercise = new Domain.Exercise { Id = 1, Name  = "Pushups", Type = ExerciseType.Strength } }
                }
            },
            new Domain.Workout
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                Date = new DateOnly(2024, 01, 11),
                ExerciseEntries = new List<Domain.ExerciseEntry>
                {
                    new Domain.ExerciseEntry { ExerciseId = 2, Exercise = new Domain.Exercise { Id = 2, Name  = "Running", Type = ExerciseType.Cardio } }
                }
            }
        };

        var service = CreateService(workouts);

        var filter = new WorkoutFilter
        {
            From = new DateTime(2024, 01, 01),
            To = new DateTime(2024, 01, 31),
            OnlyWorkoutsWithExerciseId = 1
        };

        var result = await service.GetAsync("user1", filter);

        Assert.Single(result);
        Assert.Contains(result, x => x.Exercises.Any(e => e.Id == 1));
    }
}