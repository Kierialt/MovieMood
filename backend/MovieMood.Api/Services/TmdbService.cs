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

    private const int PageSize = 21; // liczba filmów na naszą stronę (TMDB zwraca max 20, więc łączymy 2 strony)

    public async Task<TmdbMoviesResponse?> GetMoviesByMoodAsync(string mood, int page = 1)
    {
        if (!MoodGenreConfig.TryGetGenreIds(mood, out var genreIds) || genreIds == null || genreIds.Length == 0)
            return null;

        var isAccessToken = !string.IsNullOrEmpty(_options.ApiKey) &&
                           _options.ApiKey.StartsWith("eyJ", StringComparison.OrdinalIgnoreCase);

        var authParam = isAccessToken ? "access_token" : "api_key";
        var withGenres = string.Join(",", genreIds);

        // Dla naszej strony N potrzebujemy TMDB strony od firstTMDB do lastTMDB (TMDB ma 20 na stronę)
        var firstTMDBPage = ((page - 1) * PageSize) / 20 + 1;
        var lastTMDBPage = (page * PageSize - 1) / 20 + 1;

        var allResults = new List<TmdbMovie>();
        int totalResults = 0;

        try
        {
            for (var tmdbPage = firstTMDBPage; tmdbPage <= lastTMDBPage; tmdbPage++)
            {
                var url = $"{_options.BaseUrl}/discover/movie" +
                          $"?{authParam}={_options.ApiKey}" +
                          $"&with_genres={withGenres}" +
                          $"&page={tmdbPage}" +
                          $"&sort_by=popularity.desc";

                var request = new HttpRequestMessage(HttpMethod.Get, url);

                if (isAccessToken)
                {
                    request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.ApiKey);
                }

                var response = await _httpClient.SendAsync(request);
                response.EnsureSuccessStatusCode();

                var json = await response.Content.ReadAsStringAsync();
                var tmdbResponse = JsonSerializer.Deserialize<TmdbMoviesResponse>(json, _jsonOptions);

                if (tmdbResponse == null)
                    return null;

                if (tmdbPage == firstTMDBPage)
                    totalResults = tmdbResponse.TotalResults;

                allResults.AddRange(tmdbResponse.Results);
            }

            var skip = (page - 1) * PageSize - (firstTMDBPage - 1) * 20;
            var pageResults = allResults.Skip(skip).Take(PageSize).ToList();

            var totalPages = totalResults > 0 ? (int)Math.Ceiling(totalResults / (double)PageSize) : 0;

            return new TmdbMoviesResponse(page, pageResults, totalPages, totalResults);
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
