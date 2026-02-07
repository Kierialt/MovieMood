namespace MovieMood.Api.Models;

/// <summary>
/// Stałe ról użytkowników w systemie.
/// </summary>
public static class UserRole
{
    public const string User = "User";
    public const string Admin = "Admin";

    /// <summary>
    /// Domyślna rola przypisywana przy rejestracji.
    /// </summary>
    public const string Default = User;
}
