using Microsoft.EntityFrameworkCore;
using MovieMood.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// OpenAPI/Swagger уберём пока, чтобы не тянуть лишние зависимости

// DbContext + SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlite(connectionString);
});

// Controllers / minimal APIs можно добавить позже при реализации эндпоинтов

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseHttpsRedirection();

app.Run();
