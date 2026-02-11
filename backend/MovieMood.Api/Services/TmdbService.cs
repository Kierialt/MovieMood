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
        var typeNorm = type.Trim().ToLowerInvariant();
        string resource;
        string withGenres;
        string? withoutGenres = null;

        if (typeNorm == "tv")
        {
            resource = "tv";
            withGenres = genreId.ToString();
        }
        else if (typeNorm == "animation")
        {
            resource = "movie";
            withGenres = genreId == GenreConfig.AnimationGenreId
                ? GenreConfig.AnimationGenreId.ToString()
                : $"{GenreConfig.AnimationGenreId},{genreId}";
        }
        else
        {
            resource = "movie";
            withGenres = genreId.ToString();
            withoutGenres = GenreConfig.AnimationGenreId.ToString();
        }

        try
        {
            var url = $"{_options.BaseUrl}/discover/{resource}" +
                      $"?{authParam}={_options.ApiKey}" +
                      $"&with_genres={withGenres}" +
                      $"&page={page}" +
                      "&sort_by=popularity.desc";
            if (!string.IsNullOrEmpty(withoutGenres))
                url += $"&without_genres={withoutGenres}";

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

    public async Task<MovieDetailResponse?> GetDetailsAsync(string type, string movieId)
    {
        if (string.IsNullOrWhiteSpace(movieId) || !int.TryParse(movieId, out var id))
            return null;

        var typeNorm = type?.Trim().ToLowerInvariant();
        if (typeNorm != "movie" && typeNorm != "tv")
            typeNorm = "movie";

        var isAccessToken = !string.IsNullOrEmpty(_options.ApiKey) &&
                           _options.ApiKey.StartsWith("eyJ", StringComparison.OrdinalIgnoreCase);
        var authParam = isAccessToken ? "access_token" : "api_key";
        var authSegment = $"?{authParam}={_options.ApiKey}";

        try
        {
            if (typeNorm == "tv")
                return await GetTvDetailsInternalAsync(id, authSegment, isAccessToken);

            var url = $"{_options.BaseUrl}/movie/{id}{authSegment}";
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            if (isAccessToken)
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.ApiKey);

            var response = await _httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            var movie = JsonSerializer.Deserialize<TmdbMovieDetails>(json, _jsonOptions);
            if (movie == null) return null;

            string? certification = null;
            try
            {
                var rdUrl = $"{_options.BaseUrl}/movie/{id}/release_dates{authSegment}";
                var rdReq = new HttpRequestMessage(HttpMethod.Get, rdUrl);
                if (isAccessToken)
                    rdReq.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.ApiKey);
                var rdRes = await _httpClient.SendAsync(rdReq);
                if (rdRes.IsSuccessStatusCode)
                {
                    var rdJson = await rdRes.Content.ReadAsStringAsync();
                    var rd = JsonSerializer.Deserialize<TmdbReleaseDatesResponse>(rdJson, _jsonOptions);
                    certification = GetMovieCertification(rd);
                }
            }
            catch { /* optional */ }

            var genres = movie.Genres?.Select(g => g.Name ?? "").Where(x => !string.IsNullOrEmpty(x)).ToList() ?? new List<string>();
            var languages = movie.SpokenLanguages?.Select(l => l.Name ?? l.Iso6391 ?? "").Where(x => !string.IsNullOrEmpty(x)).ToList() ?? new List<string>();
            var year = !string.IsNullOrEmpty(movie.ReleaseDate) && movie.ReleaseDate.Length >= 4
                ? movie.ReleaseDate[..4] : null;

            return new MovieDetailResponse(
                MovieId: movieId,
                Title: movie.Title ?? "Bez tytułu",
                Overview: movie.Overview,
                PosterPath: movie.PosterPath,
                VoteAverage: movie.VoteAverage,
                ReleaseYear: year,
                RuntimeMinutes: movie.Runtime > 0 ? movie.Runtime : null,
                Certification: certification,
                Genres: genres,
                Homepage: string.IsNullOrWhiteSpace(movie.Homepage) ? null : movie.Homepage,
                SpokenLanguages: languages
            );
        }
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"TMDB API Error: {ex.Message}");
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"TMDB Service Error: {ex.Message}");
            return null;
        }
    }

    private static string? GetMovieCertification(TmdbReleaseDatesResponse? rd)
    {
        if (rd?.Results == null) return null;
        var us = rd.Results.FirstOrDefault(r => r.Iso31661 == "US");
        var list = (us ?? rd.Results.FirstOrDefault())?.ReleaseDates;
        if (list == null) return null;
        var theatrical = list.FirstOrDefault(r => r.Type == 3);
        var entry = theatrical ?? list.FirstOrDefault(r => !string.IsNullOrEmpty(r.Certification));
        return entry?.Certification;
    }

    private async Task<MovieDetailResponse?> GetTvDetailsInternalAsync(int id, string authSegment, bool isAccessToken)
    {
        var url = $"{_options.BaseUrl}/tv/{id}{authSegment}";
        var request = new HttpRequestMessage(HttpMethod.Get, url);
        if (isAccessToken)
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.ApiKey);

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var tv = JsonSerializer.Deserialize<TmdbTvDetails>(json, _jsonOptions);
        if (tv == null) return null;

        string? rating = null;
        try
        {
            var crUrl = $"{_options.BaseUrl}/tv/{id}/content_ratings{authSegment}";
            var crReq = new HttpRequestMessage(HttpMethod.Get, crUrl);
            if (isAccessToken)
                crReq.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.ApiKey);
            var crRes = await _httpClient.SendAsync(crReq);
            if (crRes.IsSuccessStatusCode)
            {
                var crJson = await crRes.Content.ReadAsStringAsync();
                var cr = JsonSerializer.Deserialize<TmdbTvContentRatingsResponse>(crJson, _jsonOptions);
                var us = cr?.Results?.FirstOrDefault(r => r.Iso31661 == "US");
                rating = us?.Rating ?? cr?.Results?.FirstOrDefault()?.Rating;
            }
        }
        catch { /* optional */ }

        var genres = tv.Genres?.Select(g => g.Name ?? "").Where(x => !string.IsNullOrEmpty(x)).ToList() ?? new List<string>();
        var languages = tv.SpokenLanguages?.Select(l => l.Name ?? l.Iso6391 ?? "").Where(x => !string.IsNullOrEmpty(x)).ToList() ?? new List<string>();
        var year = !string.IsNullOrEmpty(tv.FirstAirDate) && tv.FirstAirDate.Length >= 4
            ? tv.FirstAirDate[..4] : null;
        var runtime = tv.EpisodeRunTime?.FirstOrDefault(); // typowo długość odcinka w min

        return new MovieDetailResponse(
            MovieId: id.ToString(),
            Title: tv.Name ?? "Bez tytułu",
            Overview: tv.Overview,
            PosterPath: tv.PosterPath,
            VoteAverage: tv.VoteAverage,
            ReleaseYear: year,
            RuntimeMinutes: runtime > 0 ? runtime : null,
            Certification: rating,
            Genres: genres,
            Homepage: string.IsNullOrWhiteSpace(tv.Homepage) ? null : tv.Homepage,
            SpokenLanguages: languages
        );
    }
}
