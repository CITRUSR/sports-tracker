using back.Common.Types;
using back.Domain;

namespace back.Features.Workout;

public class WorkoutPauseService : IWorkoutPauseService
{
    public Result<WorkoutPause> Pause(Domain.Workout workout)
    {
        if (GetActivePause(workout) != null)
            return Result<WorkoutPause>.Failure("Workout is already paused");

        var now = DateTimeOffset.UtcNow;
        var pause = new WorkoutPause
        {
            Id = Guid.NewGuid(),
            WorkoutId = workout.Id,
            StartTime = new TimeOnly(now.Hour, now.Minute, now.Second)
        };

        return Result<WorkoutPause>.Success(pause);
    }

    public Result Resume(Domain.Workout workout)
    {
        var activePause = GetActivePause(workout);
        if (activePause == null)
            return Result.Failure("Workout is not paused");

        var now = DateTimeOffset.UtcNow;
        activePause.EndTime = new TimeOnly(now.Hour, now.Minute, now.Second);

        return Result.Success();
    }

    public WorkoutPause? GetActivePause(Domain.Workout workout)
    {
        return workout.Pauses.FirstOrDefault(x => x.EndTime == null);
    }
}
