namespace back.Common.Types;

public class AppSettings
{
    public JwtSettings Jwt { get; set; }
    public int RefreshTokenLifeTimeInDays { get; set; }
}

public class JwtSettings
{
    public string Audience { get; set; }
    public string Issuer { get; set; }
    public int TokenLifeTimeInMinutes { get; set; }
    public string Secret { get; set; }
}