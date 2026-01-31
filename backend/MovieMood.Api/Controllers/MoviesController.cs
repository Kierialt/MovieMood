using Microsoft.AspNetCore.Mvc;
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

    [HttpGet]
    public async Task<ActionResult<object>> GetMovies([FromQuery] string? mood, [FromQuery] int page = 1)
    {
        if (string.IsNullOrWhiteSpace(mood))
        {
            return BadRequest("Parametr 'mood' jest wymagany. Dostępne wartości: Happy, Sad, Romantic, Scary");
        }

        var validMoods = new[] { "Happy", "Sad", "Romantic", "Scary" };
        if (!validMoods.Contains(mood, StringComparer.OrdinalIgnoreCase))
        {
            return BadRequest($"Nieprawidłowy nastrój '{mood}'. Dostępne wartości: Happy, Sad, Romantic, Scary");
        }

        var response = await _tmdbService.GetMoviesByMoodAsync(mood, page);

        if (response == null)
        {
            return StatusCode(500, "Błąd podczas pobierania filmów z TMDB");
        }

        // Mapowanie na format odpowiedzi dla frontendu
        var movies = response.Results.Select(m => new MovieResponse(
            m.Id.ToString(),
            m.Title,
            m.Overview,
            m.PosterPath,
            m.VoteAverage,
            m.ReleaseDate
        )).ToList();

        return Ok(new
        {
            page = response.Page,
            results = movies,
            totalPages = response.TotalPages,
            totalResults = response.TotalResults
        });
    }
}
