using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using NuGet.Next.Extensions;
using Thor.Service.Infrastructure.Helper;

namespace NuGet.Next.Core;

public class ApiKeyAuthenticationService(IContext context, JwtHelper jwtHelper)
    : IAuthenticationService
{
    public async Task<bool> AuthenticateAsync(HttpContext httpContext)
    {
        var apiKey = httpContext.GetApiKey();

        if (string.IsNullOrWhiteSpace(apiKey))
            return false;

        try
        {
            if (apiKey.StartsWith("key-"))
            {
                var result = await (from key in context.UserKeys
                    join user in context.Users
                        on key.UserId equals user.Id into userGroup
                    from user in userGroup.DefaultIfEmpty()
                    where key.Key == apiKey && key.Enabled
                    select user).FirstOrDefaultAsync();

                if (result == null)
                    return false;

                SetUser(httpContext, result);

                return true;
            }

            var (id, _, _) = jwtHelper.GetUserFromToken(apiKey);

            if (id == null)
                return false;

            // 判断用户是否存在
            var query = await context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (query == null)
            {
                return false;
            }

            SetUser(httpContext, query);

            return true;
        }
        catch
        {
            return false;
        }
    }

    private void SetUser(HttpContext httpContext, User user)
    {
        // 将用户信息设置到上下文中
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(jwtHelper.GetClaimsFromToken(user)));
    }

    public async Task<AuthenticationResponse> AuthenticateAsync(AuthenticateInput input)
    {
        var query = await context.Users.Where(u => u.Username == input.Username)
            .FirstOrDefaultAsync();

        if (query == null)
        {
            return new AuthenticationResponse
            {
                Success = false,
                Message = "用户不存在"
            };
        }

        if (!query.VerifyPassword(input.Password))
            return new AuthenticationResponse
            {
                Success = false,
                Message = "密码错误"
            };

        var token = jwtHelper.CreateToken(query);

        return new AuthenticationResponse
        {
            Success = true,
            Token = token
        };
    }
}
