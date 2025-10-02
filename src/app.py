from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
import os, json, logging, signal, sys
from typing import List, Dict, Any
import uvicorn
try:
    from database import db_service
except Exception as e:
    print(f"❌ Failed to initialize database service: {e}")
    print("💡 To fix this issue:")
    if "Missing required environment variables" in str(e):
        print("   1. Set all required environment variables:")
        print("      PGHOST, PGUSER, PGDATABASE, PGPORT, PGSSLMODE, PGPASSWORD")
        print("   2. Or remove all PG* environment variables to use JSON storage")
    elif "Invalid or expired Databricks token" in str(e):
        print("   1. Get a fresh Databricks token from your Databricks workspace")
        print("   2. Set the PGPASSWORD environment variable with the new token")
        print("   3. Restart the application")
    else:
        print("   1. Check your database configuration")
        print("   2. Verify all environment variables are set correctly")
        print("   3. Or remove all PG* environment variables to use JSON storage")
    sys.exit(1)

# Configure logging to stdout/stderr as required by Databricks Apps
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

app = FastAPI(
    title="Astellas Data Marketplace API",
    description="API for managing data products in the Astellas Data Marketplace",
    version="1.0.0",
    docs_url=None,  # Disable automatic docs
    redoc_url=None  # Disable automatic redoc
)

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
    sub_domain: str
    databricks_url: str
    tableau_url: str = ""
    qlik_url: str = ""
    data_contract_url: str = ""
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
        logging.info(f"PUT /api/data-products called from {request.client.host if request.client else 'unknown'}")
        
        # Get and log raw request for debugging
        body = await request.body()
        logging.info(f"Raw request body length: {len(body)} bytes")
        
        try:
            data = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError as e:
            logging.error(f"JSON decode error: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid JSON: {e}")
        
        logging.info(f"Received data: {len(data) if isinstance(data, list) else 'not a list'} products")
        
        # Log first product for debugging
        if isinstance(data, list) and len(data) > 0:
            logging.info(f"First product sample: {json.dumps(data[0], indent=2)}")
        
        # Validate input structure
        if not isinstance(data, list):
            logging.error(f"Invalid data type: expected list, got {type(data)}")
            raise HTTPException(status_code=400, detail="Expected array of products")
        
        # Basic validation of each product - ID is optional (will be auto-generated)
        for i, product in enumerate(data):
            if not isinstance(product, dict):
                logging.error(f"Invalid product at index {i}: not a dict - {type(product)}")
                raise HTTPException(status_code=400, detail=f"Product at index {i} must be an object")
            
            # Check for required fields
            if 'name' not in product or not product['name']:
                logging.error(f"Missing required field 'name' in product at index {i}")
                raise HTTPException(status_code=400, detail=f"Product at index {i} missing required field: name")
        
        logging.info("Starting database update...")
        success = db_service.update_products(data)
        
        if success:
            logging.info(f"✅ Successfully updated {len(data)} products in database")
            return {"status": "success", "message": f"Updated {len(data)} products"}
        else:
            logging.error("❌ Database update returned False")
            raise HTTPException(status_code=500, detail="Failed to update products in database")
            
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValidationError as e:
        logging.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=f"Validation error: {e}")
    except Exception as e:
        logging.error(f"❌ Unexpected error in update_data_products: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Health check endpoint
@app.get('/health')
def health_check():
    return {"status": "healthy"}

@app.get('/docs')
def api_documentation():
    """Custom API documentation endpoint"""
    return {
        "title": "Astellas Data Marketplace API",
        "version": "1.0.0",
        "description": "API for managing data products in the Astellas Data Marketplace",
        "endpoints": {
            "GET /api/data-products": {
                "description": "Retrieve all data products",
                "returns": "Array of data product objects"
            },
            "PUT /api/data-products": {
                "description": "Update all data products (replaces existing data)",
                "accepts": "Array of data product objects",
                "returns": "Success status"
            },
            "GET /health": {
                "description": "Health check endpoint",
                "returns": "Service health status"
            },
            "GET /api/database-status": {
                "description": "Database connection status",
                "returns": "Database connectivity information"
            },
            "GET /api/lakebase-status": {
                "description": "Lakebase authentication status",
                "returns": "Authentication status and configuration"
            }
        },
        "data_product_schema": {
            "id": "string (auto-generated if not provided, format: DPXXXX)",
            "name": "string (required)",
            "description": "string",
            "purpose": "string",
            "type": "string",
            "domain": "string",
            "region": "string",
            "owner": "string",
            "certified": "string",
            "classification": "string",
            "gxp": "string",
            "interval_of_change": "string",
            "last_updated_date": "string (YYYY-MM-DD)",
            "first_publish_date": "string (YYYY-MM-DD)",
            "next_reassessment_date": "string (YYYY-MM-DD)",
            "security_considerations": "string",
            "sub_domain": "string",
            "databricks_url": "string",
            "tableau_url": "string",
            "qlik_url": "string",
            "data_contract_url": "string",
            "tags": "array of strings"
        }
    }

@app.get('/api/test')
def test_endpoint():
    logging.info("Test endpoint called")
    return {"status": "success", "message": "API routing is working"}

@app.put('/api/test')
def test_put_endpoint():
    logging.info("Test PUT endpoint called")
    return {"status": "success", "message": "PUT routing is working"}

# Database status endpoint
@app.get('/api/database-status')
def database_status():
    return {
        "using_database": db_service.use_database,
        "storage_type": "PostgreSQL (Lakebase)",
        "authentication_type": "Lakebase Database",
        "lakebase_configured": bool(os.environ.get("PGHOST") and os.environ.get("PGUSER") and os.environ.get("PGDATABASE") and os.environ.get("DATABRICKS_CLIENT_ID")),
        "environment_variables": {
            "PGHOST": os.environ.get("PGHOST", "Not set"),
            "PGDATABASE": os.environ.get("PGDATABASE", "Not set"),
            "PGUSER": os.environ.get("PGUSER", "Not set"),
            "DATABRICKS_CLIENT_ID": "SET" if os.environ.get("DATABRICKS_CLIENT_ID") else "Not set",
            "DATABRICKS_CLIENT_SECRET": "SET" if os.environ.get("DATABRICKS_CLIENT_SECRET") else "Not set",
            "PGPORT": os.environ.get("PGPORT", "Not set"),
            "PGSSLMODE": os.environ.get("PGSSLMODE", "Not set")
        }
    }

# Lakebase Database status endpoint
@app.get('/api/lakebase-status')
def lakebase_status():
    """Get Lakebase database status and configuration"""
    pghost = os.environ.get("PGHOST", "")
    pguser = os.environ.get("PGUSER", "")
    pgdatabase = os.environ.get("PGDATABASE", "")
    pgport = os.environ.get("PGPORT", "")
    pgsslmode = os.environ.get("PGSSLMODE", "")
    client_id = os.environ.get("DATABRICKS_CLIENT_ID", "")
    client_secret = os.environ.get("DATABRICKS_CLIENT_SECRET", "")
    
    has_database_config = bool(pghost and pguser and pgdatabase and client_id and client_secret)
    
    return {
        "lakebase_configured": has_database_config,
        "database_available": bool(pghost),
        "authentication_ready": bool(client_id and client_secret),
        "authorization_type": "Lakebase Database (PostgreSQL)",
        "status": {
            "setup_steps": [
                "1. Lakebase database is automatically configured by Databricks Apps",
                "2. Database connection details (PGHOST, PGUSER, PGDATABASE) are set by Databricks Apps",
                "3. DATABRICKS_CLIENT_ID and DATABRICKS_CLIENT_SECRET are used for OAuth token authentication",
                "4. App connects directly to PostgreSQL using psycopg2",
                "5. No additional authentication steps required",
                "6. Database permissions are managed through Databricks workspace"
            ],
            "environment_variables": {
                "PGHOST": "Lakebase database host (set by Databricks Apps)",
                "PGUSER": "Lakebase database user (set by Databricks Apps)",
                "PGDATABASE": "Lakebase database name (set by Databricks Apps)",
                "DATABRICKS_CLIENT_ID": "OAuth client ID (set by Databricks Apps)",
                "DATABRICKS_CLIENT_SECRET": "OAuth client secret (set by Databricks Apps)",
                "PGPORT": "Lakebase database port (set by Databricks Apps)",
                "PGSSLMODE": "SSL mode (set by Databricks Apps)"
            },
            "current_status": {
                "database_host_available": bool(pghost),
                "database_user_available": bool(pguser),
                "database_name_available": bool(pgdatabase),
                "oauth_credentials_available": bool(client_id and client_secret),
                "ready_for_database_access": has_database_config
            }
        }
    }

# serve React build from /static
# Try multiple possible paths for the frontend static directory
frontend_paths = [
    "./static",  # Asset Bundle structure (deployed)
    "./dist",  # Legacy structure (local dev)
    "../frontend/dist",  # Relative to src directory (local dev)
]

frontend_path = None
for path in frontend_paths:
    if os.path.exists(path):
        frontend_path = path
        break

if frontend_path:
    print(f"Found frontend at: {frontend_path}")
    print(f"Frontend directory contents: {os.listdir(frontend_path)}")
    try:
        # Mount static assets
        app.mount("/assets", StaticFiles(directory=f"{frontend_path}/assets"), name="assets")
        app.mount("/vite.svg", StaticFiles(directory=frontend_path), name="vite-svg")
        
        # Add catch-all route for React Router
        @app.get("/{full_path:path}")
        def serve_react_app(full_path: str):
            """Serve React app for all non-API routes"""
            # Skip API routes
            if full_path.startswith("api/"):
                raise HTTPException(status_code=404, detail="API endpoint not found")
            
            # For all other routes, serve the React app index.html
            try:
                with open(f"{frontend_path}/index.html", "r") as f:
                    content = f.read()
                return Response(content=content, media_type="text/html")
            except FileNotFoundError:
                raise HTTPException(status_code=404, detail="Frontend not found")
        
        print(f"Successfully mounted frontend from {frontend_path}")
    except Exception as e:
        print(f"Failed to mount frontend: {e}")
        # Fall back to API-only mode
        @app.get("/")
        def root_fallback():
            return {
                "message": "Astellas Data Marketplace API",
                "status": "running",
                "endpoints": {
                    "data_products": "/api/data-products",
                    "lakebase_status": "/api/lakebase-status",
                    "database_status": "/api/database-status",
                    "health": "/health"
                },
                "note": f"Frontend mount failed: {e}"
            }
else:
    print("Frontend not found. Available directories:")
    print("Current directory:", os.getcwd())
    print("Directory contents:", os.listdir("."))
    if os.path.exists(".."):
        print("Parent directory contents:", os.listdir(".."))
    
    # Add a fallback route for the root path
    @app.get("/")
    def root_fallback():
        return {
            "message": "Astellas Data Marketplace API",
            "status": "running",
            "endpoints": {
                "data_products": "/api/data-products",
                "lakebase_status": "/api/lakebase-status",
                "database_status": "/api/database-status",
                "health": "/health"
            },
            "note": "Frontend not found. Please check deployment configuration."
        }

# Required for Databricks Apps: bind to 0.0.0.0 and use DATABRICKS_APP_PORT
if __name__ == "__main__":
    port = int(os.environ.get("DATABRICKS_APP_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
