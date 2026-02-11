using System.Text.Json.Serialization;

namespace MovieMood.Api.Dtos;

/// <summary>
/// Element z TMDB discover (film: title, release_date; serial: name, first_air_date).
/// </summary>
public record TmdbDiscoverItem(
    int Id,
    [property: JsonPropertyName("title")] string? Title,
    [property: JsonPropertyName("name")] string? Name,
    string? Overview,
    [property: JsonPropertyName("poster_path")] string? PosterPath,
    [property: JsonPropertyName("vote_average")] double VoteAverage,
    [property: JsonPropertyName("release_date")] string? ReleaseDate,
    [property: JsonPropertyName("first_air_date")] string? FirstAirDate
);

public record TmdbDiscoverResponse(
    int Page,
    List<TmdbDiscoverItem> Results,
    [property: JsonPropertyName("total_pages")] int TotalPages,
    [property: JsonPropertyName("total_results")] int TotalResults
);

public record MovieResponse(
    string MovieId,
    string Title,
    string? Overview,
    string? PosterPath,
    double Rating,
    string? ReleaseDate
);

// --- Details (movie/TV) for modal ---

/// <summary>
/// Unified response for movie or TV details (modal / "Więcej szczegółów").
/// </summary>
public record MovieDetailResponse(
    string MovieId,
    string Title,
    string? Overview,
    string? PosterPath,
    double VoteAverage,
    string? ReleaseYear,
    int? RuntimeMinutes,
    string? Certification,
    List<string> Genres,
    string? Homepage,
    List<string> SpokenLanguages
);

// TMDB raw response shapes (snake_case) for deserialization
public class TmdbMovieDetails
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Overview { get; set; }
    [JsonPropertyName("poster_path")] public string? PosterPath { get; set; }
    [JsonPropertyName("vote_average")] public double VoteAverage { get; set; }
    [JsonPropertyName("release_date")] public string? ReleaseDate { get; set; }
    public int Runtime { get; set; }
    public string? Homepage { get; set; }
    public List<TmdbGenre>? Genres { get; set; }
    [JsonPropertyName("spoken_languages")] public List<TmdbSpokenLanguage>? SpokenLanguages { get; set; }
}

public class TmdbTvDetails
{
    public string? Name { get; set; }
    public string? Overview { get; set; }
    [JsonPropertyName("poster_path")] public string? PosterPath { get; set; }
    [JsonPropertyName("vote_average")] public double VoteAverage { get; set; }
    [JsonPropertyName("first_air_date")] public string? FirstAirDate { get; set; }
    [JsonPropertyName("episode_run_time")] public List<int>? EpisodeRunTime { get; set; }
    public string? Homepage { get; set; }
    public List<TmdbGenre>? Genres { get; set; }
    [JsonPropertyName("spoken_languages")] public List<TmdbSpokenLanguage>? SpokenLanguages { get; set; }
}

public class TmdbGenre
{
    public int Id { get; set; }
    public string? Name { get; set; }
}

public class TmdbSpokenLanguage
{
    [JsonPropertyName("iso_639_1")] public string? Iso6391 { get; set; }
    public string? Name { get; set; }
}

public class TmdbReleaseDatesResponse
{
    public List<TmdbReleaseDatesResult>? Results { get; set; }
}

public class TmdbReleaseDatesResult
{
    [JsonPropertyName("iso_3166_1")] public string? Iso31661 { get; set; }
    [JsonPropertyName("release_dates")] public List<TmdbReleaseDateEntry>? ReleaseDates { get; set; }
}

public class TmdbReleaseDateEntry
{
    public string? Certification { get; set; }
    public int Type { get; set; }
}

public class TmdbTvContentRatingsResponse
{
    public List<TmdbTvContentRatingResult>? Results { get; set; }
}

public class TmdbTvContentRatingResult
{
    [JsonPropertyName("iso_3166_1")] public string? Iso31661 { get; set; }
    public string? Rating { get; set; }
}
