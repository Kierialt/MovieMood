using MovieMood.Api.Dtos;

namespace MovieMood.Api.Services;

public interface ITmdbService
{
    /// <summary>
    /// Pobiera listę z TMDB discover: type = "movie" lub "tv", genreId = ID gatunku TMDB.
    /// </summary>
    Task<TmdbDiscoverResponse?> GetDiscoverAsync(string type, int genreId, int page = 1);

    /// <summary>
    /// Pobiera szczegóły filmu lub serialu (dla modala "Więcej szczegółów").
    /// type = "movie" | "tv"; dla "animation" używamy type = "movie".
    /// </summary>
    Task<MovieDetailResponse?> GetDetailsAsync(string type, string movieId);
}
