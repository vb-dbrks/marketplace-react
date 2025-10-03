from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError
import os, json, logging, signal, sys
from typing import List, Dict, Any, Optional
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
    version="1.0.0"
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

# Pydantic models for API documentation and validation
class DataProductInput(BaseModel):
    """Model for input data (ID is optional and will be auto-generated)"""
    id: Optional[str] = None  # Optional for input, will be auto-generated if not provided
    name: str
    description: Optional[str] = ""
    purpose: Optional[str] = ""
    type: Optional[str] = ""
    domain: Optional[str] = ""
    region: Optional[str] = ""
    owner: Optional[str] = ""
    certified: Optional[str] = ""
    classification: Optional[str] = ""
    gxp: Optional[str] = ""
    interval_of_change: Optional[str] = ""
    last_updated_date: Optional[str] = ""
    first_publish_date: Optional[str] = ""
    next_reassessment_date: Optional[str] = ""
    security_considerations: Optional[str] = ""
    sub_domain: Optional[str] = ""
    databricks_url: Optional[str] = ""
    tableau_url: Optional[str] = ""
    qlik_url: Optional[str] = ""
    data_contract_url: Optional[str] = ""
    tags: List[str] = []

class DataProduct(BaseModel):
    """Model for output data (ID is always present)"""
    id: str
    name: str
    description: Optional[str] = ""
    purpose: Optional[str] = ""
    type: Optional[str] = ""
    domain: Optional[str] = ""
    region: Optional[str] = ""
    owner: Optional[str] = ""
    certified: Optional[str] = ""
    classification: Optional[str] = ""
    gxp: Optional[str] = ""
    interval_of_change: Optional[str] = ""
    last_updated_date: Optional[str] = ""
    first_publish_date: Optional[str] = ""
    next_reassessment_date: Optional[str] = ""
    security_considerations: Optional[str] = ""
    sub_domain: Optional[str] = ""
    databricks_url: Optional[str] = ""
    tableau_url: Optional[str] = ""
    qlik_url: Optional[str] = ""
    data_contract_url: Optional[str] = ""
    tags: List[str] = []

class UpdateResponse(BaseModel):
    status: str
    message: str

class HealthResponse(BaseModel):
    status: str

class ErrorResponse(BaseModel):
    error: str

class UserInfo(BaseModel):
    username: str
    is_admin: bool
    groups: List[str]

# Group membership checking
ADMIN_GROUP = "marketplace_app_admins"  # Configure this to match your organization's admin group

def get_current_user_info(request: Request = None) -> UserInfo:
    """Get current user information from Databricks context"""
    try:
        from databricks.sdk import WorkspaceClient
        import requests
        
        # Get the current user from Databricks context
        workspace_client = WorkspaceClient()
        current_user = workspace_client.current_user.me()
        username = current_user.user_name
        
        # Extract email from gap-auth header if available
        user_email = None
        if request and hasattr(request, 'headers'):
            user_email = request.headers.get('gap-auth')
            if user_email:
                logging.info(f"Found user email in gap-auth header: {user_email}")
        
        logging.info(f"Current user: {username}, email: {user_email}")
        
        # Check if user has workspace admin role
        is_admin = False
        user_roles = []
        
        try:
            # Method 1: Check workspace permissions using user's forwarded token
            user_access_token = None
            if request and hasattr(request, 'headers'):
                user_access_token = request.headers.get('x-forwarded-access-token')
                logging.info("Found user access token in forwarded headers")
            
            if user_access_token:
                workspace_host = workspace_client.config.host
                logging.info(f"Workspace host: {workspace_host}")
                
                # Check workspace permissions using the user's token
                try:
                    # Use workspace permissions API to check if user is admin
                    permissions_url = f"{workspace_host}/api/2.0/permissions/authorization/workspace"
                    headers = {
                        'Authorization': f'Bearer {user_access_token}',
                        'Content-Type': 'application/json'
                    }
                    
                    logging.info("Checking workspace permissions...")
                    response = requests.get(permissions_url, headers=headers)
                    
                    if response.status_code == 200:
                        permissions_data = response.json()
                        logging.info(f"Workspace permissions response: {permissions_data}")
                        
                        # Check if user has admin permissions
                        if permissions_data.get('is_admin', False):
                            is_admin = True
                            user_roles.append('workspace_admin')
                            logging.info("User has workspace admin permissions")
                        else:
                            logging.info("User does not have workspace admin permissions")
                    else:
                        logging.warning(f"Workspace permissions API call failed: {response.status_code} - {response.text}")
                        
                except Exception as permissions_error:
                    logging.warning(f"Could not check workspace permissions via API: {permissions_error}")
            
            # Method 2: Fallback - Check using SDK workspace client
            if not is_admin:
                logging.info("Trying SDK-based workspace admin check...")
                try:
                    # Try to list workspace users - only admins can do this
                    users_list = list(workspace_client.users.list())
                    if users_list is not None:
                        is_admin = True
                        user_roles.append('workspace_admin')
                        logging.info("User can list workspace users - has admin permissions")
                except Exception as sdk_error:
                    logging.info(f"User cannot list workspace users - not admin: {sdk_error}")
            
            # Method 3: Check workspace groups for admin-like groups
            if not is_admin:
                logging.info("Checking workspace groups for admin roles...")
                try:
                    all_groups = list(workspace_client.groups.list())
                    logging.info(f"Found {len(all_groups)} workspace groups")
                    
                    # Look for admin-related groups
                    admin_group_names = ['admins', 'admin', 'workspace_admins', 'administrators', ADMIN_GROUP.lower()]
                    
                    for group in all_groups:
                        group_name = getattr(group, 'display_name', '').lower()
                        if any(admin_name in group_name for admin_name in admin_group_names):
                            try:
                                members = list(workspace_client.groups.list_members(group.id))
                                for member in members:
                                    member_name = None
                                    if hasattr(member, 'user_name'):
                                        member_name = member.user_name
                                    elif hasattr(member, 'display_name'):
                                        member_name = member.display_name
                                    
                                    if member_name == username:
                                        is_admin = True
                                        user_roles.append(f'group_member:{group_name}')
                                        logging.info(f"Found membership in admin group: {group_name}")
                                        break
                                        
                                if is_admin:
                                    break
                            except Exception as member_error:
                                logging.debug(f"Could not check membership for group {group.id}: {member_error}")
                                continue
                                
                except Exception as groups_error:
                    logging.warning(f"Could not check workspace groups: {groups_error}")
            
            # Method 4: Environment variable override for specific users
            import os
            admin_users_env = os.getenv('MARKETPLACE_ADMIN_USERS', '')
            if admin_users_env and not is_admin:
                admin_users = [user.strip() for user in admin_users_env.split(',')]
                
                # Check against multiple user identifiers
                user_identifiers = [username]  # UUID username
                if user_email:
                    user_identifiers.append(user_email)  # Email from gap-auth header
                if hasattr(current_user, 'display_name') and current_user.display_name:
                    user_identifiers.append(current_user.display_name)  # Display name from user object
                
                # Check if any of the user identifiers match the admin list
                for identifier in user_identifiers:
                    if identifier in admin_users:
                        is_admin = True
                        user_roles.append(f'env_override:{identifier}')
                        logging.info(f"User granted admin access via MARKETPLACE_ADMIN_USERS (matched: {identifier})")
                        break
            
            logging.info(f"Final result - User {username}, roles: {user_roles}, is_admin: {is_admin}")
            
            return UserInfo(
                username=user_email if user_email else username,  # Prefer email over UUID
                is_admin=is_admin,
                groups=user_roles  # Using roles instead of groups for clarity
            )
            
        except Exception as role_error:
            logging.error(f"Error checking user roles for {username}: {role_error}")
            logging.error(f"Role error type: {type(role_error).__name__}")
            
            # For development/testing - you can temporarily override this
            # TEMPORARY: Uncomment the next 3 lines if you want to test as admin
            # return UserInfo(
            #     username=username,
            #     is_admin=True,  # TEMPORARY OVERRIDE
            #     groups=['temporary_override']
            # )
            
            return UserInfo(
                username=username,
                is_admin=False,
                groups=[]
            )
            
    except Exception as e:
        logging.error(f"Could not get current user info: {e}")
        logging.error(f"Error type: {type(e).__name__}")
        # Return a default user for development/testing
        return UserInfo(
            username="unknown",
            is_admin=False,
            groups=[]
        )

def require_admin_access(request: Request):
    """Dependency to require admin access"""
    user_info = get_current_user_info(request)
    if not user_info.is_admin:
        raise HTTPException(
            status_code=403, 
            detail=f"Access denied. Admin access required. User must be member of '{ADMIN_GROUP}' group."
        )
    return user_info

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

@app.get('/api/data-products', 
         response_model=List[DataProduct],
         summary="Get all data products",
         description="Retrieve all data products from the database",
         responses={
             200: {"description": "List of data products"},
             500: {"model": ErrorResponse, "description": "Database error"}
         })
def get_data_products():
    """
    Retrieve all data products from the database.
    
    Returns:
        List[DataProduct]: Array of data product objects
    """
    try:
        products = db_service.get_products()
        logging.info(f"Retrieved {len(products)} products from database")
        return products
    except Exception as e:
        logging.error(f"Error retrieving data products from database: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.put('/api/data-products',
         response_model=UpdateResponse,
         summary="Update all data products",
         description="Replace all data products in the database with the provided list (Admin only)",
         responses={
             200: {"model": UpdateResponse, "description": "Products updated successfully"},
             400: {"model": ErrorResponse, "description": "Invalid input data"},
             403: {"model": ErrorResponse, "description": "Admin access required"},
             500: {"model": ErrorResponse, "description": "Database error"}
         })
async def update_data_products(request: Request, products: List[DataProductInput], admin_user: UserInfo = Depends(require_admin_access)):
    """
    Replace all data products in the database with the provided list.
    
    Args:
        products: List of data product objects to store
        
    Returns:
        UpdateResponse: Success status and message
    """
    try:
        logging.info(f"PUT /api/data-products called with {len(products)} products")
        
        # Convert Pydantic models to dict for database service
        data = [product.dict() for product in products]
        
        # Log first product for debugging
        if len(data) > 0:
            logging.info(f"First product sample: {json.dumps(data[0], indent=2)}")
        
        # Log products without IDs (potential issue)
        products_without_ids = [p for p in data if not p.get('id') or p.get('id').strip() == '']
        if products_without_ids:
            logging.warning(f"Found {len(products_without_ids)} products without IDs - these will get auto-generated IDs")
            for i, p in enumerate(products_without_ids):
                logging.warning(f"Product without ID #{i+1}: {p.get('name', 'Unknown')}")
        
        logging.info("Starting database update...")
        try:
            success = db_service.update_products(data)
            
            if success:
                logging.info(f"✅ Successfully updated {len(data)} products in database")
                # Verify the products were actually saved
                saved_products = db_service.get_products()
                logging.info(f"✅ Verification: {len(saved_products)} products now in database")
                return {"status": "success", "message": f"Updated {len(data)} products"}
            else:
                logging.error("❌ Database update returned False - check database logs for details")
                raise HTTPException(status_code=500, detail="Failed to update products in database - check server logs for details")
        except Exception as db_error:
            logging.error(f"❌ Database service threw exception: {db_error}")
            logging.error(f"Exception type: {type(db_error).__name__}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
            
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValidationError as e:
        logging.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=f"Validation error: {e}")
    except Exception as e:
        logging.error(f"❌ Unexpected error in update_data_products: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get('/api/user-info',
         response_model=UserInfo,
         summary="Get current user information",
         description="Get current user's information including admin status")
def get_user_info(request: Request):
    """Get current user information including group memberships and admin status"""
    return get_current_user_info(request)

@app.get('/api/debug-roles',
         summary="Debug user roles and permissions",
         description="Debug endpoint to troubleshoot workspace role and permission issues")
def debug_roles(request: Request):
    """Debug endpoint to help troubleshoot user roles and permissions"""
    try:
        from databricks.sdk import WorkspaceClient
        import requests
        import os
        
        workspace_client = WorkspaceClient()
        current_user = workspace_client.current_user.me()
        username = current_user.user_name
        
        # Extract email from gap-auth header if available
        user_email = None
        if request and hasattr(request, 'headers'):
            user_email = request.headers.get('gap-auth')
        
        debug_info = {
            "current_user": username,
            "user_email": user_email,
            "preferred_display": user_email if user_email else username,
            "display_name": getattr(current_user, 'display_name', 'N/A'),
            "user_object_attributes": [attr for attr in dir(current_user) if not attr.startswith('_')],
            "admin_checks": [],
            "workspace_groups": [],
            "environment_config": {},
            "errors": []
        }
        
        # Check environment variables
        admin_users_env = os.getenv('MARKETPLACE_ADMIN_USERS', '')
        debug_info["environment_config"] = {
            "MARKETPLACE_ADMIN_USERS": admin_users_env,
            "admin_users_list": [user.strip() for user in admin_users_env.split(',')] if admin_users_env else []
        }
        
        # Check if user access token is available
        user_access_token = None
        if request and hasattr(request, 'headers'):
            user_access_token = request.headers.get('x-forwarded-access-token')
            debug_info["has_user_token"] = bool(user_access_token)
        
        # Admin Check 1: Workspace permissions API
        if user_access_token:
            try:
                workspace_host = workspace_client.config.host
                permissions_url = f"{workspace_host}/api/2.0/permissions/authorization/workspace"
                headers = {
                    'Authorization': f'Bearer {user_access_token}',
                    'Content-Type': 'application/json'
                }
                
                response = requests.get(permissions_url, headers=headers)
                debug_info["admin_checks"].append({
                    "method": "workspace_permissions_api",
                    "status_code": response.status_code,
                    "response": response.json() if response.status_code == 200 else response.text,
                    "is_admin": response.json().get('is_admin', False) if response.status_code == 200 else False
                })
            except Exception as api_error:
                debug_info["admin_checks"].append({
                    "method": "workspace_permissions_api",
                    "error": str(api_error)
                })
        
        # Admin Check 2: SDK user listing (admin-only operation)
        try:
            users_list = list(workspace_client.users.list())
            debug_info["admin_checks"].append({
                "method": "sdk_users_list",
                "can_list_users": True,
                "users_count": len(users_list),
                "is_admin": True
            })
        except Exception as sdk_error:
            debug_info["admin_checks"].append({
                "method": "sdk_users_list",
                "can_list_users": False,
                "error": str(sdk_error),
                "is_admin": False
            })
        
        # Admin Check 3: Workspace groups
        try:
            all_groups = list(workspace_client.groups.list())
            debug_info["workspace_groups_count"] = len(all_groups)
            
            admin_group_names = ['admins', 'admin', 'workspace_admins', 'administrators', ADMIN_GROUP.lower()]
            
            for group in all_groups:
                group_name = getattr(group, 'display_name', '')
                group_info = {
                    "id": group.id,
                    "display_name": group_name,
                    "is_admin_group": any(admin_name in group_name.lower() for admin_name in admin_group_names)
                }
                
                if group_info["is_admin_group"]:
                    try:
                        members = list(workspace_client.groups.list_members(group.id))
                        group_info["members"] = []
                        group_info["user_is_member"] = False
                        
                        for member in members:
                            member_name = getattr(member, 'user_name', getattr(member, 'display_name', 'N/A'))
                            group_info["members"].append(member_name)
                            if member_name == username:
                                group_info["user_is_member"] = True
                                
                    except Exception as member_error:
                        group_info["member_check_error"] = str(member_error)
                
                debug_info["workspace_groups"].append(group_info)
                
        except Exception as groups_error:
            debug_info["errors"].append(f"Could not list workspace groups: {groups_error}")
        
        # Admin Check 4: Environment variable override
        if admin_users_env:
            admin_users = [user.strip() for user in admin_users_env.split(',')]
            
            # Check against multiple user identifiers
            user_identifiers = [username]  # UUID username
            if user_email:
                user_identifiers.append(user_email)  # Email from gap-auth header
            if hasattr(current_user, 'display_name') and current_user.display_name:
                user_identifiers.append(current_user.display_name)  # Display name from user object
            
            matches = []
            for identifier in user_identifiers:
                if identifier in admin_users:
                    matches.append(identifier)
            
            debug_info["admin_checks"].append({
                "method": "environment_variable",
                "admin_users_configured": admin_users,
                "user_identifiers": user_identifiers,
                "matches": matches,
                "is_admin": len(matches) > 0
            })
        
        return debug_info
        
    except Exception as e:
        return {"error": f"Debug failed: {e}", "error_type": type(e).__name__}

@app.post('/api/data-products',
          response_model=UpdateResponse,
          summary="Add a new data product",
          description="Add a single new data product to the database (Admin only)",
          responses={
              200: {"model": UpdateResponse, "description": "Product added successfully"},
              400: {"model": ErrorResponse, "description": "Invalid input data"},
              403: {"model": ErrorResponse, "description": "Admin access required"},
              500: {"model": ErrorResponse, "description": "Database error"}
          })
async def add_data_product(request: Request, product: DataProductInput, admin_user: UserInfo = Depends(require_admin_access)):
    """
    Add a single new data product to the database.
    
    Args:
        product: Data product object to add
        
    Returns:
        UpdateResponse: Success status and message
    """
    try:
        logging.info(f"POST /api/data-products called - adding new product: {product.name}")
        
        # Get existing products
        existing_products = db_service.get_products()
        logging.info(f"Found {len(existing_products)} existing products")
        
        # Convert new product to dict
        new_product_data = product.dict()
        logging.info(f"New product data: {json.dumps(new_product_data, indent=2)}")
        
        # Add new product to existing list
        all_products = existing_products + [new_product_data]
        
        # Update database with all products
        success = db_service.update_products(all_products)
        
        if success:
            # Verify the products were actually saved
            saved_products = db_service.get_products()
            logging.info(f"✅ Successfully added product. Total products now: {len(saved_products)}")
            return {"status": "success", "message": f"Added product '{product.name}'. Total products: {len(saved_products)}"}
        else:
            logging.error("❌ Database update returned False")
            raise HTTPException(status_code=500, detail="Failed to add product to database")
            
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValidationError as e:
        logging.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=f"Validation error: {e}")
    except Exception as e:
        logging.error(f"❌ Unexpected error in add_data_product: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Health check endpoint
@app.get('/health',
         response_model=HealthResponse,
         summary="Health check",
         description="Check if the API service is running")
def health_check():
    """
    Health check endpoint to verify the API service is running.
    
    Returns:
        HealthResponse: Service health status
    """
    return {"status": "healthy"}

@app.get('/api/docs')
def api_documentation():
    """Custom API documentation endpoint (JSON format)"""
    return {
        "title": "Astellas Data Marketplace API",
        "version": "1.0.0",
        "description": "API for managing data products in the Astellas Data Marketplace",
        "swagger_ui": "/docs",
        "redoc_ui": "/redoc",
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
