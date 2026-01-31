using System.Text.Json.Serialization;

namespace MovieMood.Api.Dtos;

public record TmdbMovie(
    int Id,
    string Title,
    string? Overview,
    [property: JsonPropertyName("poster_path")] string? PosterPath,
    [property: JsonPropertyName("vote_average")] double VoteAverage,
    [property: JsonPropertyName("release_date")] string? ReleaseDate
);

public record TmdbMoviesResponse(
    int Page,
    List<TmdbMovie> Results,
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
