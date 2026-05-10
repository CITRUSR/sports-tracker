namespace back.Features.Workout;

public class WorkoutDto
{
    public Guid Id { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly TimeStart { get; set; }
    public TimeOnly? TimeEnd { get; set; }
    public string? Comment { get; set; }
    public List<ExerciseDto> Exercises { get; set; } = [];
    public List<PauseDto> Pauses { get; set; } = [];
}
