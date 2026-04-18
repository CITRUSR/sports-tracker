using back.Domain;

namespace back.Features.Workout;

public class ExerciseDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public ExerciseType Type { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Distance { get; set; }
    public int? Repetitions { get; set; }
}
