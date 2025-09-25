from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
import os, json, logging, signal, sys
from typing import List, Dict, Any
import uvicorn
from database import db_service

# Configure logging to stdout/stderr as required by Databricks Apps
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

app = FastAPI()

# Graceful shutdown handling - required for Databricks Apps
def signal_handler(sig, frame):
    logging.info('Gracefully shutting down...')
    sys.exit(0)

signal.signal(signal.SIGTERM, signal_handler)

# CORS configuration: dev on localhost:5173, prod on Databricks domains
is_development = os.environ.get("ENVIRONMENT", "development") == "development"

if is_development:
    # Allow all origins for local development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Production CORS for Databricks Apps
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "https://*.azuredatabricks.net",
            "https://*.databricksapps.com"
        ],
        allow_origin_regex=r"https://.*\.(azuredatabricks\.net|databricksapps\.com)",
        allow_credentials=True,
        allow_methods=["GET", "PUT", "POST"],
        allow_headers=["*"],
    )

# Input validation models
class DataProduct(BaseModel):
    id: str
    name: str
    description: str
    purpose: str
    type: str
    domain: str
    region: str
    owner: str
    certified: str
    classification: str
    gxp: str
    interval_of_change: str
    last_updated_date: str
    first_publish_date: str
    next_reassessment_date: str
    security_considerations: str
    business_function: str
    databricks_url: str
    tableau_url: str = ""
    tags: List[str] = []

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )

# Database service is imported and initialized
# It automatically detects if Lakebase is available via environment variables

@app.get('/api/data-products')
def get_data_products():
    try:
        products = db_service.get_products()
        logging.info(f"Retrieved {len(products)} products from {'database' if db_service.use_database else 'JSON'}")
        return products
    except Exception as e:
        logging.error(f"Error retrieving data products: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving data products")

@app.put('/api/data-products')
async def update_data_products(request: Request):
    try:
        data = await request.json()
        # Validate input structure
        if not isinstance(data, list):
            raise HTTPException(status_code=400, detail="Expected array of products")
        
        # Basic validation of each product
        for product in data:
            if not isinstance(product, dict) or 'id' not in product:
                raise HTTPException(status_code=400, detail="Each product must have an 'id' field")
        
        success = db_service.update_products(data)
        if success:
            logging.info(f"Updated {len(data)} products in {'database' if db_service.use_database else 'JSON'}")
            return {"status": "success"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update data products")
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=f"Validation error: {e}")
    except Exception as e:
        logging.error(f"Error updating data products: {e}")
        raise HTTPException(status_code=500, detail="Error updating data products")

# Health check endpoint
@app.get('/health')
def health_check():
    return {"status": "healthy"}

# Database status endpoint
@app.get('/api/database-status')
def database_status():
    return {
        "using_database": db_service.use_database,
        "storage_type": "PostgreSQL (Lakebase)" if db_service.use_database else "JSON File",
        "environment_variables": {
            "PGHOST": os.environ.get("PGHOST", "Not set"),
            "PGDATABASE": os.environ.get("PGDATABASE", "Not set"),
            "PGUSER": os.environ.get("PGUSER", "Not set")
        }
    }

# serve React build from /static
app.mount("/", StaticFiles(directory="static", html=True), name="site")

# Required for Databricks Apps: bind to 0.0.0.0 and use DATABRICKS_APP_PORT
if __name__ == "__main__":
    port = int(os.environ.get("DATABRICKS_APP_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
