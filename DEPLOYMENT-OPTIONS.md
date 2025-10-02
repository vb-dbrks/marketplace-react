# Deployment Options for Astellas Data Marketplace

Based on the [Databricks Node.js tutorial](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-apps/tutorial-node), there are multiple ways to structure and deploy the application.

## 🏗️ **Current Structure (Recommended)**

### **Development Workflow**
```bash
# Frontend development
cd frontend && npm run dev     # React dev server on :5173

# Backend development  
cd src && python app.py        # FastAPI dev server on :8000
```

### **Deployment Workflow**
```bash
# Build and deploy (automatic frontend build)
./deploy-bundle.sh development
```

**Benefits:**
- ✅ **Optimized builds** - Vite handles bundling, minification, tree-shaking
- ✅ **Development experience** - Hot reload, separate dev servers
- ✅ **Asset optimization** - Images, fonts, CSS properly handled
- ✅ **Production ready** - Fast loading, optimized bundles

## 🎯 **Alternative: Simplified Structure**

If you want to remove the `frontend/` directory entirely and follow the Databricks tutorial pattern more closely:

### **Option 1: Pre-built Static Files**
```bash
# One-time build and commit
cd frontend
npm run build
cp -r dist/* ../src/static/
cd ..
rm -rf frontend/  # Remove frontend directory

# Deploy with static files only
./deploy-bundle.sh development
```

### **Option 2: Databricks-Native Build** (Advanced)
Move the build process into the Databricks environment by:

1. **Add Node.js to app dependencies**:
```yaml
# In src/app.yaml
command: 
  - bash
  - -c
  - "npm install && npm run build && python app.py"
```

2. **Move package.json to src/**:
```bash
mv frontend/package.json src/
mv frontend/src/* src/frontend-src/
```

3. **Update build scripts** to work in Databricks environment

## 📊 **Comparison**

| Approach | Development | Deployment | Maintenance | Performance |
|----------|-------------|------------|-------------|-------------|
| **Current (Hybrid)** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Pre-built Static** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Databricks-Native** | ⭐ | ⭐⭐ | ⭐ | ⭐⭐ |

## 🎯 **Recommendation**

**Keep the current structure** because:

1. **React complexity** - Our app uses complex React components, routing, and state management
2. **Build optimization** - Vite provides superior bundling and optimization
3. **Development workflow** - Separate dev servers enable hot reload and debugging
4. **Future flexibility** - Easy to add new frontend features or frameworks

The [Databricks tutorial](https://learn.microsoft.com/en-us/azure/databricks/dev-tools/databricks-apps/tutorial-node) works well for simple apps with static HTML, but our React application benefits from the more sophisticated build process.

## 🔧 **Optional: Remove Frontend Directory**

If you want to simplify and remove the `frontend/` directory:

```bash
# 1. Build one final time
cd frontend && npm run build && cd ..

# 2. Ensure static files are in place
cp -r frontend/dist/* src/static/

# 3. Remove frontend directory
rm -rf frontend/

# 4. Update .gitignore to exclude src/static/
echo "src/static/" >> .gitignore

# 5. Deploy
./deploy-bundle.sh development
```

**Note:** This removes the ability to easily modify the frontend, so only do this for production deployments where the UI is stable.

## 🚀 **Hybrid Benefits**

Our current deployment scripts now support both approaches:
- **With `frontend/`** - Builds automatically during deployment
- **Without `frontend/`** - Uses pre-built files in `src/static/`

This gives you the flexibility to choose the approach that works best for your team and deployment pipeline!
