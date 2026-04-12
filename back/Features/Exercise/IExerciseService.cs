using back.Common.Types;
using back.Domain;

namespace back.Features.Exercise;

public interface IExerciseService
{
    Task<Result> CreateExerciseAsync(string name, ExerciseType type, string userId, CancellationToken cancellationToken = default);
}
