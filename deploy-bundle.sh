#!/bin/bash

# Databricks Asset Bundle Deployment Script for Astellas Data Marketplace
# This script deploys the marketplace using Databricks Asset Bundles

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if target is specified
TARGET=${1:-development}
print_status "Deploying to target: $TARGET"

# Validate target
if [[ "$TARGET" != "development" && "$TARGET" != "staging" && "$TARGET" != "production" ]]; then
    print_error "Invalid target. Use 'development', 'staging', or 'production'"
    exit 1
fi

# Check if Databricks CLI is installed
if ! command -v databricks &> /dev/null; then
    print_error "Databricks CLI is not installed. Please install it first:"
    echo "pip install databricks-cli"
    exit 1
fi

# Check if we're authenticated
if ! databricks auth profiles list &> /dev/null; then
    print_error "Not authenticated with Databricks. Please run:"
    echo "databricks auth login"
    exit 1
fi

print_status "Building frontend..."
if [[ -d "frontend" ]]; then
    print_status "Found frontend directory, building locally..."
    cd frontend
    npm install
    npm run build
    cd ..
    
    print_status "Copying frontend build to src/static..."
    rm -rf src/static
    cp -r frontend/dist src/static
else
    print_warning "No frontend directory found. Assuming static files are already in src/static/"
    if [[ ! -d "src/static" ]]; then
        print_error "No frontend build found in src/static/"
        exit 1
    fi
fi

print_status "Validating bundle configuration..."
if ! databricks bundle validate --target "$TARGET"; then
    print_error "Bundle validation failed"
    exit 1
fi

print_success "Bundle validation passed"

print_status "Deploying bundle to $TARGET target..."
if databricks bundle deploy --target "$TARGET"; then
    print_success "Bundle deployed successfully!"
    
    # Get the app URL
    print_status "Getting app URL..."
    APP_URL=$(databricks bundle run --target "$TARGET" --output json | jq -r '.app_url // empty')
    
    if [[ -n "$APP_URL" ]]; then
        print_success "Application deployed at: $APP_URL"
    else
        print_warning "Could not retrieve app URL. Check the Databricks workspace for the deployed app."
    fi
    
    print_status "Deployment complete!"
    print_status "You can manage your bundle with:"
    echo "  databricks bundle run --target $TARGET"
    echo "  databricks bundle destroy --target $TARGET"
    
else
    print_error "Bundle deployment failed"
    exit 1
fi
