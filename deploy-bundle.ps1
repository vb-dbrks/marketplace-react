# Databricks Asset Bundle Deployment Script for Astellas Data Marketplace (PowerShell)
# This script deploys the marketplace using Databricks Asset Bundles

param(
    [Parameter(Position=0)]
    [ValidateSet("development", "staging", "production")]
    [string]$Target = "development",
    
    [Parameter()]
    [string]$DatabricksProfile = $null,
    
    [Parameter()]
    [switch]$Force,
    
    [Parameter()]
    [switch]$Clean,
    
    [Parameter()]
    [switch]$Sync,
    
    [Parameter()]
    [switch]$SyncOnly
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

# Handle sync-only mode
if ($SyncOnly) {
    Write-Status "Sync-only mode: Syncing source files to workspace without deployment"
    
    # Build frontend first
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
    }
    
    # Sync files
    $workspacePath = "/Workspace/foundationx/apps/astellas-data-marketplace"
    $syncArgs = @("sync", "./src", $workspacePath, "--full")
    if ($DatabricksProfile) {
        $syncArgs += @("--profile", $DatabricksProfile)
    }
    
    Write-Status "Running: databricks $($syncArgs -join ' ')"
    $syncResult = & databricks $syncArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Source files synced successfully to $workspacePath"
        Write-Status "Sync complete! Your app should now reflect the latest changes."
    } else {
        Write-Error "Sync failed"
        exit 1
    }
    
    exit 0
}

Write-Status "Deploying to target: $Target"

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
if ($DatabricksProfile) {
    Write-Status "Using Databricks profile: $DatabricksProfile"
    $validation = databricks bundle validate --target $Target --profile $DatabricksProfile
} else {
    $validation = databricks bundle validate --target $Target
}
if ($LASTEXITCODE -ne 0) {
    Write-Error "Bundle validation failed"
    exit 1
}

Write-Success "Bundle validation passed"

# Clean deployment option - destroy existing resources first
if ($Clean) {
    Write-Status "Clean deployment requested - destroying existing resources first..."
    $destroyArgs = @("bundle", "destroy", "--target", $Target, "--auto-approve")
    if ($DatabricksProfile) {
        $destroyArgs += @("--profile", $DatabricksProfile)
    }
    
    Write-Status "Running: databricks $($destroyArgs -join ' ')"
    $destroy = & databricks $destroyArgs
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Existing resources destroyed successfully"
    } else {
        Write-Warning "Destroy command failed or no existing resources found - continuing with deployment"
    }
}

Write-Status "Deploying bundle to $Target target..."
if ($Force) {
    Write-Status "Using --force flag for Git branch validation and --auto-approve for non-interactive deployment"
}

$deployArgs = @("bundle", "deploy", "--target", $Target, "--auto-approve")
if ($DatabricksProfile) {
    $deployArgs += @("--profile", $DatabricksProfile)
}
if ($Force) {
    $deployArgs += "--force"  # This is for Git branch validation
}

Write-Status "Running: databricks $($deployArgs -join ' ')"
$deployment = & databricks $deployArgs
if ($LASTEXITCODE -eq 0) {
    Write-Success "Bundle deployed successfully!"
    
    # Sync source files to workspace if requested
    if ($Sync) {
        Write-Status "Syncing source files to workspace..."
        
        # Get the workspace path from bundle configuration
        $workspacePath = "/Workspace/foundationx/apps/astellas-data-marketplace"  # Default path
        
        $syncArgs = @("sync", "./src", $workspacePath, "--full")
        if ($DatabricksProfile) {
            $syncArgs += @("--profile", $DatabricksProfile)
        }
        
        Write-Status "Running: databricks $($syncArgs -join ' ')"
        $syncResult = & databricks $syncArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Source files synced successfully to $workspacePath"
        } else {
            Write-Warning "Sync failed, but deployment was successful"
        }
    }
    
    Write-Status "Getting app URL..."
    try {
        if ($DatabricksProfile) {
            $appInfo = databricks bundle run --target $Target --profile $DatabricksProfile --output json | ConvertFrom-Json
        } else {
            $appInfo = databricks bundle run --target $Target --output json | ConvertFrom-Json
        }
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
    Write-Host "  databricks bundle run --target $Target"
    Write-Host "  databricks bundle destroy --target $Target"
    
} else {
    Write-Error "Bundle deployment failed"
    exit 1
}
