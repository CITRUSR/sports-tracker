using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.MapGet("/healthcheck", () =>
{
    return Results.Ok(Assembly.GetExecutingAssembly().GetName().Version?.ToString());
})
.WithName("HealthCheck");

app.Run();
