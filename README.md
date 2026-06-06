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

1. Optional environment variables for release signing:

- `KEYSTORE_PATH`
- `STORE_PASSWORD`
- `KEY_PASSWORD`

1. Debug keystore handling:

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
