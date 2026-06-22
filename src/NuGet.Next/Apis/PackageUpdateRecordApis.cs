using Gnarly.Data;
using Microsoft.EntityFrameworkCore;
using NuGet.Next.Core;
using NuGet.Next.Core.Exceptions;
using NuGet.Next.Core.Infrastructure;
using NuGet.Next.Protocol.Models;

namespace NuGet.Next.Service;

public class PackageUpdateRecordApis(IUserContext userContext, IContext context) : IScopeDependency
{
    /// <summary>
    /// 获取指定用户的包更新记录
    /// </summary>
    /// <param name="userId"></param>
    /// <param name="page">页码</param>
    /// <param name="pageSize">分页大小</param>
    /// <returns></returns>
    public async Task<PageResponse<PackageUpdateRecordResponse>> GetByUserIdAsync(string[] userId, int page,
        int pageSize)
    {
        if (userContext.Role != RoleConstant.Admin)
        {
            throw new ForbiddenException("无权限");
        }

        page = Math.Max(page, 1);
        pageSize = Math.Min(pageSize, 100);

        var query = context.PackageUpdateRecords
            .OrderByDescending(x => x.OperationTime)
            .AsQueryable();

        if (userId.Length > 0)
        {
            query = query.Where(x => userId.Contains(x.UserId));
        }

        var total = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new PackageUpdateRecordResponse
            {
                Id = x.Id,
                PackageId = x.PackageId,
                Version = x.Version,
                OperationType = x.OperationType,
                OperationDescription = x.OperationDescription,
                OperationIP = x.OperationIP,
                UserId = x.UserId,
                OperationTime = x.OperationTime
            })
            .ToListAsync();

        var userIds = items.Select(x => x.UserId).Distinct().ToList();

        var users = await context.Users
            .Where(x => userIds.Contains(x.Id))
            .Select(x => new UserResponse
            {
                Id = x.Id,
                Username = x.Username,
                FullName = x.FullName,
                Avatar = x.Avatar,
                Role = x.Role,
                Email = x.Email
            })
            .ToDictionaryAsync(x => x.Id);

        foreach (var item in items)
        {
            if (users.TryGetValue(item.UserId, out var user))
            {
                item.User = user;
            }
        }

        return new PageResponse<PackageUpdateRecordResponse>(total, items);
    }
}
