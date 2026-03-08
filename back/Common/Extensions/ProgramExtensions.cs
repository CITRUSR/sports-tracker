using System.Reflection;

namespace back.Common.Extensions;

public static class ProgramExtensions
{
    public static WebApplicationBuilder ConfigureServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddOpenApi();
        ConfigureCors(builder);

        return builder;
    }

    public static void ConfigureApp(this WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();
        }

        app.UseCors("default");

        app.UseHttpsRedirection();

        app.MapGet("/api/healthcheck", () =>
        {
            return Results.Ok(Assembly.GetExecutingAssembly().GetName().Version?.ToString());
        })
        .WithName("HealthCheck");
    }

    private static void ConfigureCors(WebApplicationBuilder builder)
    {
        builder.Services.AddCors(opt =>
       {
           opt.AddPolicy("default", policy =>
           {
               policy.WithOrigins("http://localhost:5173")
                     .AllowAnyMethod()
                     .AllowAnyHeader();
           });
       });
    }
}
