# Play Store Deployment Helper Script for Windows
# Run this after deploying to Vercel

Write-Host "🚀 AcademiaSlides Play Store Preparation" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running from project root
if (-not (Test-Path "android")) {
    Write-Host "Error: Please run this script from the project root" -ForegroundColor Red
    exit 1
}

# Get current domain
$DOMAIN = Read-Host "Enter your deployed Vercel URL (e.g., https://academia-slides.vercel.app)"

if ([string]::IsNullOrWhiteSpace($DOMAIN)) {
    Write-Host "Error: Domain is required" -ForegroundColor Red
    exit 1
}

# Remove https:// prefix for manifest
$CLEAN_DOMAIN = $DOMAIN -replace "https://", "" -replace "http://", ""

Write-Host ""
Write-Host "Updating configuration files..." -ForegroundColor Yellow

# Update AndroidManifest.xml
$manifestPath = "android\app\src\main\AndroidManifest.xml"
$manifestContent = Get-Content $manifestPath -Raw
$manifestContent = $manifestContent -replace "academia-slides\.vercel\.app", $CLEAN_DOMAIN
Set-Content $manifestPath $manifestContent -NoNewline
Write-Host "✓ Updated AndroidManifest.xml" -ForegroundColor Green

# Update strings.xml
$stringsPath = "android\app\src\main\res\values\strings.xml"
$stringsContent = Get-Content $stringsPath -Raw
$stringsContent = $stringsContent -replace "academia-slides\.vercel\.app", $CLEAN_DOMAIN
Set-Content $stringsPath $stringsContent -NoNewline
Write-Host "✓ Updated strings.xml" -ForegroundColor Green

Write-Host ""
Write-Host "Configuration updated!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create app icons and place in android\app\src\main\res\mipmap-*\"
Write-Host "2. Generate signing keystore:"
Write-Host "   cd android\app"
Write-Host "   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000"
Write-Host ""
Write-Host "3. Get SHA256 fingerprint and add to public\.well-known\assetlinks.json"
Write-Host "   keytool -list -v -keystore my-release-key.keystore -alias my-key-alias"
Write-Host ""
Write-Host "4. Open Android Studio and build release AAB"
Write-Host "   - Select 'Open an existing project'"
Write-Host "   - Choose the 'android' folder"
Write-Host "   - Build > Generate Signed Bundle / APK"
Write-Host ""
Write-Host "5. Upload to Google Play Console"
Write-Host ""
