using System.Net.Http.Headers;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace NuGet.Next.Extensions;

public static class HttpContextExtensions
{
    public const string ApiKeyHeader = "X-NuGet-ApiKey";

    public static async Task<Stream> GetUploadStreamOrNullAsync(this HttpContext request,
        CancellationToken cancellationToken)
    {
        // Try to get the nupkg from the multipart/form-data. If that's empty,
        // fallback to the request's body.
        Stream rawUploadStream = null;
        try
        {
            if (request.Request.HasFormContentType && request.Request.Form.Files.Count > 0)
            {
                rawUploadStream = request.Request.Form.Files[0].OpenReadStream();
            }
            else
            {
                rawUploadStream = request.Request.Body;
            }

            // Convert the upload stream into a temporary file stream to
            // minimize memory usage.
            return await rawUploadStream?.AsTemporaryFileStreamAsync(cancellationToken);
        }
        finally
        {
            rawUploadStream?.Dispose();
        }
    }

    public static string GetApiKey(this HttpContext request)
    {
        var headerValue = request.Request.Headers[ApiKeyHeader].ToString();
        if (!string.IsNullOrWhiteSpace(headerValue))
        {
            return headerValue.Trim();
        }

        var authorizationValue = GetAuthorizationTokenOrNull(request);
        if (!string.IsNullOrWhiteSpace(authorizationValue))
        {
            return authorizationValue;
        }

        foreach (var queryKey in new[] { "token", "apiKey", "api_key", "access_token" })
        {
            var queryValue = request.Request.Query[queryKey].ToString();
            if (!string.IsNullOrWhiteSpace(queryValue))
            {
                return queryValue.Trim();
            }
        }

        return string.Empty;
    }

    private static string GetAuthorizationTokenOrNull(HttpContext context)
    {
        var authorization = context.Request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(authorization))
        {
            return null;
        }

        if (!AuthenticationHeaderValue.TryParse(authorization, out var header))
        {
            return null;
        }

        if (header.Scheme.Equals("Bearer", StringComparison.OrdinalIgnoreCase))
        {
            return header.Parameter;
        }

        if (!header.Scheme.Equals("Basic", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        return GetBasicTokenOrNull(header.Parameter);
    }

    private static string GetBasicTokenOrNull(string parameter)
    {
        if (string.IsNullOrWhiteSpace(parameter))
        {
            return null;
        }

        try
        {
            var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(parameter));
            var separatorIndex = decoded.IndexOf(':');
            if (separatorIndex < 0)
            {
                return decoded;
            }

            var username = decoded[..separatorIndex];
            var password = decoded[(separatorIndex + 1)..];

            return !string.IsNullOrWhiteSpace(password) ? password : username;
        }
        catch (FormatException)
        {
            return null;
        }
    }
}
