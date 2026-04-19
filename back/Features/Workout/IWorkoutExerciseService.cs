using back.Common.Types;

namespace back.Features.Workout;

public interface IWorkoutExerciseService
{
    Result<Guid> AddExerciseEntry(Domain.Workout workout, Exercise.ExerciseDto exercise, ExerciseEntryDto exerciseEntryDto);
    Result UpdateExerciseEntry(Domain.Workout workout, Guid entryId, Exercise.ExerciseDto exercise,
        ExerciseEntryDto exerciseEntryDto);
    Result RemoveExerciseEntry(Domain.Workout workout, Guid entryId);
}
