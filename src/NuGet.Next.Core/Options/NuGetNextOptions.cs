using NuGet.Next.Core.Options;

namespace NuGet.Next.Options;

public class NuGetNextOptions
{
    public string PathBase { get; set; }

    /// <summary>
    ///     启动时运行迁移
    /// </summary>
    public bool RunMigrationsAtStartup { get; set; }

    /// <summary>
    ///     如果启用，将替换现有包
    /// </summary>
    public bool AllowPackageOverwrites { get; set; } = false;

    /// <summary>
    ///     如果启用，则允许匿名访问 NuGet 包下载服务。
    /// </summary>
    public bool PublicAccess { get; set; } = false;

    /// <summary>
    ///     如果为true，则禁用包推送、删除和重新列出。
    /// </summary>
    public bool IsReadOnlyMode { get; set; } = false;

    /// <summary>
    ///    包删除行为 
    /// </summary>
    public PackageDeletionBehavior PackageDeletionBehavior { get; set; }

    /// <summary>
    ///     BaGet 服务器将使用的 URL。
    ///     根据文档
    ///     <a href="https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/web-host?view=aspnetcore-8.0#server-urls">
    ///         在这里（服务器
    ///         URL）
    ///     </a>
    ///     。
    /// </summary>
    public string Urls { get; set; }

    public DatabaseOptions Database { get; set; }

    public StorageOptions Storage { get; set; }

    public MirrorOptions Mirror { get; set; }

    public SearchOptions Search { get; set; }

    public void Validate()
    {
        
    }
}
