using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy("default", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

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

app.Run();
