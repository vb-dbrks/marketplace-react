#!/bin/bash

# Accept parameters
APP_FOLDER_IN_WORKSPACE=${1:-"/Workspace/Users/varun.bhandary@databricks.com/internalmarketplace-react"}

# Databricks App must already have been created. You can do so with the Databricks CLI or via the UI in a Workspace.
LAKEHOUSE_APP_NAME=${2:-"internalmarketplace-react"}

# Frontend build and import. Swap in your /frontend folder name if it's different here. 
(
 cd frontend
 # Remove .env to ensure production build uses relative API URLs
 rm -f .env
 npm run build
 databricks workspace import-dir dist "$APP_FOLDER_IN_WORKSPACE/static" --overwrite
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
 databricks workspace import-dir build "$APP_FOLDER_IN_WORKSPACE" --overwrite
 rm -rf build
) &

# Wait for both background processes to finish
wait

# Deploy the application
databricks apps deploy "$LAKEHOUSE_APP_NAME" --source-code-path "$APP_FOLDER_IN_WORKSPACE"

# Print the app page URL -- put your workspace name in the below URL. 
echo "Open the app page for details and permission: WORKSPACEURL.com/apps/$LAKEHOUSE_APP_NAME"