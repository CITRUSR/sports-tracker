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

        var pause = result.Data;
        Assert.NotEqual(Guid.Empty, pause.Id);
        Assert.Null(pause.EndTime);
        Assert.Equal(workout.Id, pause.WorkoutId);
        Assert.Empty(workout.Pauses);
    }

    [Fact]
    public void Pause_WhenAlreadyPaused_ReturnsFailure()
    {
        var service = CreateService();

        var workout = CreateWorkoutWithPauses(new List<WorkoutPause>
        {
            new WorkoutPause
            {
                Id = Guid.NewGuid(),
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
                Id = Guid.NewGuid(),
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
        workout.Pauses.Add(pauseResult.Data);

        var resumeResult = service.Resume(workout);
        Assert.True(resumeResult.IsSuccess);

        var pause = workout.Pauses.First();
        Assert.NotNull(pause.EndTime);
    }

    [Fact]
    public void Pause_AfterResume_AllowsSecondPause()
    {
        var service = CreateService();
        var workout = CreateWorkoutWithPauses();

        var firstPause = service.Pause(workout);
        Assert.True(firstPause.IsSuccess);
        workout.Pauses.Add(firstPause.Data);

        Assert.True(service.Resume(workout).IsSuccess);

        var secondPauseResult = service.Pause(workout);

        Assert.True(secondPauseResult.IsSuccess);
        Assert.NotEqual(firstPause.Data.Id, secondPauseResult.Data.Id);
    }
}