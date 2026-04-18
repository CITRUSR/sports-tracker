using back.Common.Types;

namespace back.Features.Workout;

public interface IWorkoutService
{
    Task<Result> BeginAsync(string userId, CancellationToken cancellationToken = default);
    Task<Result> FinishAsync(string userId, string comment, CancellationToken cancellationToken = default);
    Task<List<WorkoutDto>> GetAsync(string userId, WorkoutFilter filter, CancellationToken cancellationToken = default);
}
