# Data Marketplace Application

A modern, responsive data marketplace application built with React and FastAPI, designed for deployment on Databricks Apps. This application provides a comprehensive platform for discovering, managing, and accessing data products within your organization.

## Features

- 🔍 **Advanced Search & Filtering** - Powerful search with real-time filtering by type, domain, region, and classification
- 👥 **Role-Based Access Control** - Admin-only authoring capabilities with flexible user management
- 📱 **Responsive Design** - Modern UI that works seamlessly across desktop and mobile devices
- 🎨 **Customizable Branding** - Easy to customize colors, logos, and styling to match your organization
- 🔐 **Databricks Integration** - Native integration with Databricks authentication and permissions
- 📊 **Product Management** - Complete CRUD operations for data products with rich metadata
- 🏷️ **Tag System** - Flexible tagging system for better product categorization

## Architecture

### Frontend (React)
- **Framework**: React 18 with Vite
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **State Management**: React Context API
- **Styling**: Emotion (CSS-in-JS)

### Backend (Python)
- **Framework**: FastAPI
- **Database**: PostgreSQL (Databricks Lakebase)
- **Authentication**: Databricks OAuth integration
- **API Documentation**: Auto-generated OpenAPI/Swagger docs

## Quick Start

### Prerequisites

- Databricks workspace with Apps enabled
- Node.js 18+ and npm
- Python 3.9+
- Access to create Databricks Apps and database resources

### 1. Clone and Setup

```bash
git clone <repository-url>
cd marketplace-react
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev  # For development
npm run build  # For production
```

### 3. Backend Setup

```bash
cd src
pip install -r requirements.txt
python -m app  # For development
```

### 4. Database Setup

The application uses Databricks Lakebase (PostgreSQL). Run the database initialization:

```bash
python -m seed_data  # Initialize with sample data
```

## Deployment on Databricks Apps

### 1. Create Database Resource

```bash
# Create a Lakebase database resource
databricks apps create-database marketplace-database
```

### 2. Configure Environment

Update `src/app.yaml` with your configuration:

```yaml
resources:
  - name: DATABASE_RESOURCE_NAME
    valueFrom: "marketplace-database"
  - name: LAKEBASE_DATABASE_NAME
    value: "marketplace_app"
  - name: MARKETPLACE_ADMIN_USERS
    value: "admin@yourcompany.com,user2@yourcompany.com"
```

### 3. Deploy Application

```bash
# Build frontend
cd frontend && npm run build
cp -r dist/* ../src/static/

# Deploy to Databricks
cd ..
databricks apps deploy
```

## Configuration

### Admin Users

Configure admin users in `src/app.yaml`:

```yaml
- name: MARKETPLACE_ADMIN_USERS
  value: "admin@company.com,manager@company.com"
```

Admin users can:
- Access the authoring interface
- Create, edit, and delete data products
- Manage product metadata and tags

### Branding Customization

#### 1. Logo
Replace `frontend/src/assets/logo-placeholder.svg` with your company logo.

#### 2. Colors
Update `frontend/src/theme/colors.js`:

```javascript
export const colors = {
  primary: {
    main: '#your-brand-color',
    // ... other color variants
  },
  // ... rest of color configuration
};
```

#### 3. Application Title
Update the title in `frontend/src/components/Banner.jsx`:

```javascript
<Typography variant="h6">
  Your Company Data Marketplace
</Typography>
```

### Database Schema

The application creates these tables automatically:

- **data_products**: Main product information
- **data_product_tags**: Product tagging system

See `resources/database/schema.sql` for the complete schema.

## API Documentation

Once deployed, visit `/docs` for interactive API documentation (Swagger UI).

### Key Endpoints

- `GET /api/data-products` - List all data products
- `POST /api/data-products` - Create new data product (admin only)
- `PUT /api/data-products` - Update data products (admin only)
- `GET /api/user-info` - Get current user information
- `GET /api/debug-roles` - Debug user roles and permissions

## Development

### Local Development

1. **Frontend Development Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   Access at `http://localhost:5173`

2. **Backend Development Server**:
   ```bash
   cd src
   python -m app
   ```
   Access at `http://localhost:8000`

### Environment Variables

For local development, create `.env` files:

**Frontend** (`frontend/.env`):
```
VITE_API_BASE_URL=http://localhost:8000
```

**Backend** (environment variables):
```
LAKEBASE_DATABASE_NAME=marketplace_app
MARKETPLACE_ADMIN_USERS=admin@company.com
```

### Code Structure

```
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context providers
│   │   ├── theme/           # Theming and colors
│   │   └── utils/           # Utility functions
│   └── public/              # Static assets
├── src/                     # FastAPI backend
│   ├── app.py              # Main application
│   ├── database.py         # Database operations
│   ├── models.py           # Data models
│   ├── app.yaml            # Databricks App configuration
│   └── static/             # Built frontend files
└── resources/
    └── database/           # Database schema and migrations
```

## Security

### Authentication
- Uses Databricks native authentication
- Extracts user information from `gap-auth` header
- Role-based access control for admin functions

### Authorization
- Admin access controlled via environment variables
- Multiple fallback mechanisms for role detection
- Workspace-level permission checking

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify database resource name in `app.yaml`
   - Check Databricks workspace permissions
   - Ensure Lakebase is enabled in your workspace

2. **Authentication Issues**
   - Verify user email in `MARKETPLACE_ADMIN_USERS`
   - Check `/api/debug-roles` endpoint for role information
   - Ensure proper Databricks workspace access

3. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Debug Endpoints

- `/api/debug-roles` - User role and permission debugging
- `/api/user-info` - Current user information
- `/docs` - API documentation and testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation at `/docs`
3. Use the debug endpoints for authentication issues
4. Create an issue in the repository

---

**Note**: This application is designed specifically for Databricks environments. For deployment on other platforms, additional configuration may be required.