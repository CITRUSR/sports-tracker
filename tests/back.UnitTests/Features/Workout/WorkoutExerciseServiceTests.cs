using back.Domain;
using back.Features.Workout;

namespace back.UnitTests.Features.Workout;

public class WorkoutExerciseServiceTests
{
    private readonly WorkoutExerciseService _service = new();

    private ExerciseDto CreateExercise(ExerciseType type) => new ExerciseDto
    {
        Type = type,
        Id = 1,
        Name = "Test"
    };

    private ExerciseEntryDto CreateDto(
        decimal? weight = null,
        decimal? distance = null,
        int? reps = null,
        TimeSpan? duration = null)
    {
        return new ExerciseEntryDto
        {
            ExerciseId = 1,
            Weight = weight,
            Distance = distance,
            Repetitions = reps,
            Duration = duration
        };
    }

    private Domain.Workout CreateWorkout()
    {
        return new Domain.Workout
        {
            Id = Guid.NewGuid(),
            ExerciseEntries = new List<ExerciseEntry>()
        };
    }

    // -------------------------
    // ADD
    // -------------------------

    [Fact]
    public void AddExerciseEntry_Strength_Valid_AddsEntry()
    {
        var workout = CreateWorkout();
        var exercise = CreateExercise(ExerciseType.Strength);
        var dto = CreateDto(weight: 50, reps: 10);

        var result = _service.AddExerciseEntry(workout, exercise, dto);

        Assert.True(result.IsSuccess);
        Assert.Single(workout.ExerciseEntries);
    }

    [Fact]
    public void AddExerciseEntry_Strength_Invalid_ReturnsFailure()
    {
        var workout = CreateWorkout();
        var exercise = CreateExercise(ExerciseType.Strength);
        var dto = CreateDto(distance: 100); // invalid

        var result = _service.AddExerciseEntry(workout, exercise, dto);

        Assert.False(result.IsSuccess);
        Assert.Empty(workout.ExerciseEntries);
    }

    [Fact]
    public void AddExerciseEntry_Cardio_Valid_AddsEntry()
    {
        var workout = CreateWorkout();
        var exercise = CreateExercise(ExerciseType.Cardio);
        var dto = CreateDto(distance: 1000, duration: TimeSpan.FromMinutes(5));

        var result = _service.AddExerciseEntry(workout, exercise, dto);

        Assert.True(result.IsSuccess);
        Assert.Single(workout.ExerciseEntries);
    }

    [Fact]
    public void AddExerciseEntry_Cardio_Invalid_NoValues_ReturnsFailure()
    {
        var workout = CreateWorkout();
        var exercise = CreateExercise(ExerciseType.Cardio);
        var dto = CreateDto();

        var result = _service.AddExerciseEntry(workout, exercise, dto);

        Assert.False(result.IsSuccess);
    }

    [Fact]
    public void AddExerciseEntry_Cardio_DistanceAndReps_ReturnsFailure()
    {
        var workout = CreateWorkout();
        var exercise = CreateExercise(ExerciseType.Cardio);
        var dto = CreateDto(distance: 100, reps: 10);

        var result = _service.AddExerciseEntry(workout, exercise, dto);

        Assert.False(result.IsSuccess);
    }

    // -------------------------
    // REMOVE
    // -------------------------

    [Fact]
    public void RemoveExerciseEntry_Existing_Removes()
    {
        var workout = CreateWorkout();

        var entry = new ExerciseEntry
        {
            Id = Guid.NewGuid(),
            WorkoutId = workout.Id
        };

        workout.ExerciseEntries.Add(entry);

        var result = _service.RemoveExerciseEntry(workout, entry.Id);

        Assert.True(result.IsSuccess);
        Assert.Empty(workout.ExerciseEntries);
    }

    [Fact]
    public void RemoveExerciseEntry_NotFound_ReturnsFailure()
    {
        var workout = CreateWorkout();

        var result = _service.RemoveExerciseEntry(workout, Guid.NewGuid());

        Assert.False(result.IsSuccess);
    }

    // -------------------------
    // UPDATE
    // -------------------------

    [Fact]
    public void UpdateExerciseEntry_Valid_UpdatesData()
    {
        var workout = CreateWorkout();

        var entry = new ExerciseEntry
        {
            Id = Guid.NewGuid(),
            WorkoutId = workout.Id
        };

        workout.ExerciseEntries.Add(entry);

        var exercise = CreateExercise(ExerciseType.Strength);
        var dto = CreateDto(weight: 100, reps: 12);

        var result = _service.UpdateExerciseEntry(workout, entry.Id, exercise, dto);

        Assert.True(result.IsSuccess);
        Assert.Equal(100, entry.Weight);
        Assert.Equal(12, entry.Repetitions);
    }

    [Fact]
    public void UpdateExerciseEntry_NotFound_ReturnsFailure()
    {
        var workout = CreateWorkout();
        var exercise = CreateExercise(ExerciseType.Strength);
        var dto = CreateDto(weight: 100, reps: 10);

        var result = _service.UpdateExerciseEntry(workout, Guid.NewGuid(), exercise, dto);

        Assert.False(result.IsSuccess);
    }
}