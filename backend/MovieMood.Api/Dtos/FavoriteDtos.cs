namespace MovieMood.Api.Dtos;

public record FavoriteCreateRequest(
    string MovieId,
    string Title,
    string PosterPath,
    string Overview,
    double Rating
);

public record FavoriteResponse(
    int Id,
    string MovieId,
    string Title,
    string PosterPath,
    string Overview,
    double Rating,
    DateTime AddedAt
);


