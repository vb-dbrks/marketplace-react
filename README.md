# Astellas Data Marketplace

A modern React + FastAPI application for managing and discovering data products, now restructured for deployment using **Databricks Asset Bundles**.

> **🚨 IMPORTANT**: This repository has been restructured to use [Databricks Asset Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/resources#apps). For the new deployment approach, see [README-ASSET-BUNDLES.md](./README-ASSET-BUNDLES.md).

## 🆕 New Deployment Method (Recommended)

**Use Databricks Asset Bundles for modern, scalable deployment:**

```bash
# Quick deployment
./deploy-bundle.sh development

# Or for production
./deploy-bundle.sh production
```

📖 **[Read the full Asset Bundles guide →](./README-ASSET-BUNDLES.md)**

## 🚀 Features

- **🔍 Advanced Search & Filtering**: Find data products with powerful search and filter capabilities
- **📝 Product Management**: Add, edit, and manage data products through an intuitive interface
- **🔄 Real-time Updates**: Live data synchronization across all users
- **📱 Responsive Design**: Modern Material-UI interface that works on all devices
- **☁️ Cloud Ready**: Seamless deployment on Databricks Apps with Lakebase integration
- **🗄️ Flexible Storage**: Automatic fallback from PostgreSQL to JSON for development
- **🔒 Production Security**: Built-in security best practices and input validation

## 🏗️ Architecture

```
data-marketplace/
├── frontend/           # React frontend (Vite + Material-UI)
│   ├── src/components/ # React components
│   ├── src/context/    # Data context and state management
│   └── src/utils/      # API utilities
├── backend/            # FastAPI backend
│   ├── app.py          # Main application
│   ├── models.py       # SQLAlchemy database models
│   ├── database.py     # Database service layer
│   ├── utils/          # Utility scripts
│   │   └── seed_database.py # Database seeding utility
│   └── dataProducts.json # Fallback JSON storage
├── deploy.sh           # Bash deployment script (Linux/Mac)
├── deploy.ps1          # PowerShell deployment script (Windows)
└── requirements.txt    # Python dependencies
```

## 🛠️ Technology Stack

- **Frontend**: React 18, Material-UI v7, Vite, React Router
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Pydantic
- **Database**: Lakebase (PostgreSQL) with JSON fallback
- **Deployment**: Databricks Apps Platform
- **Development**: Hot reload, TypeScript support, ESLint

## ⚡ Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- Git
- Databricks CLI (for deployment)

### Local Development

1. **Clone the Repository**:
```bash
git clone <repository-url>
cd data-marketplace
```

2. **Backend Setup**:
```bash
cd backend
pip install -r requirements.txt
```

3. **Database Configuration** (Choose one option):

   **Option A: Use JSON Storage (Default)**
   ```bash
   # No additional setup needed - app will use dataProducts.json
   python app.py
   ```

   **Option B: Connect to Lakebase Database**
   
   **Bash/Linux/Mac:**
   ```bash
   # Set up environment variables for database connection
   export PGHOST="your-lakebase-host"
   export PGUSER="your-email@databricks.com"
   export PGDATABASE="databricks_postgres"
   export PGPORT="5432"
   export PGSSLMODE="require"
   export PGPASSWORD="your-databricks-token"
   
   # Start the backend
   python app.py
   ```
   
   **PowerShell/Windows:**
   ```powershell
   # Set up environment variables for database connection
   $env:PGHOST="your-lakebase-host"
   $env:PGUSER="your-email@databricks.com"
   $env:PGDATABASE="databricks_postgres"
   $env:PGPORT="5432"
   $env:PGSSLMODE="require"
   $env:PGPASSWORD="your-databricks-token"
   
   # Start the backend
   python app.py
   ```

4. **Frontend Setup** (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```

5. **Access the Application**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database Status: http://localhost:8000/api/database-status

## 🗄️ Database Configuration

The app automatically detects the environment:

- **Development**: Uses JSON file storage (`dataProducts.json`) by default
- **Production**: Uses PostgreSQL via Lakebase when environment variables are set

### Getting Lakebase Credentials for Local Development

To connect to Lakebase from your local machine:

1. **Access your Databricks workspace**
2. **Navigate to Apps** → **Your App** → **Resources**
3. **Add a Database resource** (Lakebase)
4. **Copy the connection details** from the resource configuration
5. **Get a Databricks token**:
   - Go to User Settings → Developer → Access Tokens
   - Generate a new token (valid for 1 hour by default)
   - Use this token as `PGPASSWORD`

### Environment Variables for Local Development

**Bash/Linux/Mac:**
```bash
# Required for Lakebase connection
export PGHOST="your-lakebase-host.database.azuredatabricks.net"
export PGUSER="your-email@databricks.com"
export PGDATABASE="databricks_postgres"
export PGPORT="5432"
export PGSSLMODE="require"
export PGPASSWORD="your-databricks-token"  # Get from Databricks UI
```

**PowerShell/Windows:**
```powershell
# Required for Lakebase connection
$env:PGHOST="your-lakebase-host.database.azuredatabricks.net"
$env:PGUSER="your-email@databricks.com"
$env:PGDATABASE="databricks_postgres"
$env:PGPORT="5432"
$env:PGSSLMODE="require"
$env:PGPASSWORD="your-databricks-token"  # Get from Databricks UI
```

### Environment Variables (Production)
When deployed to Databricks Apps with Lakebase, these are automatically set:
```bash
PGHOST=your-postgres-host
PGDATABASE=your-database-name
PGUSER=your-service-principal
PGPORT=5432
PGSSLMODE=require
```

## 🚀 Deployment

### Deploy to Databricks Apps

**Linux/Mac:**
```bash
./deploy.sh [workspace-path] [app-name] [profile]
```

**Windows:**
```powershell
.\deploy.ps1 -AppFolderInWorkspace "[workspace-path]" -LakehouseAppName "[app-name]" -DatabricksProfile "[profile]"
```

**Examples:**
```bash
# Deploy to default profile
./deploy.sh "/Workspace/Users/your-email@company.com/data-marketplace" "data-marketplace"

# Deploy to specific profile (dev, test, prod)
./deploy.sh "/Workspace/Users/your-email@company.com/data-marketplace" "data-marketplace" "prod"
```

**Profile Configuration:**
- Set up multiple Databricks profiles using `databricks configure --profile <name>`
- Use `DEFAULT` or omit the profile parameter to use the default profile
- Common profiles: `dev`, `test`, `prod`, `staging`

### Prerequisites for Production
1. Add Lakebase database resource in Databricks Apps UI
2. Configure service principal permissions
3. Deploy using the provided script

## 📊 API Endpoints

- `GET /api/data-products` - Retrieve all products
- `PUT /api/data-products` - Update products
- `GET /api/database-status` - Check storage type
- `GET /health` - Health check

## 🔧 Configuration

### Database Models
- `data_products`: Main product information
- `data_product_tags`: Normalized tag storage

### Data Schema
```json
{
  "id": "string",
  "name": "string", 
  "description": "string",
  "type": "string",
  "domain": "string",
  "owner": "string",
  "databricks_url": "string",
  "tableau_url": "string",
  "tags": ["string"]
}
```

## 🔒 Security & Best Practices

- ✅ Databricks Apps best practices compliance
- ✅ Environment-based configuration
- ✅ Input validation and sanitization
- ✅ Graceful shutdown handling
- ✅ Proper error handling and logging
- ✅ CORS configuration for production

## 📝 Development Notes

- The app uses smart fallback: JSON in dev, PostgreSQL in production
- All database operations are handled through the `database.py` service layer
- Frontend uses React Context for state management
- API endpoints maintain backward compatibility

## 🔧 Troubleshooting

### Common Issues

**"No products found" error:**
- Check if `dataProducts.json` exists in the `backend/` directory
- If using database: verify environment variables are set correctly
- Check database status: `curl http://localhost:8000/api/database-status`

**Database connection fails:**
- Verify your Databricks token is valid (tokens expire after 1 hour)
- Check that all environment variables are set:
  - **Bash**: `echo $PGHOST $PGUSER $PGPASSWORD`
  - **PowerShell**: `echo $env:PGHOST $env:PGUSER $env:PGPASSWORD`
- Ensure your Databricks workspace has Lakebase configured

**App won't start:**
- Check if port 8000 is available: `lsof -i :8000`
- Verify Python dependencies: `pip install -r requirements.txt`
- Check for syntax errors in the logs

### Utility Scripts

The `backend/utils/` directory contains helpful utility scripts:

- **`seed_database.py`**: Migrates data from `dataProducts.json` to the Lakebase database
  ```bash
  # Using environment variable
  export PGPASSWORD="your_token_here"
  python backend/utils/seed_database.py
  
  # Using command line argument
  python backend/utils/seed_database.py "your_token_here"
  ```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with both JSON and database modes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Material-UI](https://mui.com/)
- Backend powered by [FastAPI](https://fastapi.tiangolo.com/)
- Database integration with [SQLAlchemy](https://www.sqlalchemy.org/)
- Deployed on [Databricks Apps](https://docs.databricks.com/apps/index.html) with [Lakebase](https://docs.databricks.com/lakebase/index.html)

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/your-username/data-marketplace/issues) page
2. Create a new issue with detailed information
3. Follow the contributing guidelines

## 🔄 Version History

- **v1.0.0** - Initial release with React + FastAPI + Lakebase integration
- **v1.1.0** - Added cross-platform deployment scripts
- **v1.2.0** - Enhanced security and best practices compliance
