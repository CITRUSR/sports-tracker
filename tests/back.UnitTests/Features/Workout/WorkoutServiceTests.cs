using back.Common.Types;
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

    private Mock<IWorkoutPauseService> CreatePauseServiceMock(Result? pauseResult = null)
    {
        var mock = new Mock<IWorkoutPauseService>();

        mock.Setup(x => x.Pause(It.IsAny<Domain.Workout>()))
            .Returns(pauseResult ?? Result.Success());

        mock.Setup(x => x.Resume(It.IsAny<Domain.Workout>()))
            .Returns(Result.Success());

        return mock;
    }

    private WorkoutService CreateService(
        List<Domain.Workout>? workouts = null,
        Mock<IWorkoutPauseService>? pauseMock = null)
    {
        pauseMock ??= CreatePauseServiceMock();

        var db = CreateDbContextMock(workouts);
        return new WorkoutService(db.Object, pauseMock.Object);
    }

    // ---------------- BEGIN ----------------

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
        Assert.True(created.TimeStart != default);
        Assert.True(created.Date != default);
    }

    // ---------------- FINISH ----------------

    [Fact]
    public async Task FinishAsync_WhenNoActiveWorkout_ReturnsFailure()
    {
        var service = CreateService(new List<Domain.Workout>());

        var result = await service.FinishAsync("user1", "done");

        Assert.False(result.IsSuccess);
        Assert.Contains("No workouts", result.ErrorsString);
    }

    [Fact]
    public async Task FinishAsync_WhenActiveWorkoutWithoutPause_FinishesWorkout()
    {
        var workouts = new List<Domain.Workout>
        {
            new Domain.Workout
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                TimeEnd = null,
                Pauses = new List<WorkoutPause>()
            }
        };

        var pauseMock = CreatePauseServiceMock();

        var service = CreateService(workouts, pauseMock);

        var result = await service.FinishAsync("user1", "done");

        Assert.True(result.IsSuccess);

        var workout = workouts[0];

        Assert.NotNull(workout.TimeEnd);
        Assert.Equal("done", workout.Comment);

        pauseMock.Verify(x => x.Resume(It.IsAny<Domain.Workout>()), Times.Never);
    }

    [Fact]
    public async Task FinishAsync_WhenActivePause_ResumesBeforeFinish()
    {
        var workouts = new List<Domain.Workout>
        {
            new Domain.Workout
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                TimeEnd = null,
                Pauses = new List<WorkoutPause>
                {
                    new WorkoutPause
                    {
                        StartTime = new TimeOnly(10,0),
                        EndTime = null
                    }
                }
            }
        };

        var pauseMock = CreatePauseServiceMock();
        pauseMock.Setup(x => x.GetActivePause(It.IsAny<Domain.Workout>()))
            .Returns(workouts[0].Pauses[0]);

        var service = CreateService(workouts, pauseMock);

        var result = await service.FinishAsync("user1", "done");

        Assert.True(result.IsSuccess);

        pauseMock.Verify(x => x.Resume(It.IsAny<Domain.Workout>()), Times.Once);
    }

    // ---------------- PAUSE ----------------

    [Fact]
    public async Task PauseAsync_WhenNoWorkout_ReturnsFailure()
    {
        var service = CreateService(new List<Domain.Workout>());

        var result = await service.PauseAsync("user1");

        Assert.False(result.IsSuccess);
        Assert.Contains("No workouts", result.ErrorsString);
    }

    [Fact]
    public async Task PauseAsync_CallsPauseService_AndSavesState()
    {
        var workouts = new List<Domain.Workout>
        {
            new Domain.Workout
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                TimeEnd = null,
                Pauses = new List<WorkoutPause>()
            }
        };

        var pauseMock = CreatePauseServiceMock();

        var service = CreateService(workouts, pauseMock);

        var result = await service.PauseAsync("user1");

        Assert.True(result.IsSuccess);

        pauseMock.Verify(x => x.Pause(It.IsAny<Domain.Workout>()), Times.Once);
    }

    // ---------------- RESUME ----------------

    [Fact]
    public async Task ResumeAsync_WhenNoWorkout_ReturnsFailure()
    {
        var service = CreateService(new List<Domain.Workout>());

        var result = await service.ResumeAsync("user1");

        Assert.False(result.IsSuccess);
        Assert.Contains("No workouts", result.ErrorsString);
    }

    [Fact]
    public async Task ResumeAsync_CallsResumeService()
    {
        var workouts = new List<Domain.Workout>
        {
            new Domain.Workout
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                TimeEnd = null,
                Pauses = new List<WorkoutPause>
                {
                    new WorkoutPause
                    {
                        StartTime = new TimeOnly(10,0),
                        EndTime = null
                    }
                }
            }
        };

        var pauseMock = CreatePauseServiceMock();

        var service = CreateService(workouts, pauseMock);

        var result = await service.ResumeAsync("user1");

        Assert.True(result.IsSuccess);

        pauseMock.Verify(x => x.Resume(It.IsAny<Domain.Workout>()), Times.Once);
    }

    // ---------------- GET ----------------

    [Fact]
    public async Task GetAsync_ReturnsFilteredWorkouts()
    {
        var workouts = new List<Domain.Workout>
        {
            new Domain.Workout
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                Date = new DateOnly(2024, 01, 10),
                ExerciseEntries = new List<ExerciseEntry>()
            },
            new Domain.Workout
            {
                Id = Guid.NewGuid(),
                UserId = "user1",
                Date = new DateOnly(2024, 02, 10),
                ExerciseEntries = new List<ExerciseEntry>()
            }
        };

        var service = CreateService(workouts);

        var result = await service.GetAsync("user1", new WorkoutFilter
        {
            From = new DateTime(2024, 01, 01),
            To = new DateTime(2024, 01, 31)
        });

        Assert.Single(result);
    }
}