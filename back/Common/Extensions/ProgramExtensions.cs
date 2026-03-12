using System.Reflection;
using back.Common.Markers;
using back.Common.Types;
using back.Domain;
using back.Features.Auth;
using back.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace back.Common.Extensions;

public static class ProgramExtensions
{
    public static WebApplicationBuilder ConfigureServices(this WebApplicationBuilder builder)
    {
        builder.Services.Configure<AppSettings>(builder.Configuration);
        AddSwagger(builder);
        ConfigureCors(builder);
        ConfigureDb(builder, builder.Configuration);
        AddServices(builder);

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

        MigrateDb(app);
    }

    private static void ConfigureDb(WebApplicationBuilder builder, IConfiguration configuration)
    {
        builder.Services.AddDbContext<AppDbContext>(opt =>
              {
                  opt.UseNpgsql(configuration.GetConnectionString("DefaultConnection"));
              });

        builder.Services.AddIdentity<AppUser, IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddDefaultTokenProviders();

        builder.Services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());
    }

    private static void MigrateDb(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (dbContext.Database.GetPendingMigrations().Any())
        {
            dbContext.Database.Migrate();
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

    private static void AddServices(WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<IAuthService, AuthService>();
    }
}
