namespace MovieMood.Api.Config;

/// <summary>
/// Mapowanie nastrojów na ID gatunków TMDB.
/// Łatwe rozszerzanie: dodaj nowy wpis do MoodToGenreIds.
/// </summary>
public static class MoodGenreConfig
{
    // ID gatunków TMDB (https://developer.themoviedb.org/reference/genre-movie-list)
    public const int Action = 28;
    public const int Adventure = 12;
    public const int Animation = 16;
    public const int Comedy = 35;
    public const int Documentary = 99;
    public const int Drama = 18;
    public const int Family = 10751;
    public const int History = 36;
    public const int Horror = 27;
    public const int Romance = 10749;
    public const int ScienceFiction = 878;
    public const int War = 10752;

    /// <summary>
    /// Nastrój → lista ID gatunków TMDB (filmy mogą pasować do dowolnego z gatunków).
    /// </summary>
    public static readonly IReadOnlyDictionary<string, int[]> MoodToGenreIds = new Dictionary<string, int[]>(StringComparer.OrdinalIgnoreCase)
    {
        { "Happy", new[] { Comedy } },
        { "Romantic", new[] { Romance } },
        { "Scary", new[] { Horror } },
        { "Funny", new[] { Comedy } },
        { "CalmCozy", new[] { Family, Animation, Drama } },
        { "InspiredTravel", new[] { Adventure, Documentary } },
        { "MotivatedSport", new[] { Documentary, History } }, // Sport/Biography → Documentary, History (TMDB nie ma Sport/Biography)
        { "NatureAnimals", new[] { Documentary } },
        { "SadEmotional", new[] { Drama, War } },
        { "ExcitedAction", new[] { Action, Adventure, ScienceFiction } }
    };

    /// <summary>
    /// Lista obsługiwanych nastrojów (klucze do MoodToGenreIds).
    /// </summary>
    public static IReadOnlyList<string> SupportedMoods => MoodToGenreIds.Keys.ToList();

    public static bool IsValidMood(string? mood) =>
        !string.IsNullOrWhiteSpace(mood) && MoodToGenreIds.ContainsKey(mood.Trim());

    public static bool TryGetGenreIds(string mood, out int[]? genreIds)
    {
        genreIds = null;
        if (string.IsNullOrWhiteSpace(mood)) return false;
        return MoodToGenreIds.TryGetValue(mood.Trim(), out genreIds);
    }
}
