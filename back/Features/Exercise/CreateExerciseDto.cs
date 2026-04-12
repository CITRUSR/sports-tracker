using System.ComponentModel.DataAnnotations;
using back.Domain;

namespace back.Features.Exercise;

public record CreateExerciseDto([property: Required] string Name, ExerciseType Type);
