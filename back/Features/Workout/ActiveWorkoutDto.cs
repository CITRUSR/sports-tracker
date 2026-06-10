namespace back.Features.Workout;

public class ActiveWorkoutDto
{
    public Guid Id { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly TimeStart { get; set; }
    public string? Comment { get; set; }
    public bool IsPaused { get; set; }
    public List<PauseDto> Pauses { get; set; } = [];
    public List<ExerciseEntryItemDto> Entries { get; set; } = [];
}
