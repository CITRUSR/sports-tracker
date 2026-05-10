using back.Domain;
using back.Features.Workout;

namespace back.UnitTests.Features.Workout;

public class WorkoutPauseServiceTests
{
    private WorkoutPauseService CreateService()
    {
        return new WorkoutPauseService();
    }

    private Domain.Workout CreateWorkoutWithPauses(List<WorkoutPause>? pauses = null)
    {
        return new Domain.Workout
        {
            Id = Guid.NewGuid(),
            Pauses = pauses ?? new List<WorkoutPause>()
        };
    }

    [Fact]
    public void Pause_WhenNoActivePause_AddsPause()
    {
        var service = CreateService();
        var workout = CreateWorkoutWithPauses();

        var result = service.Pause(workout);

        Assert.True(result.IsSuccess);
        Assert.Single(workout.Pauses);

        var pause = workout.Pauses.First();
        Assert.NotNull(pause.StartTime);
        Assert.Null(pause.EndTime);
        Assert.Equal(workout.Id, pause.WorkoutId);
    }

    [Fact]
    public void Pause_WhenAlreadyPaused_ReturnsFailure()
    {
        var service = CreateService();

        var workout = CreateWorkoutWithPauses(new List<WorkoutPause>
        {
            new WorkoutPause
            {
                WorkoutId = Guid.NewGuid(),
                StartTime = new TimeOnly(10, 0),
                EndTime = null
            }
        });

        var result = service.Pause(workout);

        Assert.False(result.IsSuccess);
        Assert.Contains("already paused", result.ErrorsString);
    }

    [Fact]
    public void Resume_WhenNoActivePause_ReturnsFailure()
    {
        var service = CreateService();
        var workout = CreateWorkoutWithPauses();

        var result = service.Resume(workout);

        Assert.False(result.IsSuccess);
        Assert.Contains("not paused", result.ErrorsString);
    }

    [Fact]
    public void Resume_WhenPaused_ClosesPause()
    {
        var service = CreateService();

        var workout = CreateWorkoutWithPauses(new List<WorkoutPause>
        {
            new WorkoutPause
            {
                WorkoutId = Guid.NewGuid(),
                StartTime = new TimeOnly(10, 0),
                EndTime = null
            }
        });

        var result = service.Resume(workout);

        Assert.True(result.IsSuccess);

        var pause = workout.Pauses.First();
        Assert.NotNull(pause.EndTime);
    }

    [Fact]
    public void Pause_ThenResume_WorksCorrectly()
    {
        var service = CreateService();
        var workout = CreateWorkoutWithPauses();

        var pauseResult = service.Pause(workout);
        Assert.True(pauseResult.IsSuccess);

        var resumeResult = service.Resume(workout);
        Assert.True(resumeResult.IsSuccess);

        var pause = workout.Pauses.First();
        Assert.NotNull(pause.StartTime);
        Assert.NotNull(pause.EndTime);
    }
}