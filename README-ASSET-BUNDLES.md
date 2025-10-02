# Astellas Data Marketplace - Databricks Asset Bundles

This repository has been restructured to work with [Databricks Asset Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/resources#apps), providing a modern, scalable deployment approach for the Astellas Data Marketplace application.

## 🏗️ Architecture Overview

The application is deployed as a Databricks Asset Bundle that includes:

- **Web Application**: FastAPI + React frontend served as a Databricks App
- **Database Resources**: Lakebase database instance and Unity Catalog integration
- **Environment Management**: Separate configurations for development and production

## 📁 Repository Structure

```
marketplace-react/
├── databricks.yml              # Main bundle configuration
├── src/                        # Application source code
│   ├── app.py                  # FastAPI backend
│   ├── app.yaml                # App runtime configuration
│   ├── models.py               # Database models
│   ├── database.py             # Database service layer
│   ├── requirements.txt        # Python dependencies
│   └── static/                 # Built frontend files (auto-generated)
├── resources/                  # Bundle resources
│   └── database/
│       └── schema.sql          # Database schema definitions
├── environments/               # Environment-specific configs
│   ├── development.yml         # Development settings
│   └── production.yml          # Production settings
├── frontend/                   # React frontend source
│   └── src/                    # Frontend source code
├── deploy-bundle.sh            # Unix deployment script
├── deploy-bundle.ps1           # Windows deployment script
└── README-ASSET-BUNDLES.md     # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Databricks CLI**: Install and authenticate
   ```bash
   pip install databricks-cli
   databricks auth login
   ```

2. **Node.js**: For building the frontend
   ```bash
   npm install -g npm@latest
   ```

### Deployment

#### Option 1: Using the deployment script (Recommended)

**Linux/macOS:**
```bash
./deploy-bundle.sh development
```

**Windows:**
```powershell
.\deploy-bundle.ps1 -Environment development
```

#### Option 2: Manual deployment

1. **Build the frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

2. **Copy frontend to app source:**
   ```bash
   cp -r frontend/dist src/static
   ```

3. **Deploy the bundle:**
   ```bash
   databricks bundle validate --environment development
   databricks bundle deploy --environment development
   ```

## 🔧 Configuration

### Environment Variables

The bundle automatically configures the following environment variables:

- `DATABRICKS_APP_PORT`: Port for the web application (8000)
- `DATABASE_RESOURCE_NAME`: Reference to the database resource
- Database connection variables are automatically provided by Databricks

### Database Resources

The bundle creates and manages:

1. **Database Instance**: Lakebase database instance for data storage
2. **Database Catalog**: Unity Catalog integration for data governance
3. **App Permissions**: Proper access controls for the application

### Environments

#### Development Environment
- **Catalog**: `dev_astellas_marketplace`
- **Database Instance**: `dev-marketplace-db` (CU_1 capacity)
- **Permissions**: Current user + developers group

#### Production Environment
- **Catalog**: `astellas_marketplace`
- **Database Instance**: `marketplace-db` (CU_4 capacity)
- **Permissions**: Data platform admins, engineers, analysts, and business users

## 📊 Database Schema

The database schema is defined in `resources/database/schema.sql` and includes:

- **data_products**: Main table for data product metadata
- **data_product_tags**: Tags associated with data products
- **Indexes**: Optimized for search and filtering operations

## 🔐 Security & Permissions

### App-Level Permissions
- **CAN_MANAGE**: Full administrative access
- **CAN_VIEW**: Read-only access to the application

### Database Permissions
- Automatic integration with Unity Catalog
- Row-level security based on user groups
- Audit logging for all data access

## 🛠️ Development Workflow

### Local Development

1. **Start the backend:**
   ```bash
   cd src
   python app.py
   ```

2. **Start the frontend (separate terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

### Making Changes

1. **Frontend changes**: Edit files in `frontend/src/`
2. **Backend changes**: Edit files in `src/`
3. **Database changes**: Update `resources/database/schema.sql`
4. **Configuration changes**: Update `databricks.yml` or environment files

### Deployment Process

1. **Test locally** with both frontend and backend
2. **Build and deploy** using the deployment scripts
3. **Verify** the deployment in the Databricks workspace
4. **Monitor** application logs and performance

## 📈 Monitoring & Troubleshooting

### Application Logs
```bash
databricks bundle run --environment development --logs
```

### Common Issues

1. **Bundle validation fails**: Check `databricks.yml` syntax
2. **Database connection issues**: Verify Lakebase configuration
3. **Frontend not loading**: Ensure `src/static` contains built files
4. **Permission errors**: Check app and database permissions

### Useful Commands

```bash
# Validate bundle configuration
databricks bundle validate --environment development

# Deploy to development
databricks bundle deploy --environment development

# View deployment status
databricks bundle run --environment development

# Destroy deployment (careful!)
databricks bundle destroy --environment development

# Generate bundle from existing resources
databricks bundle generate
```

## 🔄 Migration from Legacy Deployment

If migrating from the previous deployment method:

1. **Backup existing data** from the current database
2. **Deploy the new bundle** to a development environment
3. **Test thoroughly** with sample data
4. **Migrate production data** using the provided migration scripts
5. **Update DNS/URLs** to point to the new Databricks App

## 📚 Additional Resources

- [Databricks Asset Bundles Documentation](https://docs.databricks.com/aws/en/dev-tools/bundles/resources#apps)
- [Databricks Apps Guide](https://docs.databricks.com/aws/en/dev-tools/databricks-apps/)
- [Lakebase Database Documentation](https://docs.databricks.com/aws/en/dev-tools/bundles/resources#database_instances)
- [Unity Catalog Integration](https://docs.databricks.com/data-governance/unity-catalog/)

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Test** changes in development environment
4. **Submit** a pull request with bundle validation results

## 📞 Support

For issues related to:
- **Application bugs**: Create an issue in this repository
- **Databricks platform**: Contact your Databricks support team
- **Astellas-specific**: Contact the Data Platform team
