#!/usr/bin/env python3
"""
Simple database seeding script for Windows compatibility
"""

import os
import json
import sys

# Add the current directory to the path so we can import from backend modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def main():
    # Check if token is provided
    if len(sys.argv) > 1:
        os.environ['PGPASSWORD'] = sys.argv[1]
        print("✅ Using token from command line argument")
    elif os.environ.get('PGPASSWORD'):
        print("✅ Using token from environment variable")
    else:
        print("❌ Please provide your Databricks token:")
        print("   python seed_simple.py YOUR_TOKEN_HERE")
        print("   or set PGPASSWORD environment variable")
        sys.exit(1)

    try:
        from database import db_service
        print("✅ Database service imported successfully")
        
        # Read data from JSON file
        json_file_path = os.path.join(os.path.dirname(__file__), 'dataProducts.json')
        
        if not os.path.exists(json_file_path):
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
