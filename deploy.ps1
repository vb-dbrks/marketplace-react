# PowerShell deployment script for Databricks Apps
# Usage: .\deploy.ps1 [workspace-path] [app-name]

param(
    [string]$AppFolderInWorkspace = "/Workspace/Users/varun.bhandary@databricks.com/internalmarketplace-react",
    [string]$LakehouseAppName = "internalmarketplace-react"
)

Write-Host "🚀 Starting Databricks Apps deployment..." -ForegroundColor Green
Write-Host "📁 Workspace Path: $AppFolderInWorkspace" -ForegroundColor Cyan
Write-Host "📱 App Name: $LakehouseAppName" -ForegroundColor Cyan

# Frontend build and import
Write-Host "`n📦 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
Remove-Item .env -ErrorAction SilentlyContinue
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "📤 Uploading frontend to Databricks..." -ForegroundColor Yellow
databricks workspace import-dir dist "$AppFolderInWorkspace/static" --overwrite
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend upload failed!" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Backend packaging
Write-Host "`n📦 Packaging backend..." -ForegroundColor Yellow
Set-Location backend
New-Item -ItemType Directory -Path build -Force | Out-Null

# Copy all files except hidden files and build directory
Get-ChildItem -Path . -Force | Where-Object { 
    $_.Name -notlike ".*" -and 
    $_.Name -ne "build" -and 
    $_.Name -ne "__pycache__" -and
    $_.Name -notlike "local_conf*"
} | ForEach-Object {
    if ($_.PSIsContainer) {
        Copy-Item -Path $_.FullName -Destination "build\$($_.Name)" -Recurse
    } else {
        Copy-Item -Path $_.FullName -Destination "build\$($_.Name)"
    }
}

# Handle production app file if it exists
if (Test-Path "app_prod.py") {
    Copy-Item "app_prod.py" "build/app.py"
    Write-Host "✅ Using production app configuration" -ForegroundColor Green
}

Write-Host "📤 Uploading backend to Databricks..." -ForegroundColor Yellow
databricks workspace import-dir build "$AppFolderInWorkspace" --overwrite
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend upload failed!" -ForegroundColor Red
    exit 1
}

# Cleanup
Remove-Item -Path build -Recurse -Force
Set-Location ..

# Deploy the application
Write-Host "`n🚀 Deploying application..." -ForegroundColor Yellow
databricks apps deploy "$LakehouseAppName" --source-code-path "$AppFolderInWorkspace"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ App deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 App URL: WORKSPACEURL.com/apps/$LakehouseAppName" -ForegroundColor Cyan
Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Check app status in Databricks UI" -ForegroundColor White
Write-Host "   2. Configure app permissions" -ForegroundColor White
Write-Host "   3. Add Lakebase database resource if needed" -ForegroundColor White
