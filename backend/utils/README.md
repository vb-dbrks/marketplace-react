# Backend Utilities

This directory contains utility scripts for the Data Marketplace application.

## Available Scripts

### `seed_database.py`

Seeds the Lakebase database with data from `dataProducts.json`.

**Usage:**
```bash
# Using environment variable
export PGPASSWORD="your_token_here"
python seed_database.py

# Using command line argument
python seed_database.py "your_token_here"
```

**What it does:**
- Reads all products from `dataProducts.json`
- Connects to the Lakebase PostgreSQL database
- Writes all products to the database
- Verifies the data was written correctly
- Provides feedback on the seeding process

**Requirements:**
- Valid Databricks token (either as environment variable or command line argument)
- `dataProducts.json` file in the backend directory
- Database environment variables set (PGHOST, PGUSER, PGDATABASE, etc.)

**Example Output:**
```
✅ Using token from environment variable
✅ Database service imported successfully
📦 Found 13 products in JSON file
🌱 Seeding database...
✅ Database seeded successfully!
📊 Database now contains 13 products
📋 First product: Global Budget Planning & Investment - (MVP)

🎉 Database seeding complete!
💡 You can now remove the JSON file if desired
```
