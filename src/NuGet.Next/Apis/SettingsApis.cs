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
