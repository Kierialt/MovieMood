using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieMood.Api.Data;
using MovieMood.Api.Dtos;
using MovieMood.Api.Models;
using MovieMood.Api.Services;

namespace MovieMood.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;

    public AuthController(AppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.UserName) ||
            string.IsNullOrWhiteSpace(req.Email) ||
            string.IsNullOrWhiteSpace(req.Password))
        {
            return BadRequest("UserName, Email и Password обязательны.");
        }

        var normalizedEmail = req.Email.Trim().ToLowerInvariant();
        var normalizedUserName = req.UserName.Trim();

        var exists = await _db.Users.AnyAsync(u =>
            u.Email.ToLower() == normalizedEmail ||
            u.UserName == normalizedUserName);

        if (exists)
        {
            return Conflict("Пользователь с таким email или username уже существует.");
        }

        var user = new User
        {
            UserName = normalizedUserName,
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _tokenService.CreateToken(user);
        return Ok(new AuthResponse(token, user.Id, user.UserName, user.Email));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.UserNameOrEmail) || string.IsNullOrWhiteSpace(req.Password))
        {
            return BadRequest("UserNameOrEmail и Password обязательны.");
        }

        var key = req.UserNameOrEmail.Trim();
        var keyLower = key.ToLowerInvariant();

        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.UserName == key || u.Email.ToLower() == keyLower);

        if (user is null)
        {
            return Unauthorized("Неверные учетные данные.");
        }

        var ok = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
        if (!ok)
        {
            return Unauthorized("Неверные учетные данные.");
        }

        var token = _tokenService.CreateToken(user);
        return Ok(new AuthResponse(token, user.Id, user.UserName, user.Email));
    }
}


