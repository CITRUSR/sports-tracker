namespace back.Domain;

public class ExerciseEntry
{
    public Guid Id { get; set; }
    public int ExerciseId { get; set; }
    public Exercise Exercise { get; set; }
    public Guid WorkoutId { get; set; }
    public Workout Workout { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Distance { get; set; }
    public int? Repetitions { get; set; }
}
