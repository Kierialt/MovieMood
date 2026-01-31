using System.Text.Json;
using Microsoft.Extensions.Options;
using MovieMood.Api.Dtos;
using MovieMood.Api.Options;

namespace MovieMood.Api.Services;

public class TmdbService : ITmdbService
{
    private readonly HttpClient _httpClient;
    private readonly TmdbOptions _options;
    private readonly JsonSerializerOptions _jsonOptions;

    // Mapowanie nastrojów na genre IDs TMDB
    private static readonly Dictionary<string, int> MoodToGenreMap = new()
    {
        { "Happy", 35 },      // Comedy
        { "Sad", 18 },        // Drama
        { "Romantic", 10749 }, // Romance
        { "Scary", 27 }       // Horror
    };

    public TmdbService(HttpClient httpClient, IOptions<TmdbOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    public async Task<TmdbMoviesResponse?> GetMoviesByMoodAsync(string mood, int page = 1)
    {
        if (!MoodToGenreMap.TryGetValue(mood, out var genreId))
        {
            return null;
        }

        var url = $"{_options.BaseUrl}/discover/movie" +
                  $"?api_key={_options.ApiKey}" +
                  $"&with_genres={genreId}" +
                  $"&page={page}" +
                  $"&sort_by=popularity.desc";

        try
        {
            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var tmdbResponse = JsonSerializer.Deserialize<TmdbMoviesResponse>(json, _jsonOptions);

            return tmdbResponse;
        }
        catch
        {
            return null;
        }
    }
}
