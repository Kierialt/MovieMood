namespace MovieMood.Api.Config;

/// <summary>
/// Gatunki TMDB dla filmów i seriali. Używane w discover z with_genres.
/// </summary>
public static class GenreConfig
{
    /// <summary>
    /// Gatunki filmów: ID → nazwa (TMDB).
    /// </summary>
    public static readonly IReadOnlyDictionary<int, string> MovieGenres = new Dictionary<int, string>
    {
        { 28, "Action" },
        { 12, "Adventure" },
        { 16, "Animation" },
        { 35, "Comedy" },
        { 80, "Crime" },
        { 99, "Documentary" },
        { 18, "Drama" },
        { 10751, "Family" },
        { 14, "Fantasy" },
        { 36, "History" },
        { 27, "Horror" },
        { 10402, "Music" },
        { 9648, "Mystery" },
        { 10749, "Romance" },
        { 878, "Science Fiction" },
        { 53, "Thriller" },
        { 10770, "TV Movie" },
        { 10752, "War" },
        { 37, "Western" }
    };

    /// <summary>
    /// Gatunki seriali TV: ID → nazwa (TMDB).
    /// </summary>
    public static readonly IReadOnlyDictionary<int, string> TvGenres = new Dictionary<int, string>
    {
        { 10759, "Action & Adventure" },
        { 16, "Animation" },
        { 35, "Comedy" },
        { 80, "Crime" },
        { 99, "Documentary" },
        { 18, "Drama" },
        { 10751, "Family" },
        { 10762, "Kids" },
        { 9648, "Mystery" },
        { 10763, "News" },
        { 10764, "Reality" },
        { 10765, "Sci-Fi & Fantasy" },
        { 10766, "Soap" },
        { 10767, "Talk" },
        { 10768, "War & Politics" },
        { 37, "Western" }
    };

    public static readonly IReadOnlyList<string> ContentTypes = new[] { "movie", "tv" };

    public static bool IsValidContentType(string? type) =>
        !string.IsNullOrWhiteSpace(type) && ContentTypes.Contains(type.Trim(), StringComparer.OrdinalIgnoreCase);

    public static bool IsValidGenre(string type, int genreId)
    {
        if (string.IsNullOrWhiteSpace(type)) return false;
        return type.Trim().ToLowerInvariant() switch
        {
            "movie" => MovieGenres.ContainsKey(genreId),
            "tv" => TvGenres.ContainsKey(genreId),
            _ => false
        };
    }

    public static string? GetGenreName(string type, int genreId)
    {
        if (string.IsNullOrWhiteSpace(type)) return null;
        return type.Trim().ToLowerInvariant() switch
        {
            "movie" => MovieGenres.GetValueOrDefault(genreId),
            "tv" => TvGenres.GetValueOrDefault(genreId),
            _ => null
        };
    }
}
