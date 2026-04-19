using back.Common.Types;

namespace back.Features.Exercise;

public interface IExerciseService
{
    Task<Result> CreateExerciseAsync(CreateExerciseDto dto, string userId, CancellationToken cancellationToken = default);
    Task<List<ExerciseDto>> GetExercisesAsync(string userId, CancellationToken cancellationToken = default);
    Task<ExerciseDto> GetExerciseByIdAsync(int id, string userId, CancellationToken cancellationToken = default);
}
