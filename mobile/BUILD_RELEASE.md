# Mobile Build and Release

This mobile app is configured to build a native Android APK directly from GitHub Actions without any external cloud services (like Expo Application Services) or accounts.

## What the repo now contains

- `.github/workflows/android-build.yml`
  - A GitHub workflow that triggers on pushes to the `main` branch or manually via `workflow_dispatch`.
  - Automatically compiles the React Native app into a standalone `.apk` using native Gradle commands.
  - Exposes the compiled APK as a downloadable Artifact attached to the Action run.

- `mobile/build-android.ps1`
  - A local PowerShell script that you can run on your Windows machine to generate a Release APK without waiting for GitHub.
  - Automatically runs the Gradle commands and outputs the APK to `mobile/builds/`.

## No Setup Required

Unlike previous configurations, this purely native approach **does not** require an Expo account, an `EXPO_TOKEN`, or any EAS (`eas-cli`) setup. Everything is compiled directly using the Android SDK.

## How to trigger a build on GitHub

1. Open the **Actions** tab in your GitHub repository.
2. Select **Android Release Build** from the left sidebar.
3. The build triggers automatically when you push to `main`, but you can also click **Run workflow** to run it manually.

Once the workflow finishes, you can download the `focusarena-release-apk` artifact from the summary page and install it directly on your Android device.
