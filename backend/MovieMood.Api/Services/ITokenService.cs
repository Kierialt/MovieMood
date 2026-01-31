using MovieMood.Api.Models;

namespace MovieMood.Api.Services;

public interface ITokenService
{
    string CreateToken(User user);
}


