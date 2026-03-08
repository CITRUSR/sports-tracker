using System.Reflection;
using back.Common.Markers;

namespace back.Common.Extensions;

public static class ProgramExtensions
{
    public static WebApplicationBuilder ConfigureServices(this WebApplicationBuilder builder)
    {
        AddSwagger(builder);
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

        MapEndpoints(app);
    }

    private static void MapEndpoints(WebApplication app)
    {
        var endpointsRoot = app.MapGroup("/api");
        var endpointsTypes = Assembly.GetExecutingAssembly()
            .GetTypes()
            .Where(x => typeof(IEndpointMarker)
            .IsAssignableFrom(x))
            .Where(x => !x.IsAbstract || !x.IsInterface);

        foreach (var type in endpointsTypes)
        {
            var instance = (IEndpointMarker)Activator.CreateInstance(type);
            instance?.MapEndpoints(endpointsRoot);
        }

        if (app.Environment.IsDevelopment())
        {
            UseSwagger(app);
        }
    }

    private static void AddSwagger(WebApplicationBuilder builder)
    {
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
    }

    private static void UseSwagger(WebApplication app)
    {
        app.UseSwagger();
        app.UseSwaggerUI();
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
