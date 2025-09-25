import json
import os
from typing import List, Dict, Any, Optional
from models import DataProduct, DataProductTag, get_session, create_tables
from sqlalchemy.orm import Session
from sqlalchemy import and_

class DatabaseService:
    def __init__(self):
        self.use_database = os.environ.get("PGHOST") is not None
        if self.use_database:
            create_tables()
    
    def get_products(self) -> List[Dict[str, Any]]:
        """Get all data products"""
        if self.use_database:
            return self._get_products_from_db()
        else:
            return self._get_products_from_json()
    
    def update_products(self, products: List[Dict[str, Any]]) -> bool:
        """Update all data products"""
        if self.use_database:
            return self._update_products_in_db(products)
        else:
            return self._update_products_in_json(products)
    
    def _get_products_from_db(self) -> List[Dict[str, Any]]:
        """Get products from PostgreSQL database"""
        session = get_session()
        if not session:
            return []
        
        try:
            products = session.query(DataProduct).all()
            result = []
            
            for product in products:
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
                    "business_function": product.business_function,
                    "databricks_url": product.databricks_url,
                    "tableau_url": product.tableau_url or "",
                    "tags": [tag.tag for tag in product.tags]
                }
                result.append(product_dict)
            
            return result
        finally:
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
                product = DataProduct(
                    id=product_data["id"],
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
                    business_function=product_data.get("business_function"),
                    databricks_url=product_data.get("databricks_url"),
                    tableau_url=product_data.get("tableau_url", "")
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
    
    def _get_products_from_json(self) -> List[Dict[str, Any]]:
        """Fallback: Get products from JSON file"""
        try:
            with open('dataProducts.json', 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"JSON read error: {e}")
            return []
    
    def _update_products_in_json(self, products: List[Dict[str, Any]]) -> bool:
        """Fallback: Update products in JSON file"""
        try:
            with open('dataProducts.json', 'w') as f:
                json.dump(products, f, indent=4)
            return True
        except Exception as e:
            print(f"JSON write error: {e}")
            return False

# Global database service instance
db_service = DatabaseService()
