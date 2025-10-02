# Databricks Asset Bundle Deployment Script for Astellas Data Marketplace (PowerShell)
# This script deploys the marketplace using Databricks Asset Bundles

param(
    [Parameter(Position=0)]
    [ValidateSet("development", "production")]
    [string]$Environment = "development"
)

# Function to write colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Write-Status "Deploying to environment: $Environment"

# Check if Databricks CLI is installed
try {
    databricks --version | Out-Null
} catch {
    Write-Error "Databricks CLI is not installed. Please install it first:"
    Write-Host "pip install databricks-cli"
    exit 1
}

# Check if we're authenticated
try {
    databricks auth profiles list | Out-Null
} catch {
    Write-Error "Not authenticated with Databricks. Please run:"
    Write-Host "databricks auth login"
    exit 1
}

Write-Status "Building frontend..."
if (Test-Path "frontend") {
    Write-Status "Found frontend directory, building locally..."
    Set-Location frontend
    npm install
    npm run build
    Set-Location ..
    
    Write-Status "Copying frontend build to src/static..."
    if (Test-Path "src/static") {
        Remove-Item -Recurse -Force "src/static"
    }
    Copy-Item -Recurse "frontend/dist" "src/static"
} else {
    Write-Warning "No frontend directory found. Assuming static files are already in src/static/"
    if (-not (Test-Path "src/static")) {
        Write-Error "No frontend build found in src/static/"
        exit 1
    }
}

Write-Status "Validating bundle configuration..."
$validation = databricks bundle validate --environment $Environment
if ($LASTEXITCODE -ne 0) {
    Write-Error "Bundle validation failed"
    exit 1
}

Write-Success "Bundle validation passed"

Write-Status "Deploying bundle to $Environment environment..."
$deployment = databricks bundle deploy --environment $Environment
if ($LASTEXITCODE -eq 0) {
    Write-Success "Bundle deployed successfully!"
    
    Write-Status "Getting app URL..."
    try {
        $appInfo = databricks bundle run --environment $Environment --output json | ConvertFrom-Json
        if ($appInfo.app_url) {
            Write-Success "Application deployed at: $($appInfo.app_url)"
        } else {
            Write-Warning "Could not retrieve app URL. Check the Databricks workspace for the deployed app."
        }
    } catch {
        Write-Warning "Could not retrieve app URL. Check the Databricks workspace for the deployed app."
    }
    
    Write-Status "Deployment complete!"
    Write-Status "You can manage your bundle with:"
    Write-Host "  databricks bundle run --environment $Environment"
    Write-Host "  databricks bundle destroy --environment $Environment"
    
} else {
    Write-Error "Bundle deployment failed"
    exit 1
}
