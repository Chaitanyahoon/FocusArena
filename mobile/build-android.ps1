# Helper script to build the Android Release APK locally
# Ensure you have Android Studio / Java / Node.js correctly configured on your Windows machine.

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting local Android Release Build..." -ForegroundColor Cyan

# Check if we are in the correct directory (FocusArena/mobile)
if (-Not (Test-Path "android\gradlew.bat")) {
    Write-Host "❌ Error: Could not find android\gradlew.bat. Please run this script from the FocusArena\mobile directory." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Step 1/3: Installing npm dependencies..." -ForegroundColor Blue
npm install

Write-Host "🔨 Step 2/3: Running Gradle assembleRelease..." -ForegroundColor Blue
Set-Location android
.\gradlew.bat assembleRelease

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Gradle build failed." -ForegroundColor Red
    exit $LASTEXITCODE
}

Set-Location ..

Write-Host "📋 Step 3/3: Copying APK to builds directory..." -ForegroundColor Blue
$apkPath = "android\app\build\outputs\apk\release\app-release.apk"
$buildDir = "builds"

if (-Not (Test-Path $buildDir)) {
    New-Item -ItemType Directory -Path $buildDir | Out-Null
}

$destination = "$buildDir\app-release.apk"
Copy-Item $apkPath -Destination $destination -Force

Write-Host "✅ Success! Release APK generated at: FocusArena\mobile\$destination" -ForegroundColor Green
Write-Host "To install on an emulator/device, run: adb install $destination" -ForegroundColor Yellow
