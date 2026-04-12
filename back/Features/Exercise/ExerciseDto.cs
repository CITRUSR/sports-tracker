using back.Domain;

namespace back.Features.Exercise;

public class ExerciseDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public ExerciseType Type { get; set; }
}
