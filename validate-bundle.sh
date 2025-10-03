#!/bin/bash

# Databricks Asset Bundle Validation Script
# This script validates the bundle configuration and checks for common issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

TARGET=${1:-development}
ERRORS=0

print_status "Validating Databricks Asset Bundle for target: $TARGET"

# Check if Databricks CLI is installed
if ! command -v databricks &> /dev/null; then
    print_error "Databricks CLI is not installed"
    ERRORS=$((ERRORS + 1))
else
    print_success "Databricks CLI is installed"
fi

# Check if authenticated
if ! databricks auth profiles list &> /dev/null; then
    print_error "Not authenticated with Databricks"
    ERRORS=$((ERRORS + 1))
else
    print_success "Authenticated with Databricks"
fi

# Check required files exist
print_status "Checking required files..."

required_files=(
    "databricks.yml"
    "src/app.py"
    "src/app.yaml"
    "src/models.py"
    "src/database.py"
    "src/requirements.txt"
    "environments/development.yml"
    "environments/production.yml"
)

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        print_success "Found: $file"
    else
        print_error "Missing: $file"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check if frontend is built
if [[ -d "src/static" ]]; then
    print_success "Frontend build found in src/static"
else
    print_warning "Frontend not built. Run: npm run build in frontend/ and copy to src/static"
fi

# Validate bundle syntax
print_status "Validating bundle syntax..."
if databricks bundle validate --target "$TARGET" &> /dev/null; then
    print_success "Bundle syntax is valid"
else
    print_error "Bundle syntax validation failed"
    print_status "Running detailed validation..."
    databricks bundle validate --target "$TARGET"
    ERRORS=$((ERRORS + 1))
fi

# Check Python requirements
print_status "Checking Python requirements..."
if [[ -f "src/requirements.txt" ]]; then
    while IFS= read -r line; do
        if [[ $line =~ ^[a-zA-Z] ]]; then
            package=$(echo "$line" | cut -d'=' -f1 | cut -d'>' -f1 | cut -d'<' -f1)
            print_status "Required package: $package"
        fi
    done < "src/requirements.txt"
fi

# Summary
echo
if [[ $ERRORS -eq 0 ]]; then
    print_success "✅ Bundle validation passed! Ready for deployment."
    echo
    print_status "Next steps:"
    echo "  1. Deploy: ./deploy-bundle.sh $TARGET"
    echo "  2. Monitor: databricks bundle run --target $TARGET --logs"
else
    print_error "❌ Bundle validation failed with $ERRORS error(s)"
    echo
    print_status "Fix the errors above and run validation again"
    exit 1
fi
