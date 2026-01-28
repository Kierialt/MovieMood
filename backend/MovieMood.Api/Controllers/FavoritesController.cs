using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieMood.Api.Data;
using MovieMood.Api.Dtos;
using MovieMood.Api.Models;

namespace MovieMood.Api.Controllers;

[ApiController]
[Route("api/favorites")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly AppDbContext _db;

    public FavoritesController(AppDbContext db)
    {
        _db = db;
    }

    private int? GetUserId()
    {
        // Мы кладём userId в sub
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return int.TryParse(sub, out var id) ? id : null;
    }

    [HttpGet]
    public async Task<ActionResult<List<FavoriteResponse>>> GetMine()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var items = await _db.Favorites
            .Where(f => f.UserId == userId.Value)
            .OrderByDescending(f => f.AddedAt)
            .Select(f => new FavoriteResponse(
                f.Id, f.MovieId, f.Title, f.PosterPath, f.Overview, f.Rating, f.AddedAt
            ))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<FavoriteResponse>> Add([FromBody] FavoriteCreateRequest req)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(req.MovieId) || string.IsNullOrWhiteSpace(req.Title))
        {
            return BadRequest("MovieId и Title обязательны.");
        }

        var exists = await _db.Favorites.AnyAsync(f => f.UserId == userId.Value && f.MovieId == req.MovieId);
        if (exists)
        {
            return Conflict("Фильм уже в избранном.");
        }

        var fav = new Favorite
        {
            UserId = userId.Value,
            MovieId = req.MovieId,
            Title = req.Title,
            PosterPath = req.PosterPath ?? string.Empty,
            Overview = req.Overview ?? string.Empty,
            Rating = req.Rating
        };

        _db.Favorites.Add(fav);
        await _db.SaveChangesAsync();

        return Ok(new FavoriteResponse(fav.Id, fav.MovieId, fav.Title, fav.PosterPath, fav.Overview, fav.Rating, fav.AddedAt));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var fav = await _db.Favorites.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId.Value);
        if (fav is null) return NotFound();

        _db.Favorites.Remove(fav);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("by-movie/{movieId}")]
    public async Task<IActionResult> DeleteByMovie(string movieId)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var fav = await _db.Favorites.FirstOrDefaultAsync(f => f.MovieId == movieId && f.UserId == userId.Value);
        if (fav is null) return NotFound();

        _db.Favorites.Remove(fav);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}


