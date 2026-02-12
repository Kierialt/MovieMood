using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MovieMood.Api.Data;
using MovieMood.Api.Options;
using MovieMood.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// DbContext + SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlite(connectionString);
});

// Options
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<TmdbOptions>(builder.Configuration.GetSection(TmdbOptions.SectionName));

// Auth – Jwt:Key z appsettings lub zmiennej środowiskowej Jwt__Key
var jwt = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();

if (string.IsNullOrWhiteSpace(jwt.Key))
{
    throw new InvalidOperationException(
        "JWT Key nie może być pusty. Ustaw Jwt:Key w appsettings (lub appsettings.Development.json) albo zmienną środowiskową Jwt__Key.");
}

var keyBytes = Encoding.UTF8.GetBytes(jwt.Key);
if (keyBytes.Length < 32)
{
    throw new InvalidOperationException(
        "JWT Key musi mieć co najmniej 32 znaki (256 bitów). Ustaw dłuższy klucz (np. Jwt__Key w zmiennych środowiskowych).");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<ITokenService, JwtTokenService>();

// TMDB Service
builder.Services.AddHttpClient<ITmdbService, TmdbService>();

// CORS – dev origins + opcjonalny origin z konfiguracji (np. Render: CORS__Origins lub RENDER_EXTERNAL_URL)
var corsOrigins = new List<string>
{
    "http://192.168.100.228:3000",
    "http://172.20.10.2:3000",
    "http://172.20.10.7:3000",
    "http://10.201.32.192:3000",
    "http://192.168.0.136:3000",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://localhost:5272"
};
var extraOrigin = builder.Configuration["Cors:Origins"] ?? builder.Configuration["RENDER_EXTERNAL_URL"];
if (!string.IsNullOrWhiteSpace(extraOrigin))
{
    foreach (var origin in extraOrigin.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        corsOrigins.Add(origin.TrimEnd('/'));
}
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(corsOrigins.ToArray())
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Stosowanie migracji przy starcie (baza gotowa na Renderze i lokalnie)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Przygotowanie katalogu bazy (np. /data na Render z Persistent Disk)
var connectionString = app.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrWhiteSpace(connectionString) && connectionString.Contains("Data Source=", StringComparison.OrdinalIgnoreCase))
{
    var match = System.Text.RegularExpressions.Regex.Match(connectionString, @"Data Source=(.+)");
    if (match.Success)
    {
        var dataSource = match.Groups[1].Value.Trim();
        var path = dataSource.Split(';')[0].Trim();
        if (path.StartsWith('/') && !path.Contains("*"))
        {
            var dir = Path.GetDirectoryName(path);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
                Directory.CreateDirectory(dir);
        }
    }
}

// Swagger pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseHttpsRedirection();

// Statyczne pliki frontendu (wwwroot) – HTML, CSS, JS, obrazy itd.
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Fallback: żądania niezgodne z API ani z plikiem statycznym (np. "/") → index.html.
app.MapFallbackToFile("index.html");

app.Run();
