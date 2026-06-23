using Gnarly.Data;
using NuGet.Next.Core;
using NuGet.Next.Core.Exceptions;
using NuGet.Next.Core.Infrastructure;
using NuGet.Next.Options;
using NuGet.Next.Protocol.Models;

namespace NuGet.Next.Service;

public class SettingsApis(
    NuGetNextOptions options,
    LocalSettingsFile localSettingsFile,
    IUserContext userContext) : IScopeDependency
{
    public ServerSettingsResponse GetAsync()
    {
        EnsureAdmin();

        return CreateResponse();
    }

    public object GetPublicAsync()
    {
        return new
        {
            options.PublicAccess
        };
    }

    public async Task DownloadNuGetConfigAsync(HttpContext context)
    {
        if (!options.PublicAccess)
        {
            throw new UnauthorizedAccessException();
        }

        var source = $"{context.Request.Scheme}://{context.Request.Host}{context.Request.PathBase}/v3/index.json";
        var config = $"""
                      <?xml version="1.0" encoding="utf-8"?>
                      <configuration>
                        <packageSources>
                          <add key="NuGetNext" value="{source}" />
                        </packageSources>
                      </configuration>
                      """;

        context.Response.ContentType = "application/xml; charset=utf-8";
        context.Response.Headers.ContentDisposition = "attachment; filename=\"NuGet.config\"";

        await context.Response.WriteAsync(config, context.RequestAborted);
    }

    public async Task<ServerSettingsResponse> UpdateAsync(ServerSettingsInput input, CancellationToken cancellationToken)
    {
        EnsureAdmin();

        await localSettingsFile.SavePublicAccessAsync(input.PublicAccess, cancellationToken);
        options.PublicAccess = input.PublicAccess;

        return CreateResponse();
    }

    private ServerSettingsResponse CreateResponse()
    {
        return new ServerSettingsResponse
        {
            PublicAccess = options.PublicAccess,
            SettingsFilePath = localSettingsFile.FilePath
        };
    }

    private void EnsureAdmin()
    {
        if (userContext.Role != RoleConstant.Admin)
        {
            throw new ForbiddenException("无权限");
        }
    }
}
