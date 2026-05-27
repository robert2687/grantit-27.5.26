using ModelContextProtocol.Server;
using System.ComponentModel;
using System.Text;

namespace McpServer.Tools;

[McpServerToolType]
public sealed class ProposalDraftTools
{
    [McpServerTool, Description("Creates a compact proposal executive summary draft for a selected grant.")]
    public static string BuildExecutiveSummary(
        [Description("Grant title.")] string grantTitle,
        [Description("Organization name.")] string organization,
        [Description("Core problem statement.")] string problem,
        [Description("High-level solution approach.")] string approach)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Executive Summary");
        sb.AppendLine();
        sb.AppendLine($"Program: {grantTitle}");
        sb.AppendLine($"Applicant: {organization}");
        sb.AppendLine();
        sb.AppendLine("Problem");
        sb.AppendLine(problem);
        sb.AppendLine();
        sb.AppendLine("Approach");
        sb.AppendLine(approach);
        sb.AppendLine();
        sb.AppendLine("Expected Impact");
        sb.AppendLine("The proposed work improves delivery speed, compliance readiness, and measurable social/economic outcomes for target beneficiaries.");
        return sb.ToString();
    }
}
