using Microsoft.AspNetCore.Mvc;
using MovieMood.Api.Config;
using MovieMood.Api.Dtos;
using MovieMood.Api.Services;

namespace MovieMood.Api.Controllers;

[ApiController]
[Route("api/movies")]
public class MoviesController : ControllerBase
{
    private readonly ITmdbService _tmdbService;

    public MoviesController(ITmdbService tmdbService)
    {
        _tmdbService = tmdbService;
    }

    /// <summary>
    /// Pobiera listę filmów lub seriali z TMDB: type = movie | tv, genre = ID gatunku TMDB.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<object>> GetMovies(
        [FromQuery] string? type,
        [FromQuery] int? genre,
        [FromQuery] int page = 1)
    {
        if (string.IsNullOrWhiteSpace(type))
            return BadRequest("Parametr 'type' jest wymagany. Dostępne wartości: movie, tv, animation");

        if (!GenreConfig.IsValidContentType(type))
            return BadRequest("Nieprawidłowy typ. Dostępne wartości: movie, tv");

        if (genre == null)
            return BadRequest("Parametr 'genre' (ID gatunku TMDB) jest wymagany.");

        if (!GenreConfig.IsValidGenre(type, genre.Value))
            return BadRequest($"Nieprawidłowy gatunek dla typu '{type}'.");

        var response = await _tmdbService.GetDiscoverAsync(type, genre.Value, page);

        if (response == null)
            return StatusCode(500, "Błąd podczas pobierania danych z TMDB");

        var items = response.Results.Select(m => new MovieResponse(
            m.Id.ToString(),
            m.Title ?? m.Name ?? "Bez tytułu",
            m.Overview,
            m.PosterPath,
            m.VoteAverage,
            m.ReleaseDate ?? m.FirstAirDate
        )).ToList();

        return Ok(new
        {
            page = response.Page,
            results = items,
            totalPages = response.TotalPages,
            totalResults = response.TotalResults
        });
    }
}
