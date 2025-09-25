# Utility Scripts

This directory contains utility scripts for the Data Marketplace application.

## Database Seeding

### `seed_database.py`
Seeds the Lakebase database with data from `dataProducts.json`.

**Usage:**
```bash
# Using environment variables
export PGPASSWORD="your-token-here"
python utils/seed_database.py

# Using command line argument
python utils/seed_database.py "your-token-here"
```

**Prerequisites:**
1. Set up your Lakebase connection details in the script or environment variables
2. Ensure `dataProducts.json` exists in the backend directory
3. Have a valid Databricks token

### `seed_simple.py`
A simplified version of the seeding script with better Windows compatibility.

## Setup Scripts

### `setup_database.sh` (Linux/Mac)
Automated setup script for Unix-like systems.

### `setup_database.cmd` (Windows)
Automated setup script for Windows Command Prompt.

## Configuration

Before running any scripts, update the database connection details in:
- `seed_database.py` (lines 25-30)
- `setup_database.sh` (lines 34-39)
- `setup_database.cmd` (lines 35-40)

Replace the placeholder values with your actual Lakebase connection details.