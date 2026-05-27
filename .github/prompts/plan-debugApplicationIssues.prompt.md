## Plan: Debug Grantit Android + MCP Issues

We’ll triage in two tracks: Android build/test infrastructure and MCP runtime reliability. The top blockers are environment/tooling (missing Gradle wrapper / adb and env config), not core app logic. Recommended approach: unblock prerequisites first, then run deterministic test/debug sequence.

**Steps**

### Phase 1 — Prerequisite triage (parallel)
1. Android build runner check: confirm either Gradle wrapper exists in repo root or system Gradle is installed.  
2. Android device test check: confirm `adb` and at least one emulator/device for instrumented tests.  
3. MCP environment check: confirm `.NET 10 SDK` active and `GEMINI_API_KEY` populated from `.env.example` into runtime environment.  
4. Process hygiene baseline: ensure no stale running `McpServer` process before build (to avoid file-lock warnings/errors).  
(*Steps 1–4 can run in parallel*)

### Phase 2 — Android debug path (*depends on Phase 1 Android checks*)
5. Build debug APK and validate output artifact updates (`.build-outputs/app-debug.apk` timestamp).  
6. Run host-side unit tests (includes Compose host tests under `app/src/test`).  
7. If device available, run connected Android tests; if not available, mark as blocked with explicit evidence and keep moving.  
8. Capture failures by class and task, then map to root cause buckets: missing infra, test config, or app logic.

### Phase 3 — MCP debug path (*depends on Phase 1 MCP checks*)
9. Restore/build `mcp-server/src/McpServer.csproj` with clean process state.  
10. Start MCP server and validate `/status` response; confirm transport + SSE endpoint readiness.  
11. Validate tool invocation path (Grant discovery/evaluation/proposal tools) and confirm missing-key behavior is eliminated after env setup.  
12. Re-run build after runtime stop to ensure no lock regressions.

### Phase 4 — Stabilization and regression checks
13. Add a repeatable “clean debug cycle” runbook: stop server → build → run → status check → stop.  
14. Re-run Android + MCP smoke checks in one pass to confirm stability.  
15. Produce final defect list: fixed, still blocked, and environment-dependent items.

**Relevant files**
- `d:/DEVELOPER/New folder/grantit-27.5.26/app/build.gradle.kts` — Android plugin/test configuration and signing/env dependencies.
- `d:/DEVELOPER/New folder/grantit-27.5.26/build.gradle.kts` — root Android build configuration.
- `d:/DEVELOPER/New folder/grantit-27.5.26/gradle/libs.versions.toml` — dependency/toolchain versions used by Android tests.
- `d:/DEVELOPER/New folder/grantit-27.5.26/app/src/test/java/com/example/MainScreenCrashTest.kt` — critical host-side UI crash test.
- `d:/DEVELOPER/New folder/grantit-27.5.26/app/src/androidTest/java/com/example/ExampleInstrumentedTest.kt` — connected device instrumentation path.
- `d:/DEVELOPER/New folder/grantit-27.5.26/mcp-server/src/Program.cs` — startup pipeline, transport, and `/status` endpoint.
- `d:/DEVELOPER/New folder/grantit-27.5.26/mcp-server/src/McpServer.csproj` — .NET target/framework and package constraints.
- `d:/DEVELOPER/New folder/grantit-27.5.26/mcp-server/src/Tools/GrantDiscoveryTools.cs` — tool runtime behavior validation.
- `d:/DEVELOPER/New folder/grantit-27.5.26/mcp-server/src/Tools/GrantEvaluationTools.cs` — tool runtime behavior validation.
- `d:/DEVELOPER/New folder/grantit-27.5.26/mcp-server/src/Tools/ProposalDraftTools.cs` — tool runtime behavior validation.
- `d:/DEVELOPER/New folder/grantit-27.5.26/.vscode/mcp.json` — local MCP client endpoint mapping.
- `d:/DEVELOPER/New folder/grantit-27.5.26/.env.example` — required env vars for MCP behavior.

**Verification**
1. Android prerequisites pass/fail evidence captured (wrapper/system Gradle, adb/device).  
2. Android debug APK build succeeds.  
3. Android unit tests execute and report generated.  
4. Connected Android tests either pass or are explicitly blocked with proven environment evidence.  
5. MCP build passes from clean state.  
6. MCP `/status` returns 200 + expected JSON payload.  
7. Post-run rebuild passes without file-lock failure.  
8. Final consolidated issue table includes root cause, fix/mitigation, and retest status.

**Decisions**
- Included scope: debugging execution blockers and runtime reliability across Android + MCP.
- Excluded scope: feature development or architectural rewrites.
- Prioritization: unblock environment/tooling first because it currently masks true app-level defects.

**Further Considerations**
1. Android test runner strategy:  
   - Option A: restore Gradle wrapper in repo (recommended, reproducible for all contributors).  
   - Option B: rely on system Gradle (faster locally, less reproducible).  
2. MCP run workflow:  
   - Option A: always run with explicit stop/start to prevent lock conflicts (recommended).  
   - Option B: keep persistent run session and build only with `--no-build` runtime cycle.