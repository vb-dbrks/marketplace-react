# Configuration Guide

This guide explains how to customize the Data Marketplace application for your organization.

## Quick Customization Checklist

- [ ] Update company logo
- [ ] Configure brand colors
- [ ] Set application title
- [ ] Configure admin users
- [ ] Update database name
- [ ] Customize sample data

## 1. Branding Configuration

### Company Logo

Replace the placeholder logo with your company's logo:

1. **Add your logo file** to `frontend/src/assets/`
   - Supported formats: SVG, PNG, JPG
   - Recommended size: 120x40px or similar aspect ratio

2. **Update the import** in `frontend/src/components/Banner.jsx`:
   ```javascript
   // Change this line:
   import companyLogo from '../assets/logo-placeholder.svg';
   // To:
   import companyLogo from '../assets/your-company-logo.svg';
   ```

### Brand Colors

Update `frontend/src/theme/colors.js` with your brand colors:

```javascript
export const colors = {
  primary: {
    main: '#your-primary-color',    // Main brand color
    light: '#lighter-variant',      // Lighter shade
    dark: '#darker-variant',        // Darker shade
    contrastText: '#fff'            // Text color on primary background
  },
  
  secondary: {
    main: '#your-secondary-color',  // Secondary/accent color
    // ... other variants
  },
  
  // Update component-specific colors
  components: {
    searchBar: {
      focus: '#your-primary-color',
      hover: 'rgba(your-rgb-values, 0.08)'
    },
    filters: {
      active: '#your-primary-color',
      hover: 'rgba(your-rgb-values, 0.08)'
    }
  }
};
```

### Application Title

Update the application title in `frontend/src/components/Banner.jsx`:

```javascript
<Typography variant="h6">
  Your Company Data Marketplace  {/* Change this */}
</Typography>
```

And the subtitle:
```javascript
<Typography variant="caption">
  Your Custom Tagline  {/* Change this */}
</Typography>
```

## 2. User Management Configuration

### Admin Users

Configure admin users in `src/app.yaml`:

```yaml
- name: MARKETPLACE_ADMIN_USERS
  value: "admin@yourcompany.com,manager@yourcompany.com,lead@yourcompany.com"
```

**Supported formats**:
- Email addresses: `user@company.com`
- User IDs: `user-uuid-string`
- Mixed: `admin@company.com,uuid-string`

### Admin Group Name

If your organization uses a different admin group name, update `src/app.py`:

```python
ADMIN_GROUP = "your_admin_group_name"  # Change this
```

## 3. Database Configuration

### Database Name

Update the database name in `src/app.yaml`:

```yaml
- name: LAKEBASE_DATABASE_NAME
  value: "your_marketplace_db"  # Change this
```

### Database Resource

Update the database resource reference:

```yaml
- name: DATABASE_RESOURCE_NAME
  valueFrom: "your-database-resource-name"  # Change this
```

## 4. Sample Data Customization

### Product Categories

Update `src/seed_data.py` to include your organization's data product categories:

```python
# Update these lists with your categories
DOMAINS = ["Finance", "Marketing", "Operations", "HR", "IT"]
REGIONS = ["North America", "Europe", "Asia Pacific", "Global"]
TYPES = ["Analytics Dataset", "ML Model", "Dashboard", "Report"]
CLASSIFICATIONS = ["Public", "Internal", "Confidential", "Restricted"]
```

### Sample Products

Replace the sample products in `src/seed_data.py` with examples relevant to your organization:

```python
sample_products = [
    {
        "name": "Customer Analytics Dataset",
        "description": "Comprehensive customer behavior analytics",
        "domain": "Marketing",
        "type": "Analytics Dataset",
        # ... other fields
    },
    # Add more sample products
]
```

## 5. Environment-Specific Configuration

### Development Environment

Create `frontend/.env.local` for local development:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE="Your Company Data Marketplace (Dev)"
```

### Production Environment

Configure production settings in `src/app.yaml`:

```yaml
resources:
  - name: ENVIRONMENT
    value: "production"
  - name: LOG_LEVEL
    value: "INFO"
  - name: CORS_ORIGINS
    value: "https://your-domain.databricksapps.com"
```

## 6. Advanced Customization

### Custom Styling

For advanced styling changes, update the Material-UI theme in `frontend/src/App.jsx`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
    },
    // Add custom palette overrides
  },
  typography: {
    // Custom typography settings
    fontFamily: '"Your Custom Font", "Roboto", sans-serif',
  },
  components: {
    // Component-specific overrides
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Custom border radius
        },
      },
    },
  },
});
```

### Custom Components

To add custom fields to data products:

1. **Update the database schema** in `resources/database/schema.sql`
2. **Update the Pydantic models** in `src/app.py`
3. **Update the frontend forms** in `frontend/src/components/AddNewProduct.jsx`
4. **Update the display components** in `frontend/src/components/ProductCard.jsx`

### Custom Authentication

To integrate with different authentication systems, modify `src/app.py`:

```python
def get_current_user_info(request: Request = None) -> UserInfo:
    # Implement your custom authentication logic
    # Extract user info from your auth system
    pass
```

## 7. Deployment Configuration

### Databricks App Configuration

Update `databricks.yml` for your workspace:

```yaml
bundle:
  name: your-marketplace-app
  
targets:
  development:
    workspace:
      host: https://your-workspace.cloud.databricks.com
  
  production:
    workspace:
      host: https://your-prod-workspace.cloud.databricks.com
```

### Resource Naming

Use consistent naming for your resources:

```yaml
resources:
  apps:
    marketplace_app:
      name: "your-company-data-marketplace"
      description: "Your Company's Data Marketplace"
```

## 8. Testing Your Configuration

### 1. Local Testing

```bash
# Test frontend
cd frontend
npm run dev

# Test backend
cd src
python -m app
```

### 2. Build Testing

```bash
# Build and test
cd frontend
npm run build
cd ../src
cp -r ../frontend/dist/* static/
python -m app
```

### 3. Deployment Testing

```bash
# Deploy to development
databricks apps deploy --target development

# Test admin access
curl -X GET "https://your-app-url/api/user-info"
curl -X GET "https://your-app-url/api/debug-roles"
```

## 9. Troubleshooting Configuration

### Common Issues

1. **Logo not displaying**
   - Check file path and format
   - Ensure file is in `frontend/src/assets/`
   - Verify import statement

2. **Colors not updating**
   - Clear browser cache
   - Rebuild frontend: `npm run build`
   - Check color format (hex, rgb, etc.)

3. **Admin access not working**
   - Verify email format in `MARKETPLACE_ADMIN_USERS`
   - Check `/api/debug-roles` endpoint
   - Ensure proper Databricks permissions

4. **Database connection issues**
   - Verify database resource name
   - Check Lakebase permissions
   - Ensure database exists

### Debug Commands

```bash
# Check current configuration
cat src/app.yaml

# Test database connection
python -c "from src.database import get_database_service; print(get_database_service())"

# Check user permissions
curl -X GET "https://your-app-url/api/debug-roles"
```

## 10. Maintenance

### Regular Updates

1. **Update admin users** as team changes
2. **Review and update sample data** periodically
3. **Monitor application logs** for issues
4. **Update dependencies** regularly

### Backup Configuration

Keep backups of your customized files:
- `src/app.yaml`
- `frontend/src/theme/colors.js`
- `frontend/src/assets/` (logo files)
- `src/seed_data.py`

---

For additional help, refer to the main README.md or create an issue in the repository.
