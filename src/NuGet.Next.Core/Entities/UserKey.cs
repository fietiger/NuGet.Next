namespace NuGet.Next.Core;

public class UserKey
{
    public string Id { get; set; }

    public string Key { get; set; }

    /// <summary>
    /// 创建时间
    /// </summary>
    public DateTimeOffset CreatedTime { get; set; }

    /// <summary>
    /// 用户id
    /// </summary>
    public string UserId { get; set; }

    /// <summary>
    /// 是否可用
    /// </summary>
    public bool Enabled { get; set; }

    /// <summary>
    /// 创建人
    /// </summary>
    public User User { get; set; }

    protected UserKey()
    {
    }

    public UserKey(string userId)
    {
        Id = Guid.NewGuid().ToString("N");
        UserId = userId;
        CreatedTime = DateTimeOffset.Now;
        Enabled = false;
        SetKey();
    }

    public void SetKey()
    {
        Key = "key-" + Guid.NewGuid().ToString("N");
    }
}
