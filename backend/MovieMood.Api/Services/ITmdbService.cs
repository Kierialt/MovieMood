using MovieMood.Api.Dtos;

namespace MovieMood.Api.Services;

public interface ITmdbService
{
    /// <summary>
    /// Pobiera listę z TMDB discover: type = "movie" lub "tv", genreId = ID gatunku TMDB.
    /// </summary>
    Task<TmdbDiscoverResponse?> GetDiscoverAsync(string type, int genreId, int page = 1);
}
