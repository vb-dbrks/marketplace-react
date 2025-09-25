# PowerShell deployment script for Databricks Apps
# Save this as deploy.ps1 in your project root

param(
    [string]$AppFolderInWorkspace = "/Workspace/Users/varun.bhandary@databricks.com/internalmarketplace-react",
    [string]$LakehouseAppName = "internalmarketplace-react"
)

# Safety check for workspace path
if (-not ($AppFolderInWorkspace -like "/Workspace/*")) {
    Write-Host "ERROR: AppFolderInWorkspace must be a Databricks workspace path starting with /Workspace/."
    Write-Host "Usage: .\deploy.ps1 -AppFolderInWorkspace '/Workspace/Users/your.email@company.com/internalmarketplace-react' -LakehouseAppName 'appname'"
    exit 1
}

# Frontend build and import
Push-Location frontend
npm install
npm run build
Pop-Location

# Import frontend static files to Databricks workspace
& databricks workspace import-dir "frontend/dist" "$AppFolderInWorkspace/static" --overwrite

# Backend packaging
Push-Location backend
if (Test-Path build) { Remove-Item build -Recurse -Force }
New-Item -ItemType Directory -Path build | Out-Null

Get-ChildItem -Directory | Where-Object { $_.Name -notin @('build', '__pycache__') } | ForEach-Object {
    Copy-Item $_.FullName -Destination build -Recurse
}
Get-ChildItem -File | Where-Object { $_.Name -notmatch '^\.' -and $_.Name -notlike 'local_conf*' -and $_.Name -ne 'app_prod.py' } | ForEach-Object {
    Copy-Item $_.FullName -Destination build
}
if (Test-Path app_prod.py) {
    Copy-Item app_prod.py build/app.py -Force
}
Pop-Location

# Import backend build to Databricks workspace
& databricks workspace import-dir "backend/build" "$AppFolderInWorkspace" --overwrite
Remove-Item backend/build -Recurse -Force

# Deploy the application
& databricks apps deploy $LakehouseAppName --source-code-path $AppFolderInWorkspace

# Print the app page URL
Write-Host "Open the app page for details and permission: WORKSPACEURL.com/apps/$LakehouseAppName"
