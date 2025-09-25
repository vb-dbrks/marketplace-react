# Data Marketplace

A modern React + FastAPI application for managing and discovering data products, with seamless deployment on Databricks Apps and Lakebase PostgreSQL integration.

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
python app.py
```

3. **Frontend Setup** (in a new terminal):
```bash
cd frontend
npm install
npm run dev
```

4. **Access the Application**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🗄️ Database Configuration

The app automatically detects the environment:

- **Development**: Uses JSON file storage (`dataProducts.json`)
- **Production**: Uses PostgreSQL via Lakebase

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
./deploy.sh [workspace-path] [app-name]
```

**Windows:**
```powershell
.\deploy.ps1 -AppFolderInWorkspace "[workspace-path]" -LakehouseAppName "[app-name]"
```

**Example:**
```bash
./deploy.sh "/Workspace/Users/username/data-marketplace" "my-data-marketplace"
```

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
