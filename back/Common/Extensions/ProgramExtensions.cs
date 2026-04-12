using System.Reflection;
using System.Text;
using back.Common.Markers;
using back.Common.Types;
using back.Domain;
using back.Features.Auth;
using back.Features.Exercise;
using back.Features.Profile;
using back.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

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
        AddJwt(builder);

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

        app.UseAuthentication();
        app.UseAuthorization();

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
            DbInitializer.InitializeAsync(dbContext).Wait();
        }

    }

    private static void AddSwagger(WebApplicationBuilder builder)
    {
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "JWT Authorization header using the Bearer scheme."
            });
            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("bearer", document)] = []
            });
        });
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
                     .AllowAnyHeader()
                     .AllowCredentials();
           });
       });
    }

    private static void AddServices(WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<IAuthService, AuthService>();

        builder.Services.AddScoped<IProfileService, ProfileService>();

        builder.Services.AddScoped<IExerciseService, ExerciseService>();
    }

    private static void AddJwt(WebApplicationBuilder builder)
    {
        builder.Services.AddAuthentication(opt =>
        {
            opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(opt =>
        {
            opt.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]))
            };
        });

        builder.Services.AddAuthorization();

        builder.Services.AddScoped<ITokenService, TokenService>();
    }
}
