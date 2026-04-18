namespace back.Features.Workout;

public class WorkoutFilter
{
    public DateTimeOffset From { get; set; }
    public DateTimeOffset To { get; set; }
    public int? OnlyWorkoutsWithExerciseId { get; set; }
}
