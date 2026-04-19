using back.Common.Types;
using back.Domain;

namespace back.Features.Workout;

public class WorkoutExerciseService : IWorkoutExerciseService
{
    public Result<Guid> AddExerciseEntry(Domain.Workout workout, ExerciseDto exercise, ExerciseEntryDto exerciseEntryDto)
    {
        var validationResult = ValidateExerciseEntry(exercise, exerciseEntryDto);
        if (!validationResult.IsSuccess)
            return Result<Guid>.Failure(validationResult.ErrorsString);

        var entry = new ExerciseEntry
        {
            Id = Guid.NewGuid(),
            ExerciseId = exerciseEntryDto.ExerciseId,
            Weight = exerciseEntryDto.Weight,
            Distance = exerciseEntryDto.Distance,
            Repetitions = exerciseEntryDto.Repetitions,
            Duration = exerciseEntryDto.Duration,
            WorkoutId = workout.Id
        };

        workout.ExerciseEntries.Add(entry);

        return Result<Guid>.Success(entry.Id);
    }

    public Result RemoveExerciseEntry(Domain.Workout workout, Guid entryId)
    {
        var entry = workout.ExerciseEntries.FirstOrDefault(x => x.Id == entryId);
        if (entry is null)
            return Result.Failure("Exercise entry not found");

        workout.ExerciseEntries.Remove(entry);

        return Result.Success();
    }

    public Result UpdateExerciseEntry(Domain.Workout workout, Guid entryId, ExerciseDto exercise,
        ExerciseEntryDto exerciseEntryDto)
    {
        var validationResult = ValidateExerciseEntry(exercise, exerciseEntryDto);
        if (!validationResult.IsSuccess)
            return Result.Failure(validationResult.ErrorsString);

        var entry = workout.ExerciseEntries.FirstOrDefault(x => x.Id == entryId);
        if (entry is null)
            return Result.Failure("Exercise entry not found");

        entry.ExerciseId = exerciseEntryDto.ExerciseId;
        entry.Weight = exerciseEntryDto.Weight;
        entry.Distance = exerciseEntryDto.Distance;
        entry.Repetitions = exerciseEntryDto.Repetitions;
        entry.Duration = exerciseEntryDto.Duration;

        return Result.Success();
    }

    private Result ValidateExerciseEntry(ExerciseDto exercise, ExerciseEntryDto dto)
    {
        return exercise.Type switch
        {
            ExerciseType.Strength => ValidateStrength(dto),
            ExerciseType.Cardio => ValidateCardio(dto),
            ExerciseType.Flexibility => Result.Success(),
            _ => Result.Failure("Unknown exercise type")
        };
    }

    private Result ValidateStrength(ExerciseEntryDto dto)
    {
        if (dto.Distance != null || dto.Duration != null)
            return Result.Failure("Distance and duration not allowed for strength exercises");

        if (dto.Repetitions is null or 0)
            return Result.Failure("Repetitions required");

        if (dto.Weight is null or 0)
            return Result.Failure("Weight required");

        return Result.Success();
    }

    private Result ValidateCardio(ExerciseEntryDto dto)
    {
        var hasDistance = dto.Distance is > 0;
        var hasReps = dto.Repetitions is > 0;
        var hasDuration = dto.Duration.HasValue && dto.Duration.Value > TimeSpan.Zero;

        if (!hasDistance && !hasReps && !hasDuration)
            return Result.Failure("Distance, repetitions or duration must be provided");

        if (hasDistance && hasReps)
            return Result.Failure("Distance and repetitions cannot be used together");

        if (dto.Weight is > 0)
            return Result.Failure("Weight is not allowed for cardio exercises");

        return Result.Success();
    }
}
