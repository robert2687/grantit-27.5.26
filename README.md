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

2. If Gradle reports `SDK location not found`, either:

- set `sdk.dir` in `local.properties`, or
- export `ANDROID_HOME` to your SDK location.

3. Optional environment variables for release signing:

- `KEYSTORE_PATH`
- `STORE_PASSWORD`
- `KEY_PASSWORD`

4. Debug keystore handling:

- If `debug.keystore` is missing, build automatically generates it from `debug.keystore.base64`.

## Build commands

```bash
./gradlew :app:assembleDebug
./gradlew :app:testDebugUnitTest
```

If `./gradlew` is not executable:

```bash
chmod +x gradlew
```

## Notes

- App entrypoint is `RMD26GrantSystemApp` in `app/src/main/java/com/example/ui/RMD26GrantSystemApp.kt`.
- Navigation host is centralized in `GrantSystemNavHost` (`MainScreen.kt`).
