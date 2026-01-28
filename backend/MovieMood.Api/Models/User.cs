namespace MovieMood.Api.Models;

public class User
{
    public int Id { get; set; }

    public string UserName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    // Хранится только хеш пароля
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    public ICollection<MoodHistory> MoodHistory { get; set; } = new List<MoodHistory>();
}
