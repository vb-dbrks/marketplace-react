#!/usr/bin/env python3
"""
Database Seeding Utility

This script seeds the Lakebase database with data from dataProducts.json.
It can be used to migrate data from JSON file storage to PostgreSQL database.

Usage:
    python seed_database.py [TOKEN]
    
    If TOKEN is provided, it will be used as the PGPASSWORD.
    If TOKEN is not provided, the script will use the PGPASSWORD environment variable.
"""

import os
import json
import sys
from pathlib import Path

# Add the parent directory to the path so we can import from backend modules
sys.path.append(str(Path(__file__).parent.parent))

# Use environment variables if they're already set, otherwise set defaults
if not os.environ.get('PGHOST'):
    os.environ['PGHOST'] = 'instance-585a6376-b1ab-45e1-b42f-e63538845c14.database.azuredatabricks.net'
    os.environ['PGUSER'] = 'varun.bhandary@databricks.com'
    os.environ['PGDATABASE'] = 'databricks_postgres'
    os.environ['PGPORT'] = '5432'
    os.environ['PGSSLMODE'] = 'require'

# Check if token is provided as command line argument or environment variable
if len(sys.argv) > 1:
    os.environ['PGPASSWORD'] = sys.argv[1]
    print("✅ Using token from command line argument")
elif os.environ.get('PGPASSWORD'):
    print("✅ Using token from environment variable")
else:
    print("❌ Please provide your Databricks token either:")
    print("   1. Set PGPASSWORD environment variable, or")
    print("   2. Run: python seed_database.py YOUR_TOKEN_HERE")
    sys.exit(1)

def main():
    try:
        from database import db_service
        print("✅ Database service imported successfully")
        
        # Read data from JSON file
        json_file_path = Path(__file__).parent.parent / 'dataProducts.json'
        
        if not json_file_path.exists():
            print(f"❌ JSON file not found at: {json_file_path}")
            print("   Please ensure dataProducts.json exists in the backend directory")
            sys.exit(1)
        
        with open(json_file_path, 'r') as f:
            products_data = json.load(f)
        
        print(f"📦 Found {len(products_data)} products in JSON file")
        
        # Seed the database
        print("🌱 Seeding database...")
        success = db_service.update_products(products_data)
        
        if success:
            print("✅ Database seeded successfully!")
            
            # Verify the data was written
            db_products = db_service.get_products()
            print(f"📊 Database now contains {len(db_products)} products")
            
            if db_products:
                print(f"📋 First product: {db_products[0].get('name', 'Unknown')}")
            
            print("\n🎉 Database seeding complete!")
            print("💡 You can now remove the JSON file if desired")
        else:
            print("❌ Failed to seed database")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
