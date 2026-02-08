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
