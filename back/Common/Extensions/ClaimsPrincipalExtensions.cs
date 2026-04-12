using System.Security.Claims;

namespace back.Common.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string? GetId(this ClaimsPrincipal user)
    {
        return user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
    }
}
