using System.Text.Json;
using Microsoft.Extensions.Options;
using MovieMood.Api.Config;
using MovieMood.Api.Dtos;
using MovieMood.Api.Options;

namespace MovieMood.Api.Services;

public class TmdbService : ITmdbService
{
    private readonly HttpClient _httpClient;
    private readonly TmdbOptions _options;
    private readonly JsonSerializerOptions _jsonOptions;

    public TmdbService(HttpClient httpClient, IOptions<TmdbOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    private const int PageSize = 20;

    public async Task<TmdbDiscoverResponse?> GetDiscoverAsync(string type, int genreId, int page = 1)
    {
        if (!GenreConfig.IsValidContentType(type) || !GenreConfig.IsValidGenre(type, genreId))
            return null;

        var isAccessToken = !string.IsNullOrEmpty(_options.ApiKey) &&
                           _options.ApiKey.StartsWith("eyJ", StringComparison.OrdinalIgnoreCase);

        var authParam = isAccessToken ? "access_token" : "api_key";
        var resource = type.Trim().ToLowerInvariant() == "movie" ? "movie" : "tv";

        try
        {
            var url = $"{_options.BaseUrl}/discover/{resource}" +
                      $"?{authParam}={_options.ApiKey}" +
                      $"&with_genres={genreId}" +
                      $"&page={page}" +
                      "&sort_by=popularity.desc";

            var request = new HttpRequestMessage(HttpMethod.Get, url);

            if (isAccessToken)
            {
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.ApiKey);
            }

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var tmdbResponse = JsonSerializer.Deserialize<TmdbDiscoverResponse>(json, _jsonOptions);

            return tmdbResponse;
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"TMDB API Error: {ex.Message}");
            if (ex.Data.Contains("StatusCode"))
                Console.WriteLine($"Status Code: {ex.Data["StatusCode"]}");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"TMDB Service Error: {ex.Message}");
            return null;
        }
    }
}
