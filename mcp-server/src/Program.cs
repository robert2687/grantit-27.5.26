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

app.MapGet("/status", () => Results.Ok(new
{
    name = "grantit-mcp-server",
    status = "ready",
    transport = "http+sse",
    mcpPath = "/"
}));

app.Run();
