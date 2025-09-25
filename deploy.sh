#!/bin/bash

# Accept parameters
APP_FOLDER_IN_WORKSPACE=${1:-"/Workspace/Users/varun.bhandary@databricks.com/internalmarketplace-react"}
LAKEHOUSE_APP_NAME=${2:-"internalmarketplace-react"}
DATABRICKS_PROFILE=${3:-"DEFAULT"}

# Display configuration
echo "🚀 Starting Databricks Apps deployment..."
echo "📁 Workspace Path: $APP_FOLDER_IN_WORKSPACE"
echo "📱 App Name: $LAKEHOUSE_APP_NAME"
echo "🔧 Databricks Profile: $DATABRICKS_PROFILE"
echo ""

# Function to run databricks commands with profile
run_databricks() {
    if [ "$DATABRICKS_PROFILE" = "DEFAULT" ]; then
        databricks "$@"
    else
        databricks --profile "$DATABRICKS_PROFILE" "$@"
    fi
}

# Frontend build and import. Swap in your /frontend folder name if it's different here. 
(
 cd frontend
 # Remove .env to ensure production build uses relative API URLs
 rm -f .env
 npm run build
 run_databricks workspace import-dir dist "$APP_FOLDER_IN_WORKSPACE/static" --overwrite
) &

# Backend packaging. Swap in your /backend folder name if it's different here. 
(
 cd backend
 mkdir -p build
 # Exclude all hidden files and app_prod.py
 find . -mindepth 1 -maxdepth 1 -not -name '.*' -not -name "local_conf*" -not -name 'build' -not -name '__pycache__' -exec cp -r {} build/ \;
 if [ -f app_prod.py ]; then
   cp app_prod.py build/app.py
 fi
 # Import and deploy the application
 run_databricks workspace import-dir build "$APP_FOLDER_IN_WORKSPACE" --overwrite
 rm -rf build
) &

# Wait for both background processes to finish
wait

# Deploy the application
echo "🚀 Deploying application..."
run_databricks apps deploy "$LAKEHOUSE_APP_NAME" --source-code-path "$APP_FOLDER_IN_WORKSPACE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment completed successfully!"
    echo "🌐 App URL: WORKSPACEURL.com/apps/$LAKEHOUSE_APP_NAME"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Check app status in Databricks UI"
    echo "   2. Configure app permissions"
    echo "   3. Add Lakebase database resource if needed"
else
    echo "❌ Deployment failed!"
    exit 1
fi