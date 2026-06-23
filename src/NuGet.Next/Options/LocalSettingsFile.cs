using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace NuGet.Next.Options;

public class LocalSettingsFile
{
    public const string FileName = "appsettings.Local.json";

    private readonly SemaphoreSlim _semaphore = new(1, 1);

    public LocalSettingsFile(string filePath)
    {
        FilePath = filePath;
    }

    public string FilePath { get; }

    public static string ResolvePath(IConfiguration configuration)
    {
        var storagePath = configuration.GetValue<string>("Storage:Path");
        if (string.IsNullOrWhiteSpace(storagePath))
        {
            storagePath = "data";
        }

        var absoluteStoragePath = Path.IsPathRooted(storagePath)
            ? storagePath
            : Path.Combine(AppDomain.CurrentDomain.BaseDirectory, storagePath);

        return Path.Combine(Path.GetFullPath(absoluteStoragePath), FileName);
    }

    public async Task SavePublicAccessAsync(bool publicAccess, CancellationToken cancellationToken)
    {
        await _semaphore.WaitAsync(cancellationToken);
        try
        {
            var json = await ReadJsonAsync(cancellationToken);
            json[nameof(NuGetNextOptions.PublicAccess)] = publicAccess;

            var directory = Path.GetDirectoryName(FilePath);
            if (!string.IsNullOrWhiteSpace(directory))
            {
                Directory.CreateDirectory(directory);
            }

            var tempFilePath = $"{FilePath}.{Guid.NewGuid():N}.tmp";
            var content = json.ToJsonString(new JsonSerializerOptions
            {
                WriteIndented = true
            });

            await File.WriteAllTextAsync(tempFilePath, content + Environment.NewLine, Encoding.UTF8, cancellationToken);
            File.Move(tempFilePath, FilePath, true);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private async Task<JsonObject> ReadJsonAsync(CancellationToken cancellationToken)
    {
        if (!File.Exists(FilePath))
        {
            return new JsonObject();
        }

        try
        {
            var content = await File.ReadAllTextAsync(FilePath, cancellationToken);
            return JsonNode.Parse(content)?.AsObject() ?? new JsonObject();
        }
        catch (JsonException)
        {
            return new JsonObject();
        }
    }
}
