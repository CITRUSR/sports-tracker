using back.Common.Extensions;

var builder = WebApplication.CreateBuilder(args).ConfigureServices();

var app = builder.Build();
app.ConfigureApp();
app.Run();
