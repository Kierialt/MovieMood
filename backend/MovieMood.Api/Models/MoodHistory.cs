namespace MovieMood.Api.Models;

public class MoodHistory
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Mood { get; set; } = string.Empty; // Happy, Sad, Romantic, Scary

    public DateTime ChosenAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}
