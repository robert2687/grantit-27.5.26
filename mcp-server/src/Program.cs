using McpServer.Tools;
using ModelContextProtocol;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMcpServer()
    .WithHttpTransport()
    .WithTools<GrantDiscoveryTools>()
    .WithTools<GrantEvaluationTools>()
    .WithTools<ProposalDraftTools>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseCors();
app.MapMcp();

app.MapGet("/api/agents/grant-search", (
    string keyword,
    decimal? minAmountEur) =>
{
    var grants = GrantDiscoveryTools.SearchGrants(keyword, minAmountEur);
    return Results.Ok(grants);
});

app.MapPost("/api/agents/evaluate-readiness", (EvaluateReadinessRequest req) =>
{
    var result = GrantEvaluationTools.EvaluateReadiness(
        req.GrantId,
        req.TechnicalAnnexReady,
        req.BudgetJustificationReady,
        req.ConsortiumAgreementSigned);
    return Results.Ok(result);
});

app.MapPost("/api/agents/build-executive-summary", (BuildExecutiveSummaryRequest req) =>
{
    if (string.IsNullOrWhiteSpace(req.GrantTitle) ||
        string.IsNullOrWhiteSpace(req.Organization) ||
        string.IsNullOrWhiteSpace(req.Problem) ||
        string.IsNullOrWhiteSpace(req.Approach))
    {
        return Results.BadRequest(new { error = "grantTitle, organization, problem, and approach are required." });
    }

    var summary = ProposalDraftTools.BuildExecutiveSummary(
        req.GrantTitle,
        req.Organization,
        req.Problem,
        req.Approach);
    return Results.Ok(new { summary });
});

app.MapGet("/status", () => Results.Ok(new
{
    name = "grantit-mcp-server",
    status = "ready",
    transport = "http+sse",
    mcpPath = "/"
}));

app.Run();

record EvaluateReadinessRequest(
    string GrantId,
    bool TechnicalAnnexReady,
    bool BudgetJustificationReady,
    bool ConsortiumAgreementSigned);

record BuildExecutiveSummaryRequest(
    string GrantTitle,
    string Organization,
    string Problem,
    string Approach);
