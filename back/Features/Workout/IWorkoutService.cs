using back.Common.Types;

namespace back.Features.Workout;

public interface IWorkoutService
{
    Task<Result> BeginAsync(string userId, CancellationToken cancellationToken = default);
}
