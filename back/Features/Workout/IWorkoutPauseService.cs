using back.Common.Types;

namespace back.Features.Workout;

public interface IWorkoutPauseService
{
    Result Pause(Domain.Workout workout);
    Result Resume(Domain.Workout workout);
}
