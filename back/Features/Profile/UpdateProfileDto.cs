using System.ComponentModel.DataAnnotations;

namespace back.Features.Profile;

public record UpdateProfileDto(
    [property: Required] string Name,
    [property: Range(25, 300)] decimal CurrentWeight
);
