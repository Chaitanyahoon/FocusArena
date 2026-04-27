# Mobile Build and Release

This mobile app is configured to build a native Android APK directly from GitHub Actions without any external cloud services or accounts.

## What the repo now contains

- `.github/workflows/mobile-release.yml`
  - A manual GitHub workflow to trigger pure native Android builds.
  - Automatically compiles the React Native app into a standalone `.apk` using Gradle.
  - Creates a GitHub Release and attaches the compiled APK for immediate download.

## No Setup Required

Unlike previous configurations, this purely native approach **does not** require an Expo account, an `EXPO_TOKEN`, or any EAS (`eas-cli`) setup. Everything is compiled directly on GitHub's Ubuntu servers.

## How to trigger a build on GitHub

1. Open the **Actions** tab in your GitHub repository.
2. Select **Mobile Android Release** from the left sidebar.
3. Click the **Run workflow** button on the right.
4. Leave the default options and click **Run workflow**.

Once the workflow finishes (it usually takes about 5-10 minutes to download the Android SDK and compile the C++ libraries), it will automatically create a new Release in your GitHub repository containing the `app-release.apk` file, which you can download and install directly on your Android device.
