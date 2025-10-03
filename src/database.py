import json
import os
import sys
import logging
from typing import List, Dict, Any, Optional
from models import DataProduct, DataProductTag, get_session, create_tables
from sqlalchemy.orm import Session
from sqlalchemy import and_, text

# Set up logger
logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        # Always use database - no JSON fallback
        self.use_database = True
        self._database_initialized = False
    
    def _ensure_database_connection(self):
        """Ensure database connection is established (lazy initialization)"""
        logger.info("=== Database Connection Check ===")
        logger.info(f"use_database: {self.use_database}")
        logger.info(f"_database_initialized: {self._database_initialized}")
        
        if not self.use_database or self._database_initialized:
            logger.info("Skipping database connection - not needed or already initialized")
            return
            
        logger.info("Attempting database connection with Databricks SDK OAuth token...")
        logger.info("Environment variables:")
        logger.info(f"  PGHOST: {os.environ.get('PGHOST', 'NOT SET')}")
        logger.info(f"  PGUSER: {os.environ.get('PGUSER', 'NOT SET')}")
        logger.info(f"  PGDATABASE: {os.environ.get('PGDATABASE', 'NOT SET')}")
        logger.info(f"  PGPORT: {os.environ.get('PGPORT', 'NOT SET')}")
        logger.info(f"  PGSSLMODE: {os.environ.get('PGSSLMODE', 'NOT SET')}")
        logger.info(f"  DATABRICKS_CLIENT_ID: {os.environ.get('DATABRICKS_CLIENT_ID', 'NOT SET')}")
        logger.info(f"  DATABRICKS_CLIENT_SECRET: {'SET' if os.environ.get('DATABRICKS_CLIENT_SECRET') else 'NOT SET'}")
        
        try:
            logger.info("Calling create_tables()...")
            create_tables()
            self._database_initialized = True
            logger.info("SUCCESS: Database connection successful with App Authorization")
        except Exception as e:
            error_msg = str(e)
            logger.error(f"ERROR: Database connection failed: {error_msg}")
            logger.error(f"Error type: {type(e).__name__}")
            if "Database connection details missing" in error_msg:
                raise Exception(f"Missing database configuration: {error_msg}. Databricks Apps must provide PGHOST, PGUSER, PGDATABASE.")
            elif "Lakebase credentials" in error_msg:
                raise Exception(f"Missing Lakebase credentials: {error_msg}. Databricks Apps must provide PGHOST, PGUSER, PGDATABASE.")
            elif "psycopg2" in error_msg or "No module named" in error_msg:
                raise Exception(f"PostgreSQL driver not available: {error_msg}. Databricks Runtime should have psycopg2 pre-installed.")
            else:
                raise Exception(f"Database connection failed: {error_msg}")
    
    def get_products(self) -> List[Dict[str, Any]]:
        """Get all data products from database"""
        logger.info("=" * 60)
        logger.info("=== DATABASE SERVICE: get_products() called ===")
        logger.info("=" * 60)
        logger.info(f"use_database: {self.use_database}")
        logger.info(f"_database_initialized: {self._database_initialized}")
        
        logger.info("--- Using DATABASE mode ---")
        logger.info("Calling _ensure_database_connection()...")
        try:
            self._ensure_database_connection()
            logger.info("✅ Database connection ensured successfully")
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise
        
        logger.info("Calling _get_products_from_db()...")
        try:
            result = self._get_products_from_db()
            logger.info(f"✅ Database query completed, returned {len(result)} products")
            return result
        except Exception as e:
            logger.error(f"❌ Database query failed: {e}")
            raise
    
    def update_products(self, products: List[Dict[str, Any]]) -> bool:
        """Update all data products in database"""
        self._ensure_database_connection()
        return self._update_products_in_db(products)
    
    def _get_products_from_db(self) -> List[Dict[str, Any]]:
        """Get products from PostgreSQL database"""
        logger.info("=== _get_products_from_db() called ===")
        session = None
        try:
            session = get_session()
            logger.info("SUCCESS: Database session obtained")
            
            logger.info("Querying DataProduct table...")
            products = session.query(DataProduct).all()
            logger.info(f"Found {len(products)} products in database")
            result = []
            
            for i, product in enumerate(products):
                try:
                    logger.info(f"Processing product {i+1}: {getattr(product, 'name', 'Unknown')}")
                    
                    # Get tags separately using raw SQL to avoid relationship issues
                    tags = []
                    try:
                        # Query tags separately using raw SQL to avoid relationship issues
                        tag_query = session.execute(
                            text("SELECT tag FROM public.data_product_tags WHERE product_id = :product_id"),
                            {"product_id": product.id}
                        )
                        tags = [row[0] for row in tag_query.fetchall()]
                        logger.info(f"Found {len(tags)} tags for product {product.id}")
                    except Exception as tag_error:
                        logger.warning(f"Could not load tags for product {product.id}: {tag_error}")
                        tags = []
                    
                    # Build product dict with safe attribute access and NULL handling
                    def safe_str(value):
                        """Convert None to empty string, otherwise return string value"""
                        return "" if value is None else str(value)
                    
                    product_dict = {
                        "id": safe_str(getattr(product, 'id', '')),
                        "name": safe_str(getattr(product, 'name', '')),
                        "description": safe_str(getattr(product, 'description', '')),
                        "purpose": safe_str(getattr(product, 'purpose', '')),
                        "type": safe_str(getattr(product, 'type', '')),
                        "domain": safe_str(getattr(product, 'domain', '')),
                        "region": safe_str(getattr(product, 'region', '')),
                        "owner": safe_str(getattr(product, 'owner', '')),
                        "certified": safe_str(getattr(product, 'certified', '')),
                        "classification": safe_str(getattr(product, 'classification', '')),
                        "gxp": safe_str(getattr(product, 'gxp', '')),
                        "interval_of_change": safe_str(getattr(product, 'interval_of_change', '')),
                        "last_updated_date": safe_str(getattr(product, 'last_updated_date', '')),
                        "first_publish_date": safe_str(getattr(product, 'first_publish_date', '')),
                        "next_reassessment_date": safe_str(getattr(product, 'next_reassessment_date', '')),
                        "security_considerations": safe_str(getattr(product, 'security_considerations', '')),
                        "sub_domain": safe_str(getattr(product, 'sub_domain', '')),
                        "databricks_url": safe_str(getattr(product, 'databricks_url', '')),
                        "tableau_url": safe_str(getattr(product, 'tableau_url', '')),
                        "qlik_url": safe_str(getattr(product, 'qlik_url', '')),
                        "data_contract_url": safe_str(getattr(product, 'data_contract_url', '')),
                        "tags": tags
                        # Note: Excluding created_at and updated_at timestamps to match frontend expectations
                    }
                    result.append(product_dict)
                    logger.info(f"Successfully processed product {i+1}")
                    
                except Exception as product_error:
                    logger.error(f"Error processing product {i+1}: {product_error}")
                    # Continue with next product instead of failing completely
                    continue
            
            logger.info(f"SUCCESS: Successfully processed {len(result)} products")
            return result
        except Exception as e:
            logger.error(f"ERROR: Error querying database: {e}")
            logger.error(f"Error type: {type(e).__name__}")
            # Re-raise the exception so the API can handle it properly
            raise
        finally:
            if session:
                logger.info("Closing database session")
                session.close()
    
    def _update_products_in_db(self, products: List[Dict[str, Any]]) -> bool:
        """Update products in PostgreSQL database"""
        logger.info(f"Starting database update with {len(products)} products")
        
        try:
            session = get_session()
            if not session:
                logger.error("Failed to get database session")
                return False
            logger.info("✅ Database session created successfully")
        except Exception as session_error:
            logger.error(f"❌ Failed to create database session: {session_error}")
            return False
        
        try:
            logger.info("Clearing existing data...")
            # Clear existing data - tags first due to foreign key dependency
            tag_count = session.query(DataProductTag).count()
            product_count = session.query(DataProduct).count()
            logger.info(f"Deleting {tag_count} existing tags and {product_count} existing products")
            
            # Delete tags first to avoid foreign key constraint violations
            if tag_count > 0:
                logger.info("Deleting existing tags...")
                session.query(DataProductTag).delete()
                logger.info("✅ Tags deleted successfully")
            
            # Then delete products
            if product_count > 0:
                logger.info("Deleting existing products...")
                session.query(DataProduct).delete()
                logger.info("✅ Products deleted successfully")
            
            # Flush the deletes before inserting new data
            session.flush()
            logger.info("✅ Delete operations flushed to database")
            
            logger.info("Inserting new data...")
            
            # Pre-generate IDs for products that need them to avoid duplicates
            used_ids = set()
            for product_data in products:
                if product_data.get("id") and product_data.get("id").strip():
                    used_ids.add(product_data.get("id"))
            
            next_id_counter = self._get_next_id_counter(session)
            
            # Insert new data
            for i, product_data in enumerate(products):
                logger.info(f"Processing product {i+1}/{len(products)}: {product_data.get('name', 'Unknown')}")
                
                # Create product
                # Generate ID if not provided or empty
                product_id = product_data.get("id")
                if not product_id or product_id.strip() == "":
                    # Generate unique ID for this batch
                    while True:
                        product_id = f"DP{next_id_counter:04d}"
                        if product_id not in used_ids:
                            used_ids.add(product_id)
                            break
                        next_id_counter += 1
                    next_id_counter += 1
                    logger.info(f"Generated new ID {product_id} for product: {product_data.get('name', 'Unknown')}")
                else:
                    logger.info(f"Using provided ID {product_id} for product: {product_data.get('name', 'Unknown')}")
                
                logger.info(f"Creating DataProduct object for {product_id}")
                product = DataProduct(
                    id=product_id,
                    name=product_data["name"],
                    description=product_data.get("description"),
                    purpose=product_data.get("purpose"),
                    type=product_data.get("type"),
                    domain=product_data.get("domain"),
                    region=product_data.get("region"),
                    owner=product_data.get("owner"),
                    certified=product_data.get("certified"),
                    classification=product_data.get("classification"),
                    gxp=product_data.get("gxp"),
                    interval_of_change=product_data.get("interval_of_change"),
                    last_updated_date=product_data.get("last_updated_date"),
                    first_publish_date=product_data.get("first_publish_date"),
                    next_reassessment_date=product_data.get("next_reassessment_date"),
                    security_considerations=product_data.get("security_considerations"),
                    sub_domain=product_data.get("sub_domain"),
                    databricks_url=product_data.get("databricks_url"),
                    tableau_url=product_data.get("tableau_url", ""),
                    qlik_url=product_data.get("qlik_url", ""),
                    data_contract_url=product_data.get("data_contract_url", "")
                )
                logger.info(f"Adding DataProduct {product_id} to session")
                session.add(product)
                
                # Add tags
                tags = product_data.get("tags", [])
                logger.info(f"Adding {len(tags)} tags for product {product_id}")
                for tag in tags:
                    if tag and tag.strip():  # Only add non-empty tags
                        tag_obj = DataProductTag(
                            product_id=product_id,  # Use the generated/provided product_id
                            tag=tag.strip()
                        )
                        session.add(tag_obj)
            
            logger.info("Committing transaction...")
            session.commit()
            logger.info("✅ Database update completed successfully")
            return True
        except Exception as e:
            session.rollback()
            error_msg = str(e)
            error_type = type(e).__name__
            
            logger.error(f"Database update error: {e}")
            logger.error(f"Error type: {error_type}")
            logger.error(f"Error details: {error_msg}")
            
            # Print to stdout as well for immediate visibility
            print(f"Database update error: {e}")
            print(f"Error type: {error_type}")
            
            # Check for specific error types
            if "IntegrityError" in error_type:
                logger.error("This appears to be a database constraint violation")
                print("This appears to be a database constraint violation")
            elif "DataError" in error_type:
                logger.error("This appears to be a data type or format error")
                print("This appears to be a data type or format error")
            elif "OperationalError" in error_type:
                logger.error("This appears to be a database connection or operational error")
                print("This appears to be a database connection or operational error")
            
            return False
        finally:
            session.close()
    
    def _get_next_id_counter(self, session):
        """Get the next ID counter to use for batch ID generation"""
        try:
            # Get the highest existing ID number
            result = session.execute(
                text("SELECT id FROM public.data_products WHERE id LIKE 'DP%' ORDER BY CAST(SUBSTRING(id, 3) AS INTEGER) DESC LIMIT 1")
            ).fetchone()
            
            if result and result[0]:
                # Extract the number part and increment
                current_id = result[0]
                current_num = int(current_id[2:])  # Remove 'DP' prefix
                next_num = current_num + 1
            else:
                # Start with 1 if no existing IDs
                next_num = 1
            
            logger.info(f"Next ID counter will start at: {next_num}")
            return next_num
            
        except Exception as e:
            logger.error(f"Error getting ID counter: {e}")
            # Fallback to timestamp-based counter
            import time
            fallback_counter = int(time.time()) % 10000
            logger.info(f"Using fallback ID counter: {fallback_counter}")
            return fallback_counter

# Global database service instance
db_service = DatabaseService()
