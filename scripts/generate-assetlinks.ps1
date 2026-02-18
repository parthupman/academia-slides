# Generate assetlinks.json for Digital Asset Links

Write-Host "Generate Digital Asset Links" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

$PACKAGE_NAME = Read-Host "Enter Android package name (default: com.academiaslides.app)"
if ([string]::IsNullOrWhiteSpace($PACKAGE_NAME)) {
    $PACKAGE_NAME = "com.academiaslides.app"
}

$SHA256 = Read-Host "Enter SHA256 fingerprint (from keytool -list -v)"

if ([string]::IsNullOrWhiteSpace($SHA256)) {
    Write-Host "Error: SHA256 fingerprint is required" -ForegroundColor Red
    Write-Host ""
    Write-Host "To get your SHA256 fingerprint:"
    Write-Host "1. Generate keystore:"
    Write-Host "   keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000"
    Write-Host ""
    Write-Host "2. List certificate:"
    Write-Host "   keytool -list -v -keystore my-release-key.keystore -alias my-key-alias"
    Write-Host ""
    Write-Host "3. Copy the SHA256 fingerprint (without colons)"
    exit 1
}

# Remove colons if present
$SHA256_CLEAN = $SHA256 -replace ":", ""

$assetLinks = @"
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "$PACKAGE_NAME",
    "sha256_cert_fingerprints": [
      "$SHA256_CLEAN"
    ]
  }
}]
"@

# Create directory if needed
New-Item -ItemType Directory -Force -Path "..\public\.well-known" | Out-Null

# Write file
$assetLinks | Out-File -FilePath "..\public\.well-known\assetlinks.json" -Encoding utf8

Write-Host ""
Write-Host "✓ Created public/.well-known/assetlinks.json" -ForegroundColor Green
Write-Host ""
Write-Host "Content:" -ForegroundColor Cyan
Write-Host $assetLinks
Write-Host ""
Write-Host "IMPORTANT: Deploy this file to your website at:" -ForegroundColor Yellow
Write-Host "https://YOUR-DOMAIN/.well-known/assetlinks.json" -ForegroundColor Yellow
Write-Host ""
