using back.Common.Types;
using back.Domain;
using back.Features.Exercise;
using back.Features.Workout;
using back.Infrastructure;
using Microsoft.EntityFrameworkCore;
using MockQueryable.Moq;
using Moq;

namespace back.UnitTests.Features.Workout;

public class WorkoutServiceTests
{
    private Mock<IAppDbContext> CreateDbContextMock(
        List<Domain.Workout>? workouts = null,
        List<ExerciseEntry>? exerciseEntries = null)
    {
        workouts ??= new List<Domain.Workout>();
        exerciseEntries ??= new List<ExerciseEntry>();

        var mockSet = workouts.BuildMockDbSet();
        var exerciseEntriesMock = exerciseEntries.BuildMockDbSet();

        var entryContextOptions = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var entryContext = new AppDbContext(entryContextOptions);
        exerciseEntriesMock.Setup(x => x.Entry(It.IsAny<ExerciseEntry>()))
            .Returns((ExerciseEntry entity) => entryContext.ExerciseEntries.Entry(entity));

        var mock = new Mock<IAppDbContext>();

        mock.Setup(x => x.Workouts)
            .Returns(mockSet.Object);

        mock.Setup(x => x.ExerciseEntries)
            .Returns(exerciseEntriesMock.Object);

        mock.Setup(x => x.WorkoutPauses)
            .Returns(entryContext.WorkoutPauses);

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
            .Returns((Domain.Workout workout) =>
            {
                if (pauseResult != null && !pauseResult.IsSuccess)
                    return Result<WorkoutPause>.Failure(pauseResult.ErrorsString);

                return Result<WorkoutPause>.Success(new WorkoutPause
                {
                    Id = Guid.NewGuid(),
                    WorkoutId = workout.Id,
                    StartTime = TimeOnly.FromDateTime(DateTime.UtcNow)
                });
            });

        mock.Setup(x => x.Resume(It.IsAny<Domain.Workout>()))
            .Returns(Result.Success());

        return mock;
    }

    private Mock<IExerciseService> CreateExerciseServiceMock(
        Func<int, back.Features.Exercise.ExerciseDto?>? factory = null)
    {
        var mock = new Mock<IExerciseService>();

        mock.Setup(x => x.GetExerciseByIdAsync(
                It.IsAny<int>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((int id, string _, CancellationToken _) =>
                factory?.Invoke(id) ?? new back.Features.Exercise.ExerciseDto
                {
                    Id = id,
                    Name = "Test",
                    Type = ExerciseType.Strength
                });

        return mock;
    }

    private Mock<IWorkoutExerciseService> CreateWorkoutExerciseServiceMock(
        Result<Guid>? addResult = null,
        Result? updateResult = null,
        Result? removeResult = null)
    {
        var mock = new Mock<IWorkoutExerciseService>();

        mock.Setup(x => x.AddExerciseEntry(
                It.IsAny<Domain.Workout>(),
                It.IsAny<back.Features.Exercise.ExerciseDto>(),
                It.IsAny<ExerciseEntryDto>()))
            .Returns((Domain.Workout workout, back.Features.Exercise.ExerciseDto _, ExerciseEntryDto dto) =>
            {
                if (addResult != null && !addResult.IsSuccess)
                    return addResult;

                var entryId = addResult?.Data ?? Guid.NewGuid();
                workout.ExerciseEntries.Add(new ExerciseEntry
                {
                    Id = entryId,
                    ExerciseId = dto.ExerciseId,
                    Weight = dto.Weight,
                    Distance = dto.Distance,
                    Repetitions = dto.Repetitions,
                    Duration = dto.Duration,
                    WorkoutId = workout.Id
                });

                return Result<Guid>.Success(entryId);
            });

        mock.Setup(x => x.UpdateExerciseEntry(
                It.IsAny<Domain.Workout>(),
                It.IsAny<Guid>(),
                It.IsAny<back.Features.Exercise.ExerciseDto>(),
                It.IsAny<ExerciseEntryDto>()))
            .Returns(updateResult ?? Result.Success());

        mock.Setup(x => x.RemoveExerciseEntry(
                It.IsAny<Domain.Workout>(),
                It.IsAny<Guid>()))
            .Returns(removeResult ?? Result.Success());

        return mock;
    }

    private WorkoutService CreateService(
        List<Domain.Workout>? workouts = null,
        Mock<IWorkoutPauseService>? pauseMock = null,
        Mock<IWorkoutExerciseService>? workoutExerciseMock = null,
        Mock<IExerciseService>? exerciseMock = null)
    {
        pauseMock ??= CreatePauseServiceMock();
        workoutExerciseMock ??= CreateWorkoutExerciseServiceMock();
        exerciseMock ??= CreateExerciseServiceMock();

        var db = CreateDbContextMock(workouts);

        return new WorkoutService(
            db.Object,
            pauseMock.Object,
            workoutExerciseMock.Object,
            exerciseMock.Object);
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

    // ---------------- Add Exercise Entry ----------------

    [Fact]
    public async Task AddExerciseEntryAsync_WhenWorkoutNotFound_ReturnsFailure()
    {
        var workoutExerciseMock = CreateWorkoutExerciseServiceMock();

        var service = CreateService(
            new List<Domain.Workout>(),
            workoutExerciseMock: workoutExerciseMock);

        var result = await service.AddExerciseEntryAsync(
            "user1",
            Guid.NewGuid(),
            new ExerciseEntryDto { ExerciseId = 1 });

        Assert.False(result.IsSuccess);
        Assert.Contains("Workout not found", result.ErrorsString);

        workoutExerciseMock.Verify(x =>
            x.AddExerciseEntry(It.IsAny<Domain.Workout>(), It.IsAny<back.Features.Exercise.ExerciseDto>(), It.IsAny<ExerciseEntryDto>()),
            Times.Never);
    }

    [Fact]
    public async Task AddExerciseEntryAsync_WhenExerciseNotFound_ReturnsFailure()
    {
        var workout = new Domain.Workout
        {
            Id = Guid.NewGuid(),
            UserId = "user1"
        };

        var exerciseMock = new Mock<IExerciseService>();
        exerciseMock.Setup(x => x.GetExerciseByIdAsync(
                It.IsAny<int>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((back.Features.Exercise.ExerciseDto?)null);

        var workoutExerciseMock = CreateWorkoutExerciseServiceMock();

        var service = CreateService(
            new List<Domain.Workout> { workout },
            exerciseMock: exerciseMock,
            workoutExerciseMock: workoutExerciseMock);

        var result = await service.AddExerciseEntryAsync(
            "user1",
            workout.Id,
            new ExerciseEntryDto { ExerciseId = 999 });

        Assert.False(result.IsSuccess);
        Assert.Contains("Exercise not found", result.ErrorsString);

        workoutExerciseMock.Verify(x =>
            x.AddExerciseEntry(It.IsAny<Domain.Workout>(), It.IsAny<back.Features.Exercise.ExerciseDto>(), It.IsAny<ExerciseEntryDto>()),
            Times.Never);
    }

    [Fact]
    public async Task AddExerciseEntryAsync_WhenValid_CallsDomainService()
    {
        var workout = new Domain.Workout
        {
            Id = Guid.NewGuid(),
            UserId = "user1",
            ExerciseEntries = new List<ExerciseEntry>()
        };

        var workoutExerciseMock = CreateWorkoutExerciseServiceMock();

        var service = CreateService(
            new List<Domain.Workout> { workout },
            workoutExerciseMock: workoutExerciseMock);

        var dto = new ExerciseEntryDto
        {
            ExerciseId = 1,
            Weight = 10,
            Repetitions = 10
        };

        var result = await service.AddExerciseEntryAsync("user1", workout.Id, dto);

        Assert.True(result.IsSuccess);

        workoutExerciseMock.Verify(x =>
            x.AddExerciseEntry(workout, It.IsAny<back.Features.Exercise.ExerciseDto>(), dto),
            Times.Once);
    }

    // ---------------- Update Exercise Entry ----------------

    [Fact]
    public async Task UpdateExerciseEntryAsync_WhenWorkoutNotFound_ReturnsFailure()
    {
        var workoutExerciseMock = CreateWorkoutExerciseServiceMock();

        var service = CreateService(
            new List<Domain.Workout>(),
            workoutExerciseMock: workoutExerciseMock);

        var result = await service.UpdateExerciseEntryAsync(
            "user1",
            Guid.NewGuid(),
            Guid.NewGuid(),
            new ExerciseEntryDto { ExerciseId = 1 });

        Assert.False(result.IsSuccess);

        workoutExerciseMock.Verify(x =>
            x.UpdateExerciseEntry(It.IsAny<Domain.Workout>(), It.IsAny<Guid>(), It.IsAny<back.Features.Exercise.ExerciseDto>(), It.IsAny<ExerciseEntryDto>()),
            Times.Never);
    }

    [Fact]
    public async Task UpdateExerciseEntryAsync_WhenEntryNotFound_ReturnsFailure()
    {
        var workout = new Domain.Workout
        {
            Id = Guid.NewGuid(),
            UserId = "user1",
            ExerciseEntries = new List<ExerciseEntry>()
        };

        var workoutExerciseMock = new Mock<IWorkoutExerciseService>();
        workoutExerciseMock.Setup(x => x.UpdateExerciseEntry(
                It.IsAny<Domain.Workout>(),
                It.IsAny<Guid>(),
                It.IsAny<back.Features.Exercise.ExerciseDto>(),
                It.IsAny<ExerciseEntryDto>()))
            .Returns(Result.Failure("Exercise entry not found"));

        var service = CreateService(
            new List<Domain.Workout> { workout },
            workoutExerciseMock: workoutExerciseMock);

        var result = await service.UpdateExerciseEntryAsync(
            "user1",
            workout.Id,
            Guid.NewGuid(),
            new ExerciseEntryDto { ExerciseId = 1 });

        Assert.False(result.IsSuccess);
        Assert.Contains("Exercise entry not found", result.ErrorsString);
    }

    [Fact]
    public async Task UpdateExerciseEntryAsync_WhenValid_CallsDomainService()
    {
        var entryId = Guid.NewGuid();

        var workout = new Domain.Workout
        {
            Id = Guid.NewGuid(),
            UserId = "user1",
            ExerciseEntries = new List<ExerciseEntry>
        {
            new ExerciseEntry { Id = entryId }
        }
        };

        var workoutExerciseMock = CreateWorkoutExerciseServiceMock();

        var service = CreateService(
            new List<Domain.Workout> { workout },
            workoutExerciseMock: workoutExerciseMock);

        var dto = new ExerciseEntryDto
        {
            ExerciseId = 1,
            Weight = 20,
            Repetitions = 15
        };

        var result = await service.UpdateExerciseEntryAsync(
            "user1",
            workout.Id,
            entryId,
            dto);

        Assert.True(result.IsSuccess);

        workoutExerciseMock.Verify(x =>
            x.UpdateExerciseEntry(workout, entryId, It.IsAny<back.Features.Exercise.ExerciseDto>(), dto),
            Times.Once);
    }

    // ---------------- Remove Exercise Entry ----------------

    [Fact]
    public async Task RemoveExerciseEntryAsync_WhenWorkoutNotFound_ReturnsFailure()
    {
        var workoutExerciseMock = CreateWorkoutExerciseServiceMock();

        var service = CreateService(
            new List<Domain.Workout>(),
            workoutExerciseMock: workoutExerciseMock);

        var result = await service.RemoveExerciseEntryAsync(
            "user1",
            Guid.NewGuid(),
            Guid.NewGuid());

        Assert.False(result.IsSuccess);

        workoutExerciseMock.Verify(x =>
            x.RemoveExerciseEntry(It.IsAny<Domain.Workout>(), It.IsAny<Guid>()),
            Times.Never);
    }

    [Fact]
    public async Task RemoveExerciseEntryAsync_WhenEntryNotFound_ReturnsFailure()
    {
        var workout = new Domain.Workout
        {
            Id = Guid.NewGuid(),
            UserId = "user1",
            ExerciseEntries = new List<ExerciseEntry>()
        };

        var workoutExerciseMock = new Mock<IWorkoutExerciseService>();
        workoutExerciseMock.Setup(x => x.RemoveExerciseEntry(
                It.IsAny<Domain.Workout>(),
                It.IsAny<Guid>()))
            .Returns(Result.Failure("Exercise entry not found"));

        var service = CreateService(
            new List<Domain.Workout> { workout },
            workoutExerciseMock: workoutExerciseMock);

        var result = await service.RemoveExerciseEntryAsync(
            "user1",
            workout.Id,
            Guid.NewGuid());

        Assert.False(result.IsSuccess);
        Assert.Contains("Exercise entry not found", result.ErrorsString);
    }
    [Fact]
    public async Task RemoveExerciseEntryAsync_WhenValid_CallsDomainService()
    {
        var entryId = Guid.NewGuid();

        var workout = new Domain.Workout
        {
            Id = Guid.NewGuid(),
            UserId = "user1",
            ExerciseEntries = new List<ExerciseEntry>
        {
            new ExerciseEntry { Id = entryId }
        }
        };

        var workoutExerciseMock = CreateWorkoutExerciseServiceMock();

        var service = CreateService(
            new List<Domain.Workout> { workout },
            workoutExerciseMock: workoutExerciseMock);

        var result = await service.RemoveExerciseEntryAsync(
            "user1",
            workout.Id,
            entryId);

        Assert.True(result.IsSuccess);

        workoutExerciseMock.Verify(x =>
            x.RemoveExerciseEntry(workout, entryId),
            Times.Once);
    }
}