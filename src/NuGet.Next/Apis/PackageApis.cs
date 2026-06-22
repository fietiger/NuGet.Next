using Gnarly.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Dm.Extensions;
using NuGet.Next.Core;
using NuGet.Next.Core.Exceptions;
using NuGet.Next.Core.Infrastructure;
using NuGet.Next.Extensions;
using NuGet.Next.Protocol.Models;
using NuGet.Versioning;

namespace NuGet.Next.Service;

public class PackageApis(
    IAuthenticationService authentication,
    IPackageContentService packageContent,
    IContext dbContext,
    IUserContext userContext,
    IPackageDatabase
        packageDatabase)
    : IScopeDependency
{
    public async Task<PackageVersionsResponse> GetPackageVersionsAsync(HttpContext context, string id)
    {
        var versions = await packageContent.GetPackageVersionsOrNullAsync(id, context.RequestAborted);
        if (versions == null)
        {
            context.Response.StatusCode = 404;

            return null;
        }

        return versions;
    }

    public async Task DownloadPackageAsync(HttpContext context, string id, string version)
    {
        if (!await authentication.AuthenticateAsync(context))
        {
            throw new UnauthorizedAccessException();
        }

        if (!NuGetVersion.TryParse(version, out var nugetVersion))
        {
            throw new NotFoundException("包不存在");
        }

        var packageStream =
            await packageContent.GetPackageContentStreamOrNullAsync(id, nugetVersion, context.RequestAborted);
        if (packageStream == null)
        {
            throw new NotFoundException("包不存在");
        }

        await AddDownloadRecordAsync(context, id, nugetVersion);

        context.Response.ContentType = "application/octet-stream";

        await packageStream.CopyToAsync(context.Response.Body, context.RequestAborted);
    }

    public async Task DownloadNuspecAsync(HttpContext context, string id, string version)
    {
        if (!NuGetVersion.TryParse(version, out var nugetVersion))
        {
            throw new NotFoundException("包不存在");
        }

        var nuspecStream =
            await packageContent.GetPackageManifestStreamOrNullAsync(id, nugetVersion, context.RequestAborted);
        if (nuspecStream == null)
        {
            throw new NotFoundException("包不存在");
        }

        context.Response.ContentType = "text/xml";

        await nuspecStream.CopyToAsync(context.Response.Body, context.RequestAborted);
    }

    public async Task DownloadReadmeAsync(HttpContext context, string id, string version)
    {
        if (!NuGetVersion.TryParse(version, out var nugetVersion))
        {
            throw new NotFoundException("包不存在");
        }

        var readmeStream =
            await packageContent.GetPackageReadmeStreamOrNullAsync(id, nugetVersion, context.RequestAborted);
        if (readmeStream == null)
        {
            throw new NotFoundException("包不存在");
        }

        context.Response.ContentType = "text/markdown";
        await readmeStream.CopyToAsync(context.Response.Body, context.RequestAborted);
    }

    public async Task DownloadIconAsync(HttpContext context, string id, string version)
    {
        if (!NuGetVersion.TryParse(version, out var nugetVersion))
        {
            throw new NotFoundException("包不存在");
        }

        var iconStream = await packageContent.GetPackageIconStreamOrNullAsync(id, nugetVersion, context.RequestAborted);
        if (iconStream == null)
        {
            throw new NotFoundException("包不存在");
        }

        context.Response.ContentType = "image/xyz";
        await iconStream.CopyToAsync(context.Response.Body, context.RequestAborted);
    }

    public async Task<PageResponse<Package>> GetListAsync(int page, int pageSize,
        string? keyword, string[] userIds)
    {
        if (userContext.Role != RoleConstant.Admin)
        {
            // 只有管理员才能查看所有包，其他用户只能查看自己的包
            userIds = [userContext.UserId];
        }

        page = Math.Max(page, 1);
        pageSize = Math.Min(pageSize, 1000);

        var query = dbContext.Packages.Where(x =>
            string.IsNullOrEmpty(keyword) || x.Id.Contains(keyword) ||
            (!string.IsNullOrEmpty(x.Title) && x.Title.Contains(keyword)));

        if (userIds.Length > 0)
        {
            query = query.Where(x => userIds.Contains(x.Creator));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PageResponse<Package>(total, items);
    }

    /// <summary>
    /// 删除指定包
    /// </summary>
    /// <returns></returns>
    public async Task<OkResponse> DeleteAsync(string id, string version)
    {
        // 只有管理员才能删除包
        if (userContext.Role != RoleConstant.Admin)
        {
            throw new ForbiddenException("无权删除");
        }

        await packageDatabase.HardDeletePackageAsync(id, NuGetVersion.Parse(version), false, new CancellationToken());

        return OkResponse.Ok("删除成功");
    }

    private async Task AddDownloadRecordAsync(HttpContext context, string id, NuGetVersion version)
    {
        await dbContext.PackageUpdateRecords.AddAsync(new PackageUpdateRecord
        {
            PackageId = id,
            Version = version.ToNormalizedString(),
            OperationTime = DateTime.Now,
            UserId = userContext.UserId,
            OperationType = "下载包",
            OperationIP = userContext.IpAddress,
            OperationDescription = await GetDownloadTokenDescriptionAsync(context)
        }, context.RequestAborted);

        await dbContext.SaveChangesAsync(context.RequestAborted);
    }

    private async Task<string> GetDownloadTokenDescriptionAsync(HttpContext context)
    {
        var apiKey = context.GetApiKey();
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return string.Empty;
        }

        if (!apiKey.StartsWith("key-"))
        {
            return "Token类型：登录Token";
        }

        var keyId = await dbContext.UserKeys
            .Where(x => x.Key == apiKey)
            .Select(x => x.Id)
            .FirstOrDefaultAsync(context.RequestAborted);

        return string.IsNullOrWhiteSpace(keyId)
            ? "Token类型：UserKey"
            : $"Token类型：UserKey，KeyId：{keyId}";
    }
}
