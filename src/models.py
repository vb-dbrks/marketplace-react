from sqlalchemy import create_engine, Column, String, Text, DateTime, Integer, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import os
import sys
import logging

# Set up logger
logger = logging.getLogger(__name__)

Base = declarative_base()

class DataProduct(Base):
    __tablename__ = "data_products"
    __table_args__ = {"schema": "public"}

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    purpose = Column(Text)
    type = Column(String(100))
    domain = Column(String(100))
    region = Column(String(100))
    owner = Column(String(255))
    certified = Column(String(50))
    classification = Column(String(100))
    gxp = Column(String(50))
    interval_of_change = Column(String(100))
    last_updated_date = Column(String(50))  # Keep as string for now
    first_publish_date = Column(String(50))
    next_reassessment_date = Column(String(50))
    security_considerations = Column(Text)
    sub_domain = Column(String(255))
    databricks_url = Column(Text)
    tableau_url = Column(Text, default="")
    qlik_url = Column(Text, default="")
    data_contract_url = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationship to tags
    tags = relationship("DataProductTag", back_populates="product", cascade="all, delete-orphan")

class DataProductTag(Base):
    __tablename__ = "data_product_tags"
    __table_args__ = {"schema": "public"}
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(String(50), ForeignKey('public.data_products.id'), nullable=False)
    tag = Column(String(100), nullable=False)
    
    # Relationship back to product
    product = relationship("DataProduct", back_populates="tags")

# Database connection setup
def get_engine():
    """Get SQLAlchemy engine using Databricks SDK for OAuth token authentication"""
    try:
        from sqlalchemy import create_engine, event
        from databricks.sdk import WorkspaceClient
        from databricks.sdk.core import Config

        # Get environment variables (set by Databricks Apps)
        host = os.environ.get('PGHOST')
        user = os.environ.get('PGUSER')
        database = os.environ.get('PGDATABASE')
        port = os.environ.get('PGPORT', '5432')
        sslmode = os.environ.get('PGSSLMODE', 'require')

        if not all([host, user, database]):
            raise Exception("Database connection details missing: PGHOST, PGUSER, PGDATABASE must be set by Databricks Apps")

        logger.info(f"Using Databricks SDK for OAuth token authentication")
        logger.info(f"Host: {host}")
        logger.info(f"Database: {database}")
        logger.info(f"User: {user}")
        logger.info(f"Port: {port}")
        logger.info(f"SSL Mode: {sslmode}")

        # Create Databricks workspace client
        app_config = Config()
        workspace_client = WorkspaceClient()

        # Create PostgreSQL connection URL without password (will be provided via event listener)
        postgres_username = app_config.client_id
        connection_url = f"postgresql+psycopg2://{postgres_username}:@{host}:{port}/{database}?sslmode={sslmode}"

        logger.info(f"Creating PostgreSQL engine with OAuth token authentication")
        postgres_pool = create_engine(connection_url, echo=False)

        # Add event listener to provide OAuth token as password
        @event.listens_for(postgres_pool, "do_connect")
        def provide_token(dialect, conn_rec, cargs, cparams):
            try:
                logger.info("Getting OAuth token from Databricks SDK...")
                token = workspace_client.config.oauth_token().access_token
                cparams["password"] = token
                logger.info("OAuth token set as password successfully")
            except Exception as e:
                logger.error(f"Failed to get OAuth token: {e}")
                raise

        return postgres_pool

    except Exception as e:
        logger.error(f"ERROR: Failed to create database engine: {e}")
        raise

def get_session():
    """Get database session using App Authorization"""
    try:
        engine = get_engine()
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.info("Creating database session...")
        return SessionLocal()
    except Exception as e:
        logger.error(f"ERROR: Failed to create database session: {e}")
        raise

def create_tables():
    """Create database tables using App Authorization"""
    try:
        engine = get_engine()
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("INFO: Database tables created successfully")
    except Exception as e:
        logger.error(f"ERROR: Failed to create database tables: {e}")
        raise
