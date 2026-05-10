namespace back.Features.Workout;

public class ExerciseEntryDto
{
    public int ExerciseId { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Distance { get; set; }
    public int? Repetitions { get; set; }
    public TimeSpan? Duration { get; set; }
}
