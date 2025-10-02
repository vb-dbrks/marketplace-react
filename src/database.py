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
        try:
            session = get_session()
            logger.info("SUCCESS: Database session obtained")
            
            logger.info("Querying DataProduct table...")
            products = session.query(DataProduct).all()
            logger.info(f"Found {len(products)} products in database")
            result = []
            
            for i, product in enumerate(products):
                logger.info(f"Processing product {i+1}: {product.name}")
                
                # Handle tags safely - they might not exist
                try:
                    tags = [tag.tag for tag in product.tags] if hasattr(product, 'tags') and product.tags else []
                except Exception as e:
                    logger.warning(f"Could not load tags for product {product.name}: {e}")
                    tags = []
                
                product_dict = {
                    "id": product.id,
                    "name": product.name,
                    "description": product.description,
                    "purpose": product.purpose,
                    "type": product.type,
                    "domain": product.domain,
                    "region": product.region,
                    "owner": product.owner,
                    "certified": product.certified,
                    "classification": product.classification,
                    "gxp": product.gxp,
                    "interval_of_change": product.interval_of_change,
                    "last_updated_date": product.last_updated_date,
                    "first_publish_date": product.first_publish_date,
                    "next_reassessment_date": product.next_reassessment_date,
                    "security_considerations": product.security_considerations,
                    "sub_domain": product.sub_domain,
                    "databricks_url": product.databricks_url,
                    "tableau_url": product.tableau_url or "",
                    "qlik_url": product.qlik_url or "",
                    "data_contract_url": product.data_contract_url or "",
                    "tags": tags
                }
                result.append(product_dict)
            
            logger.info(f"SUCCESS: Successfully processed {len(result)} products")
            return result
        except Exception as e:
            logger.error(f"ERROR: Error querying database: {e}")
            logger.error(f"Error type: {type(e).__name__}")
            return []
        finally:
            if 'session' in locals():
                logger.info("Closing database session")
                session.close()
    
    def _update_products_in_db(self, products: List[Dict[str, Any]]) -> bool:
        """Update products in PostgreSQL database"""
        session = get_session()
        if not session:
            return False
        
        try:
            # Clear existing data
            session.query(DataProductTag).delete()
            session.query(DataProduct).delete()
            
            # Insert new data
            for product_data in products:
                # Create product
                # Generate ID if not provided
                product_id = product_data.get("id")
                if not product_id:
                    # Get the next sequential ID
                    product_id = self._generate_next_id(session)
                
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
                session.add(product)
                
                # Add tags
                tags = product_data.get("tags", [])
                for tag in tags:
                    tag_obj = DataProductTag(
                        product_id=product_data["id"],
                        tag=tag
                    )
                    session.add(tag_obj)
            
            session.commit()
            return True
        except Exception as e:
            session.rollback()
            print(f"Database update error: {e}")
            return False
        finally:
            session.close()
    
    def _generate_next_id(self, session):
        """Generate the next sequential ID in format DPXXXX"""
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
            
            # Format as DPXXXX (4 digits with leading zeros)
            new_id = f"DP{next_num:04d}"
            logger.info(f"Generated new ID: {new_id}")
            return new_id
            
        except Exception as e:
            logger.error(f"Error generating ID: {e}")
            # Fallback to timestamp-based ID
            import time
            fallback_id = f"DP{int(time.time()) % 10000:04d}"
            logger.info(f"Using fallback ID: {fallback_id}")
            return fallback_id
    

# Global database service instance
db_service = DatabaseService()
