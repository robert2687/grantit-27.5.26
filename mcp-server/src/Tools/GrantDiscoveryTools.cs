using ModelContextProtocol.Server;
using System.ComponentModel;

namespace McpServer.Tools;

[McpServerToolType]
public sealed class GrantDiscoveryTools
{
    private static readonly List<GrantItem> Grants =
    [
        new("1", "Horizon Europe: AI Innovation", 2500000, "2026-10-15", "EU"),
        new("2", "Digital Europe: Cloud Infrastructure", 1200000, "2026-11-01", "EU"),
        new("3", "Green Tech SME Boost", 500000, "2026-09-10", "Global")
    ];

    [McpServerTool, Description("Find grants by keyword and optional minimum funding amount in EUR.")]
    public static IEnumerable<GrantItem> SearchGrants(
        [Description("Keyword in the grant title.")] string keyword,
        [Description("Optional minimum grant amount in EUR.")] decimal? minAmountEur = null)
    {
        var query = Grants.Where(g =>
            g.Name.Contains(keyword, StringComparison.OrdinalIgnoreCase) &&
            (!minAmountEur.HasValue || g.AmountEur >= minAmountEur.Value));

        return query.ToList();
    }

    public sealed record GrantItem(string Id, string Name, decimal AmountEur, string DeadlineIsoDate, string Region);
}
