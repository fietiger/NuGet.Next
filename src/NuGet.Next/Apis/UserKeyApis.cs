using Gnarly.Data;
using Microsoft.EntityFrameworkCore;
using NuGet.Next.Core;
using NuGet.Next.Core.Exceptions;
using NuGet.Next.Core.Infrastructure;
using NuGet.Next.Protocol.Models;

namespace NuGet.Next.Service;

public class UserKeyApis(IContext context, IUserContext userContext) : IScopeDependency
{
    /// <summary>
    /// 创建密钥
    /// </summary>
    /// <returns></returns>
    public async Task<OkResponse> CreateAsync()
    {
        if (!userContext.IsAuthenticated)
        {
            throw new UnauthorizedAccessException();
        }

        if (await context.UserKeys.CountAsync(x => x.UserId == userContext.UserId) >= 10)
        {
            return new OkResponse(false, "最多只能创建10个Key");
        }

        var key = new UserKey(userContext.UserId);

        await context.UserKeys.AddAsync(key);

        await context.SaveChangesAsync(new CancellationToken());

        return OkResponse.Ok("创建成功，等待管理员启用");
    }

    /// <summary>
    /// 获取Key列表
    /// </summary>
    /// <returns></returns>
    public async Task<List<UserKey>> GetListAsync()
    {
        if (!userContext.IsAuthenticated)
        {
            throw new UnauthorizedAccessException();
        }

        return await context.UserKeys
            .Where(x => x.UserId == userContext.UserId)
            .ToListAsync();
    }

    /// <summary>
    /// 删除Key
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    public async Task<OkResponse> DeleteAsync(string id)
    {
        if (!userContext.IsAuthenticated)
        {
            throw new UnauthorizedAccessException();
        }

        var key = await context.UserKeys.FirstOrDefaultAsync(x => x.Id == id);
        if (key == null)
        {
            return new OkResponse(false, "Key不存在");
        }

        if (key.UserId != userContext.UserId)
        {
            return new OkResponse(false, "无权删除");
        }

        context.UserKeys.Remove(key);

        await context.SaveChangesAsync(new CancellationToken());

        return OkResponse.Ok("删除成功");
    }

    /// <summary>
    /// 获取后台Key列表
    /// </summary>
    public async Task<PageResponse<UserKeyResponse>> GetAdminListAsync(string? keyword, int page, int pageSize)
    {
        if (userContext.Role != RoleConstant.Admin)
        {
            throw new ForbiddenException("无权限");
        }

        page = Math.Max(page, 1);
        pageSize = Math.Min(pageSize, 1000);

        var query = from key in context.UserKeys
            join user in context.Users
                on key.UserId equals user.Id into userGroup
            from user in userGroup.DefaultIfEmpty()
            where string.IsNullOrEmpty(keyword)
                  || key.Key.Contains(keyword)
                  || (user != null && (user.Username.Contains(keyword) || user.FullName.Contains(keyword)))
            select new UserKeyResponse
            {
                Id = key.Id,
                Key = key.Key,
                CreatedTime = key.CreatedTime,
                UserId = key.UserId,
                Username = user == null ? string.Empty : user.Username,
                FullName = user == null ? string.Empty : user.FullName,
                Enabled = key.Enabled,
            };

        var total = await query.CountAsync();

        var items = await query
            .ToListAsync();

        items = items
            .OrderByDescending(x => x.CreatedTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new PageResponse<UserKeyResponse>(total, items);
    }

    /// <summary>
    /// 管理员启用/禁用Key
    /// </summary>
    /// <returns></returns>
    public async Task<OkResponse> EnableAsync(string id)
    {
        if (userContext.Role != RoleConstant.Admin)
        {
            throw new ForbiddenException("无权限");
        }

        var key = await context.UserKeys.FirstOrDefaultAsync(x => x.Id == id);
        if (key == null)
        {
            return new OkResponse(false, "Key不存在");
        }

        await context.UserKeys.Where(x => x.Id == id)
            .ExecuteUpdateAsync(x => x.SetProperty(i => i.Enabled, a => !a.Enabled));

        return OkResponse.Ok("操作成功");
    }
}
