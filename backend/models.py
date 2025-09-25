from sqlalchemy import create_engine, Column, String, Text, DateTime, Integer, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import os

Base = declarative_base()

class DataProduct(Base):
    __tablename__ = "data_products"
    
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
    business_function = Column(String(255))
    databricks_url = Column(Text)
    tableau_url = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationship to tags
    tags = relationship("DataProductTag", back_populates="product", cascade="all, delete-orphan")

class DataProductTag(Base):
    __tablename__ = "data_product_tags"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(String(50), ForeignKey('data_products.id'), nullable=False)
    tag = Column(String(100), nullable=False)
    
    # Relationship back to product
    product = relationship("DataProduct", back_populates="tags")
    
    # Unique constraint
    __table_args__ = (
        {"extend_existing": True}
    )

# Database connection setup
def get_database_url():
    """Get database URL from environment variables provided by Lakebase"""
    if os.environ.get("PGHOST"):
        # Production: Use Lakebase environment variables
        # Note: PGPASSWORD might not be set in Databricks Apps environment
        # as they use service principal authentication
        password = os.environ.get('PGPASSWORD', '')
        user = os.environ.get('PGUSER', '')
        host = os.environ.get('PGHOST', '')
        port = os.environ.get('PGPORT', '5432')
        database = os.environ.get('PGDATABASE', '')
        sslmode = os.environ.get('PGSSLMODE', 'require')
        
        if password:
            return f"postgresql://{user}:{password}@{host}:{port}/{database}?sslmode={sslmode}"
        else:
            # For Databricks Apps, password might be empty or use service principal
            return f"postgresql://{user}@{host}:{port}/{database}?sslmode={sslmode}"
    else:
        # Development: Use local PostgreSQL or fallback to JSON
        return None

def get_engine():
    """Get SQLAlchemy engine"""
    database_url = get_database_url()
    if database_url:
        return create_engine(database_url, echo=False)
    return None

def get_session():
    """Get database session"""
    engine = get_engine()
    if engine:
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        return SessionLocal()
    return None

def create_tables():
    """Create database tables"""
    engine = get_engine()
    if engine:
        Base.metadata.create_all(bind=engine)
        return True
    return False
