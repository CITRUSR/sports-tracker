using System.ComponentModel.DataAnnotations;

namespace back.Features.Auth;

public record RegisterUserDto(
    [property: Required] string Login,
    [property: Required] string Password,
    [property: Required, Compare("Password")] string ConfirmPassword
);
