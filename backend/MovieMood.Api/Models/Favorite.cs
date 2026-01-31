namespace MovieMood.Api.Models;

public class Favorite
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string MovieId { get; set; } = string.Empty; // TMDB ID

    public string Title { get; set; } = string.Empty;

    public string PosterPath { get; set; } = string.Empty;

    public string Overview { get; set; } = string.Empty;

    public double Rating { get; set; }

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
