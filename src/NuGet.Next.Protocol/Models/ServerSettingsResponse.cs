namespace NuGet.Next.Protocol.Models;

public class ServerSettingsResponse
{
    public bool PublicAccess { get; set; }

    public string SettingsFilePath { get; set; } = string.Empty;
}
