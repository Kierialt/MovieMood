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

        // Sprawdzamy, czy klucz wygląda jak JWT token (zaczyna się od "eyJ")
        // Jeśli tak, używamy Authorization header, w przeciwnym razie api_key w query string
        var isAccessToken = !string.IsNullOrEmpty(_options.ApiKey) && 
                           _options.ApiKey.StartsWith("eyJ", StringComparison.OrdinalIgnoreCase);

        // Budujemy URL z odpowiednim parametrem autoryzacji
        var authParam = isAccessToken ? "access_token" : "api_key";
        var url = $"{_options.BaseUrl}/discover/movie" +
                  $"?{authParam}={_options.ApiKey}" +
                  $"&with_genres={genreId}" +
                  $"&page={page}" +
                  $"&sort_by=popularity.desc";

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            
            // Jeśli to access token, dodajemy też do nagłówka Authorization
            if (isAccessToken)
            {
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.ApiKey);
            }

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var tmdbResponse = JsonSerializer.Deserialize<TmdbMoviesResponse>(json, _jsonOptions);

            return tmdbResponse;
        }
        catch (HttpRequestException ex)
        {
            // Logowanie błędu dla debugowania
            Console.WriteLine($"TMDB API Error: {ex.Message}");
            if (ex.Data.Contains("StatusCode"))
            {
                Console.WriteLine($"Status Code: {ex.Data["StatusCode"]}");
            }
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"TMDB Service Error: {ex.Message}");
            return null;
        }
    }
}
