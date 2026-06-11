# RMD26 Grant System (Android)

## Prerequisites

- JDK 17+ (JDK 21/25 also works)
- Android SDK with:
  - Platform 36
  - Build Tools (latest)
  - Platform Tools

## First-time setup

1. Configure Android SDK path in `local.properties`:

```properties
sdk.dir=/absolute/path/to/Android/Sdk
```

  Common Linux path examples:

```properties
sdk.dir=/home/<your-user>/Android/Sdk
```

1. If Gradle reports `SDK location not found`, either:

- set `sdk.dir` in `local.properties`, or
- export `ANDROID_HOME` to your SDK location.

1. Optional Gradle properties or environment variables for release signing:

- `KEYSTORE_PATH`
- `STORE_PASSWORD`
- `KEY_ALIAS` (defaults to `upload`)
- `KEY_PASSWORD`

1. Optional Gradle properties or environment variables for release versioning:

- `APP_APPLICATION_ID`
- `APP_VERSION_CODE`
- `APP_VERSION_NAME`

1. Debug keystore handling:

- If `debug.keystore` is missing, build automatically generates it from `debug.keystore.base64`.

## Build commands

```bash
./gradlew :app:assembleDebug
./gradlew :app:testDebugUnitTest
```

## Google Play release build

1. Generate an upload keystore once:

```bash
keytool -genkeypair \
  -v \
  -keystore /absolute/path/my-upload-key.jks \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

1. Export release signing values:

```bash
export KEYSTORE_PATH=/absolute/path/my-upload-key.jks
export STORE_PASSWORD='<store-password>'
export KEY_ALIAS=upload
export KEY_PASSWORD='<key-password>'
```

1. Set the Play release version before each upload:

```bash
export APP_VERSION_CODE=2
export APP_VERSION_NAME=1.0.1
```

1. Build the Android App Bundle for Google Play:

```bash
./gradlew :app:bundleRelease
```

The bundle is written to:

```text
/tmp/workspace/robert2687/grantit-27.5.26/app/build/outputs/bundle/release/
```

1. Optional: build a signed APK for manual install/testing:

```bash
./gradlew :app:assembleRelease
```

## Web preview (static mock)

You can preview the UI shell in a browser without running Android:

```bash
cd web-preview
python3 -m http.server 4173
```

Then open:

```bash
"$BROWSER" http://localhost:4173
```

Or directly open the file:

```bash
"$BROWSER" /workspaces/grantit-27.5.26/web-preview/index.html
```

## Grant Search Agent integration

The Android app `Search` screen now calls a real Grant Search Agent endpoint.

### Start the local Grant Search Agent (MCP server)

```bash
cd mcp-server/src
dotnet run
```

This exposes:

- `GET /api/agents/grant-search?keyword=<text>&minAmountEur=<number>`

### Android base URL

- Default base URL is `http://10.0.2.2:8080/` (Android emulator to host machine).
- To override it, pass a Gradle property:

```bash
./gradlew :app:assembleDebug -PGRANT_SEARCH_AGENT_BASE_URL=http://<host>:8080/
```

If `./gradlew` is not executable:

```bash
chmod +x gradlew
```

## Power Apps custom connector

The `powerapps-connector/` directory contains a ready-to-import custom connector for Microsoft Power Apps / Power Automate.

### Files

| File | Purpose |
|------|---------|
| `apiDefinition.swagger.json` | OpenAPI 2.0 definition — describes all four REST operations |
| `apiProperties.json` | Power Platform connector metadata (icon colour, OAuth settings) |

### Importing the connector

3. If you plan to add Azure AD authentication on the server, replace `YOUR_AZURE_AD_CLIENT_ID` in `apiProperties.json` with your app registration's client ID; otherwise delete the `connectionParameters` block to use no-auth.

### Available operations

| Operation | Method | Path | Description |
|-----------|--------|------|-------------|
| `SearchGrants` | GET | `/api/agents/grant-search` | Find grants by keyword and optional minimum EUR amount |
| `EvaluateReadiness` | POST | `/api/agents/evaluate-readiness` | Score proposal readiness (0–100) |
| `BuildExecutiveSummary` | POST | `/api/agents/build-executive-summary` | Draft a grant executive summary |
| `GetStatus` | GET | `/status` | Check server health |

### Using the connector in Power Automate

Example flow to search for EU grants and check readiness:

1. Add **Grantit → SearchGrants** step with `keyword = "AI"`.
2. Loop over results and add **Grantit → EvaluateReadiness** with the checklist values.
3. If `readinessScore` ≥ 90, add **Grantit → BuildExecutiveSummary** and send the output by email.

## Notes

- App entrypoint is `RMD26GrantSystemApp` in `app/src/main/java/com/example/ui/RMD26GrantSystemApp.kt`.
- Navigation host is centralized in `GrantSystemNavHost` (`MainScreen.kt`).
