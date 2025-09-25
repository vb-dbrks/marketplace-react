#!/bin/zsh
# Script to build React app, copy static files, and run FastAPI backend

set -e

# 0. Remove .env to ensure production build uses relative API URLs
cd "$(dirname "$0")/frontend"
if [ -f .env ]; then
  echo "Removing .env for production build..."
  rm .env
fi

# 1. Build the React frontend
echo "Installing frontend dependencies..."
npm install
echo "Building React app..."
npm run build

# 2. Copy built static files to backend/static
cd ..
mkdir -p backend/static
cp -r frontend/dist/* backend/static/

# 3. Set up Python virtual environment for backend
cd backend
echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing backend dependencies in venv..."
pip install --upgrade pip
pip install fastapi uvicorn

# 4. Run FastAPI backend (serves both API and static frontend)
echo "Starting FastAPI server at http://localhost:8000 ..."
uvicorn app:app --host 0.0.0.0 --port 8000
