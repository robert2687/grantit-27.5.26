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

## Notes

- App entrypoint is `RMD26GrantSystemApp` in `app/src/main/java/com/example/ui/RMD26GrantSystemApp.kt`.
- Navigation host is centralized in `GrantSystemNavHost` (`MainScreen.kt`).
