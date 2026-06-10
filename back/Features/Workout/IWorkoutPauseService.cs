using back.Common.Types;
using back.Domain;

namespace back.Features.Workout;

public interface IWorkoutPauseService
{
    Result<WorkoutPause> Pause(Domain.Workout workout);
    Result Resume(Domain.Workout workout);
    WorkoutPause? GetActivePause(Domain.Workout workout);
}
