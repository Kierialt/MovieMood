using MovieMood.Api.Dtos;

namespace MovieMood.Api.Services;

public interface ITmdbService
{
    Task<TmdbMoviesResponse?> GetMoviesByMoodAsync(string mood, int page = 1);
}
