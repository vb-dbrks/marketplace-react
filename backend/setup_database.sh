#!/bin/bash

# Database setup script for Data Marketplace
# This script helps you set up the database with sample data

echo "🌱 Database Setup for Data Marketplace"
echo "======================================"
echo ""

# Check if dataProducts.json exists
if [ ! -f "dataProducts.json" ]; then
    echo "❌ dataProducts.json not found!"
    echo "   Please ensure you have a dataProducts.json file in the backend directory"
    echo "   You can create one with sample data or restore from backup"
    exit 1
fi

echo "✅ Found dataProducts.json file"
echo ""

# Check if token is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your Databricks token:"
    echo "   ./setup_database.sh YOUR_TOKEN_HERE"
    echo ""
    echo "💡 To get a token:"
    echo "   1. Go to your Databricks workspace"
    echo "   2. User Settings → Developer → Access Tokens"
    echo "   3. Generate a new token"
    exit 1
fi

echo "🔧 Setting up environment variables..."
echo "⚠️  NOTE: Update these with your actual Lakebase connection details"
export PGHOST="your-lakebase-host.database.azuredatabricks.net"
export PGUSER="your-email@databricks.com"
export PGDATABASE="databricks_postgres"
export PGPORT="5432"
export PGSSLMODE="require"
export PGPASSWORD="$1"

echo "🌱 Seeding database..."
python utils/seed_database.py "$1"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database seeded successfully!"
    echo "🚀 You can now start the app with:"
    echo "   python app.py"
    echo ""
    echo "🌐 Access the app at: http://localhost:8000"
    echo "📊 Check database status: http://localhost:8000/api/database-status"
else
    echo ""
    echo "❌ Database seeding failed!"
    echo "💡 Make sure your token is valid and not expired"
fi
