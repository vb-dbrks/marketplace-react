#!/usr/bin/env python3
"""
Data Seeding Script for Databricks Asset Bundles

This script seeds the Lakebase database with sample data for the Astellas Data Marketplace.
It's designed to work within the Databricks Asset Bundle environment.
"""

import os
import json
import sys
import logging
from pathlib import Path
from database import db_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_sample_data():
    """Load sample data from the utils directory or create default data"""
    
    # Try to find the sample data file
    possible_paths = [
        "../backend/utils/dataProducts.json",
        "../utils/dataProducts.json", 
        "./dataProducts.json",
        "../resources/dataProducts.json"
    ]
    
    sample_data = None
    for path in possible_paths:
        if os.path.exists(path):
            logger.info(f"Loading sample data from: {path}")
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    sample_data = json.load(f)
                break
            except Exception as e:
                logger.warning(f"Failed to load data from {path}: {e}")
                continue
    
    if not sample_data:
        logger.info("No sample data file found, creating default data")
        sample_data = create_default_data()
    
    return sample_data

def create_default_data():
    """Create default sample data if no data file is found"""
    return [
        {
            "id": "DP0001",
            "name": "Commercial Sales Analytics",
            "description": "Comprehensive sales performance analytics for commercial operations",
            "purpose": "Enable data-driven decision making for commercial teams",
            "type": "Analytics Data Product",
            "domain": "Commercial",
            "region": "Global",
            "owner": "commercial.analytics@astellas.com",
            "certified": "Yes",
            "classification": "Internal",
            "gxp": "Non-GXP",
            "interval_of_change": "Daily",
            "last_updated_date": "2024-01-15",
            "first_publish_date": "2023-06-01",
            "next_reassessment_date": "2024-06-01",
            "security_considerations": "Contains sensitive commercial data. Access restricted to commercial teams.",
            "sub_domain": "Commercial",
            "databricks_url": "https://databricks.com/workspace/commercial-analytics",
            "tableau_url": "https://tableau.astellas.com/commercial-dashboard",
            "qlik_url": "",
            "data_contract_url": "",
            "tags": ["analytics", "commercial", "sales", "performance"]
        },
        {
            "id": "DP0002", 
            "name": "Clinical Trial Data Repository",
            "description": "Centralized repository for clinical trial data and outcomes",
            "purpose": "Support clinical research and regulatory submissions",
            "type": "Dataset",
            "domain": "Clinical Research",
            "region": "Global",
            "owner": "clinical.data@astellas.com",
            "certified": "Yes",
            "classification": "Confidential",
            "gxp": "GXP",
            "interval_of_change": "Weekly",
            "last_updated_date": "2024-01-10",
            "first_publish_date": "2023-03-15",
            "next_reassessment_date": "2024-03-15",
            "security_considerations": "GXP validated system. Strict access controls and audit trails required.",
            "sub_domain": "Clinical Research",
            "databricks_url": "https://databricks.com/workspace/clinical-trials",
            "tableau_url": "",
            "qlik_url": "",
            "data_contract_url": "https://contracts.astellas.com/clinical-data",
            "tags": ["clinical", "trials", "gxp", "regulatory"]
        }
    ]

def ensure_schema_compatibility(data):
    """Ensure the data is compatible with the current schema"""
    for item in data:
        # Ensure all required fields exist
        required_fields = {
            'id': f"DP{len(data):04d}",
            'name': 'Unnamed Product',
            'description': '',
            'purpose': '',
            'type': 'Dataset',
            'domain': 'Commercial',
            'region': 'Global',
            'owner': 'data.platform@astellas.com',
            'certified': 'No',
            'classification': 'Internal',
            'gxp': 'Non-GXP',
            'interval_of_change': 'Monthly',
            'last_updated_date': '2024-01-01',
            'first_publish_date': '2024-01-01',
            'next_reassessment_date': '2024-12-31',
            'security_considerations': '',
            'sub_domain': 'Commercial',
            'databricks_url': '',
            'tableau_url': '',
            'qlik_url': '',
            'data_contract_url': '',
            'tags': []
        }
        
        for field, default_value in required_fields.items():
            if field not in item:
                item[field] = default_value
        
        # Handle legacy field names
        if 'business_function' in item:
            item['sub_domain'] = item.pop('business_function')
        
        # Ensure tags is a list
        if isinstance(item.get('tags'), str):
            item['tags'] = [tag.strip() for tag in item['tags'].split(',') if tag.strip()]
        elif not isinstance(item.get('tags'), list):
            item['tags'] = []
    
    return data

def main():
    """Main seeding function"""
    try:
        logger.info("Starting data seeding for Astellas Data Marketplace")
        
        # Load sample data
        sample_data = load_sample_data()
        logger.info(f"Loaded {len(sample_data)} sample products")
        
        # Ensure schema compatibility
        sample_data = ensure_schema_compatibility(sample_data)
        
        # Seed the database
        logger.info("Seeding database...")
        success = db_service.update_products(sample_data)
        
        if success:
            logger.info("✅ Database seeded successfully!")
            
            # Verify the seeding
            products = db_service.get_products()
            logger.info(f"📊 Database now contains {len(products)} products")
            
            if products:
                logger.info(f"📋 Sample product: {products[0].get('name', 'Unknown')}")
            
        else:
            logger.error("❌ Failed to seed database")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
