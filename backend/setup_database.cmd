@echo off
REM Database setup script for Data Marketplace (Command Prompt)
REM Usage: setup_database.cmd YOUR_TOKEN_HERE

echo 🌱 Database Setup for Data Marketplace
echo ======================================
echo.

REM Check if token is provided
if "%1"=="" (
    echo ❌ Please provide your Databricks token:
    echo    setup_database.cmd YOUR_TOKEN_HERE
    echo.
    echo 💡 To get a token:
    echo    1. Go to your Databricks workspace
    echo    2. User Settings → Developer → Access Tokens
    echo    3. Generate a new token
    pause
    exit /b 1
)

REM Check if dataProducts.json exists
if not exist "dataProducts.json" (
    echo ❌ dataProducts.json not found!
    echo    Please ensure you have a dataProducts.json file in the backend directory
    pause
    exit /b 1
)

echo ✅ Found dataProducts.json file
echo.

echo 🔧 Setting up environment variables...
echo ⚠️  NOTE: Update these with your actual Lakebase connection details
set PGHOST=your-lakebase-host.database.azuredatabricks.net
set PGUSER=your-email@databricks.com
set PGDATABASE=databricks_postgres
set PGPORT=5432
set PGSSLMODE=require
set PGPASSWORD=%1

echo 🌱 Seeding database...
python seed_simple.py %1

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database seeded successfully!
    echo 🚀 You can now start the app with:
    echo    python app.py
    echo.
    echo 🌐 Access the app at: http://localhost:8000
    echo 📊 Check database status: http://localhost:8000/api/database-status
) else (
    echo.
    echo ❌ Database seeding failed!
    echo 💡 Make sure your token is valid and not expired
)

pause
