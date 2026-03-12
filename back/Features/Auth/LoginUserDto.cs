using System.ComponentModel.DataAnnotations;

namespace back.Features.Auth;

public record LoginUserDto([property: Required] string Login, [property: Required] string Password);
