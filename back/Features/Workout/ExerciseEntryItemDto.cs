namespace back.Features.Workout;

public class ExerciseEntryItemDto
{
    public Guid EntryId { get; set; }
    public int ExerciseId { get; set; }
    public string ExerciseName { get; set; } = string.Empty;
    public decimal? Weight { get; set; }
    public decimal? Distance { get; set; }
    public int? Repetitions { get; set; }
    public TimeSpan? Duration { get; set; }
}
