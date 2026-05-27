using ModelContextProtocol.Server;
using System.ComponentModel;

namespace McpServer.Tools;

[McpServerToolType]
public sealed class GrantEvaluationTools
{
    [McpServerTool, Description("Evaluates submission readiness based on key proposal checklist inputs.")]
    public static EvaluationResult EvaluateReadiness(
        [Description("Grant identifier.")] string grantId,
        [Description("Whether technical annex is drafted.")] bool technicalAnnexReady,
        [Description("Whether budget justification is complete.")] bool budgetJustificationReady,
        [Description("Whether consortium agreement is signed.")] bool consortiumAgreementSigned)
    {
        var completed = 0;
        if (technicalAnnexReady) completed++;
        if (budgetJustificationReady) completed++;
        if (consortiumAgreementSigned) completed++;

        var score = (int)Math.Round((completed / 3.0) * 100.0);
        var decision = score switch
        {
            >= 90 => "Ready to submit",
            >= 60 => "Needs final improvements",
            _ => "Not ready"
        };

        return new EvaluationResult(grantId, score, decision);
    }

    public sealed record EvaluationResult(string GrantId, int ReadinessScore, string Decision);
}
