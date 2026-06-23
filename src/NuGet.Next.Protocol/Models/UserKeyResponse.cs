namespace NuGet.Next.Protocol.Models;

public class UserKeyResponse
{
    public string Id { get; set; }

    public string Key { get; set; }

    public DateTimeOffset CreatedTime { get; set; }

    public string UserId { get; set; }

    public string Username { get; set; }

    public string FullName { get; set; }

    public bool Enabled { get; set; }
}
