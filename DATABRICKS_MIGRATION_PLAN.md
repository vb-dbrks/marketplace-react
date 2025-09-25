# Databricks Lakebase Migration Plan
## React App Backend Migration to Databricks Lakehouse

### 🎯 **Project Overview**
Migrate the Internal Data Marketplace React application from a local JSON file backend to Databricks Lakebase, leveraging Databricks SQL API for data operations.

---

## 📋 **Current State Analysis**

### **Existing Architecture**
- **Frontend**: React.js with Material-UI components
- **Backend**: Local Python Flask server with JSON file storage
- **Data**: 13 data products stored in `backend/dataProducts.json`
- **API**: RESTful endpoints for CRUD operations
- **Authentication**: None (local development)

### **Data Structure**
```json
{
  "id": "DP001",
  "name": "Global Budget Planning & Investment - (MVP)",
  "description": "...",
  "purpose": "...",
  "type": "Analytics Data Product",
  "domain": "Commercial",
  "region": "Global",
  "owner": "Caroline Walkinshaw",
  "certified": "Digital X to populate",
  "classification": "Internal",
  "gxp": "Non-GXP",
  "interval_of_change": "Other",
  "last_updated_date": "2025-06-18",
  "first_publish_date": "2025-01-01",
  "next_reassessment_date": "2026-01-01",
  "security_considerations": "entire data set",
  "business_function": "Commercial",
  "databricks_url": "https://dbc-c4dc93b7-e7a4.cloud.databricks.com/",
  "tableau_url": "https://tableau.example.com/budget-analytics",
  "ai_bi_genie_url": "https://ai-bi-genie.example.com/budget",
  "tags": ["Budget", "Plannings", "Analytics"]
}
```

---

## 🏗️ **Target Architecture**

### **New Architecture**
- **Frontend**: React.js (unchanged)
- **Backend**: Databricks Lakehouse with SQL API
- **Data Storage**: Delta Lake tables in Databricks
- **API**: Databricks SQL API with Personal Access Token authentication
- **Authentication**: Databricks Personal Access Token
- **Data Governance**: Unity Catalog for access control

### **Data Flow**
```
React App → Databricks SQL API → Delta Lake Tables → Unity Catalog
```

---

## 📊 **Phase 1: Databricks Setup & Data Migration**

### **1.1 Databricks Workspace Setup**
- [ ] Create Databricks workspace (if not exists)
- [ ] Set up Unity Catalog for data governance
- [ ] Create catalog: `marketplace_data`
- [ ] Create schema: `data_products`
- [ ] Set up appropriate permissions and access controls

### **1.2 Data Table Design**
```sql
-- Create Delta Lake table for data products
CREATE TABLE marketplace_data.data_products.data_products (
  id STRING NOT NULL,
  name STRING NOT NULL,
  description STRING,
  purpose STRING,
  type STRING,
  domain STRING,
  region STRING,
  owner STRING,
  certified STRING,
  classification STRING,
  gxp STRING,
  interval_of_change STRING,
  last_updated_date DATE,
  first_publish_date DATE,
  next_reassessment_date DATE,
  security_considerations STRING,
  business_function STRING,
  databricks_url STRING,
  tableau_url STRING,
  ai_bi_genie_url STRING,
  request_access_url STRING,
  tags ARRAY<STRING>,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) USING DELTA
TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true'
);
```

### **1.3 Data Migration Script**
```python
# Python script to migrate JSON data to Databricks
import json
import requests
from databricks import sql
from databricks.sql import connect

def migrate_data_to_databricks():
    # Load existing JSON data
    with open('backend/dataProducts.json', 'r') as f:
        products = json.load(f)
    
    # Connect to Databricks
    connection = connect(
        server_hostname="your-workspace.cloud.databricks.com",
        http_path="your-sql-endpoint-path",
        access_token="your-personal-access-token"
    )
    
    cursor = connection.cursor()
    
    # Insert data
    for product in products:
        # Convert tags array to proper format
        tags_str = str(product.get('tags', [])).replace("'", '"')
        
        insert_query = f"""
        INSERT INTO marketplace_data.data_products.data_products 
        (id, name, description, purpose, type, domain, region, owner, 
         certified, classification, gxp, interval_of_change, 
         last_updated_date, first_publish_date, next_reassessment_date,
         security_considerations, business_function, databricks_url, 
         tableau_url, ai_bi_genie_url, request_access_url, tags)
        VALUES (
            '{product['id']}', '{product['name']}', '{product['description']}',
            '{product['purpose']}', '{product['type']}', '{product['domain']}',
            '{product['region']}', '{product['owner']}', '{product['certified']}',
            '{product['classification']}', '{product['gxp']}', '{product['interval_of_change']}',
            '{product['last_updated_date']}', '{product['first_publish_date']}',
            '{product['next_reassessment_date']}', '{product['security_considerations']}',
            '{product['business_function']}', '{product['databricks_url']}',
            '{product['tableau_url']}', '{product['ai_bi_genie_url']}',
            '{product.get('request_access_url', '')}', {tags_str}
        )
        """
        cursor.execute(insert_query)
    
    connection.commit()
    cursor.close()
    connection.close()
```

---

## 🔧 **Phase 2: API Integration Development**

### **2.1 Databricks SQL API Service**
Create a new service layer to handle Databricks API calls:

```javascript
// frontend/src/services/databricksApi.js
class DatabricksAPI {
  constructor() {
    this.baseURL = process.env.REACT_APP_DATABRICKS_URL;
    this.accessToken = process.env.REACT_APP_DATABRICKS_TOKEN;
    this.sqlEndpoint = process.env.REACT_APP_DATABRICKS_SQL_ENDPOINT;
  }

  async executeQuery(query) {
    const response = await fetch(`${this.baseURL}/api/2.0/sql/statements`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        statement: query,
        warehouse_id: this.sqlEndpoint
      })
    });

    if (!response.ok) {
      throw new Error(`Databricks API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getAllProducts() {
    const query = `
      SELECT * FROM marketplace_data.data_products.data_products 
      ORDER BY last_updated_date DESC
    `;
    return this.executeQuery(query);
  }

  async getProductById(id) {
    const query = `
      SELECT * FROM marketplace_data.data_products.data_products 
      WHERE id = '${id}'
    `;
    return this.executeQuery(query);
  }

  async createProduct(product) {
    const tags = JSON.stringify(product.tags || []);
    const query = `
      INSERT INTO marketplace_data.data_products.data_products 
      (id, name, description, purpose, type, domain, region, owner, 
       certified, classification, gxp, interval_of_change, 
       last_updated_date, first_publish_date, next_reassessment_date,
       security_considerations, business_function, databricks_url, 
       tableau_url, ai_bi_genie_url, request_access_url, tags)
      VALUES (
        '${product.id}', '${product.name}', '${product.description}',
        '${product.purpose}', '${product.type}', '${product.domain}',
        '${product.region}', '${product.owner}', '${product.certified}',
        '${product.classification}', '${product.gxp}', '${product.interval_of_change}',
        '${product.last_updated_date}', '${product.first_publish_date}',
        '${product.next_reassessment_date}', '${product.security_considerations}',
        '${product.business_function}', '${product.databricks_url}',
        '${product.tableau_url}', '${product.ai_bi_genie_url}',
        '${product.request_access_url}', ${tags}
      )
    `;
    return this.executeQuery(query);
  }

  async updateProduct(id, product) {
    const tags = JSON.stringify(product.tags || []);
    const query = `
      UPDATE marketplace_data.data_products.data_products 
      SET 
        name = '${product.name}',
        description = '${product.description}',
        purpose = '${product.purpose}',
        type = '${product.type}',
        domain = '${product.domain}',
        region = '${product.region}',
        owner = '${product.owner}',
        certified = '${product.certified}',
        classification = '${product.classification}',
        gxp = '${product.gxp}',
        interval_of_change = '${product.interval_of_change}',
        last_updated_date = '${product.last_updated_date}',
        first_publish_date = '${product.first_publish_date}',
        next_reassessment_date = '${product.next_reassessment_date}',
        security_considerations = '${product.security_considerations}',
        business_function = '${product.business_function}',
        databricks_url = '${product.databricks_url}',
        tableau_url = '${product.tableau_url}',
        ai_bi_genie_url = '${product.ai_bi_genie_url}',
        request_access_url = '${product.request_access_url}',
        tags = ${tags},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = '${id}'
    `;
    return this.executeQuery(query);
  }

  async deleteProduct(id) {
    const query = `
      DELETE FROM marketplace_data.data_products.data_products 
      WHERE id = '${id}'
    `;
    return this.executeQuery(query);
  }

  async searchProducts(searchTerm) {
    const query = `
      SELECT * FROM marketplace_data.data_products.data_products 
      WHERE 
        LOWER(name) LIKE LOWER('%${searchTerm}%') OR
        LOWER(description) LIKE LOWER('%${searchTerm}%') OR
        LOWER(purpose) LIKE LOWER('%${searchTerm}%') OR
        LOWER(type) LIKE LOWER('%${searchTerm}%') OR
        LOWER(domain) LIKE LOWER('%${searchTerm}%') OR
        LOWER(region) LIKE LOWER('%${searchTerm}%') OR
        LOWER(owner) LIKE LOWER('%${searchTerm}%') OR
        LOWER(certified) LIKE LOWER('%${searchTerm}%') OR
        LOWER(classification) LIKE LOWER('%${searchTerm}%') OR
        LOWER(gxp) LIKE LOWER('%${searchTerm}%') OR
        LOWER(interval_of_change) LIKE LOWER('%${searchTerm}%') OR
        LOWER(security_considerations) LIKE LOWER('%${searchTerm}%') OR
        LOWER(business_function) LIKE LOWER('%${searchTerm}%') OR
        LOWER(databricks_url) LIKE LOWER('%${searchTerm}%') OR
        LOWER(tableau_url) LIKE LOWER('%${searchTerm}%') OR
        LOWER(ai_bi_genie_url) LIKE LOWER('%${searchTerm}%') OR
        LOWER(request_access_url) LIKE LOWER('%${searchTerm}%') OR
        EXISTS (
          SELECT 1 FROM UNNEST(tags) AS tag 
          WHERE LOWER(tag) LIKE LOWER('%${searchTerm}%')
        )
      ORDER BY last_updated_date DESC
    `;
    return this.executeQuery(query);
  }
}

export default new DatabricksAPI();
```

### **2.2 Environment Configuration**
```bash
# .env file
REACT_APP_DATABRICKS_URL=https://your-workspace.cloud.databricks.com
REACT_APP_DATABRICKS_TOKEN=your-personal-access-token
REACT_APP_DATABRICKS_SQL_ENDPOINT=your-sql-endpoint-id
```

### **2.3 Update DataContext**
```javascript
// frontend/src/context/DataContext.jsx
import databricksAPI from '../services/databricksApi';

// Replace existing fetch calls with Databricks API calls
const fetchProducts = async () => {
  try {
    const result = await databricksAPI.getAllProducts();
    return result.result.data_array; // Databricks API response format
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
```

---

## 🔐 **Phase 3: Authentication & Security**

### **3.1 Personal Access Token Setup**
- [ ] Generate Personal Access Token in Databricks workspace
- [ ] Store token securely in environment variables
- [ ] Implement token refresh mechanism (if needed)
- [ ] Set up proper token scopes and permissions

### **3.2 Unity Catalog Permissions**
```sql
-- Grant permissions for the application user
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE marketplace_data.data_products.data_products 
TO `your-application-user@company.com`;

-- Grant catalog and schema permissions
GRANT USE CATALOG ON CATALOG marketplace_data TO `your-application-user@company.com`;
GRANT USE SCHEMA ON SCHEMA marketplace_data.data_products TO `your-application-user@company.com`;
```

### **3.3 Security Best Practices**
- [ ] Use environment variables for sensitive data
- [ ] Implement request rate limiting
- [ ] Add input validation and SQL injection prevention
- [ ] Set up audit logging for data access
- [ ] Implement proper error handling

---

## 🧪 **Phase 4: Testing & Validation**

### **4.1 Unit Testing**
```javascript
// frontend/src/services/__tests__/databricksApi.test.js
import databricksAPI from '../databricksApi';

describe('DatabricksAPI', () => {
  test('should fetch all products', async () => {
    const products = await databricksAPI.getAllProducts();
    expect(Array.isArray(products)).toBe(true);
  });

  test('should search products', async () => {
    const results = await databricksAPI.searchProducts('Clinical');
    expect(results.length).toBeGreaterThan(0);
  });
});
```

### **4.2 Integration Testing**
- [ ] Test all CRUD operations
- [ ] Validate search functionality
- [ ] Test error handling scenarios
- [ ] Performance testing with large datasets
- [ ] Authentication and authorization testing

### **4.3 Data Validation**
- [ ] Verify data integrity after migration
- [ ] Test data consistency across operations
- [ ] Validate search results accuracy
- [ ] Check date formatting and timezone handling

---

## 🚀 **Phase 5: Deployment & Migration**

### **5.1 Deployment Strategy**
- [ ] Set up Databricks workspace in production environment
- [ ] Configure production SQL endpoints
- [ ] Deploy data migration scripts
- [ ] Update environment variables for production
- [ ] Set up monitoring and logging

### **5.2 Migration Steps**
1. **Backup existing data** from JSON file
2. **Run data migration script** to populate Databricks
3. **Update frontend configuration** to use Databricks API
4. **Deploy updated application**
5. **Validate functionality** in production
6. **Monitor performance** and user feedback

### **5.3 Rollback Plan**
- [ ] Keep JSON file backend as fallback
- [ ] Implement feature flag for API switching
- [ ] Prepare rollback scripts
- [ ] Document rollback procedures

---

## 📊 **Phase 6: Monitoring & Optimization**

### **6.1 Performance Monitoring**
- [ ] Set up Databricks query performance monitoring
- [ ] Monitor API response times
- [ ] Track user experience metrics
- [ ] Set up alerts for performance issues

### **6.2 Cost Optimization**
- [ ] Monitor SQL warehouse usage
- [ ] Optimize query performance
- [ ] Implement caching strategies
- [ ] Set up cost alerts and budgets

### **6.3 Data Governance**
- [ ] Set up data lineage tracking
- [ ] Implement audit logging
- [ ] Monitor data access patterns
- [ ] Regular security reviews

---

## 📅 **Timeline & Milestones**

### **Week 1-2: Setup & Data Migration**
- [ ] Databricks workspace setup
- [ ] Data table creation
- [ ] Data migration script development
- [ ] Initial data migration

### **Week 3-4: API Development**
- [ ] Databricks API service development
- [ ] Frontend integration
- [ ] Authentication setup
- [ ] Basic CRUD operations

### **Week 5-6: Testing & Refinement**
- [ ] Unit and integration testing
- [ ] Performance optimization
- [ ] Security validation
- [ ] User acceptance testing

### **Week 7-8: Deployment & Monitoring**
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation
- [ ] Training and handover

---

## 🎯 **Success Criteria**

### **Functional Requirements**
- [ ] All existing features work with Databricks backend
- [ ] Search functionality performs better than JSON file
- [ ] CRUD operations complete within acceptable time limits
- [ ] Data integrity maintained throughout operations

### **Performance Requirements**
- [ ] API response times < 2 seconds for most operations
- [ ] Search results returned within 1 second
- [ ] Support for concurrent users (10+ simultaneous)
- [ ] 99.9% uptime for Databricks API

### **Security Requirements**
- [ ] Secure authentication with Personal Access Token
- [ ] Proper data access controls via Unity Catalog
- [ ] Audit logging for all data operations
- [ ] No sensitive data exposure in logs

---

## 🔧 **Technical Considerations**

### **Challenges & Solutions**

1. **SQL Injection Prevention**
   - Use parameterized queries
   - Input validation and sanitization
   - Prepared statements

2. **Rate Limiting**
   - Implement client-side request throttling
   - Use Databricks API rate limiting
   - Add retry logic with exponential backoff

3. **Error Handling**
   - Comprehensive error handling for API failures
   - User-friendly error messages
   - Fallback mechanisms

4. **Data Consistency**
   - Use Delta Lake ACID transactions
   - Implement optimistic locking
   - Handle concurrent updates

### **Future Enhancements**
- [ ] Real-time data synchronization
- [ ] Advanced analytics and reporting
- [ ] Machine learning integration
- [ ] Multi-tenant support
- [ ] API versioning

---

## 📚 **Resources & Documentation**

### **Databricks Documentation**
- [Databricks SQL API Reference](https://docs.databricks.com/sql/api/index.html)
- [Unity Catalog Documentation](https://docs.databricks.com/data-governance/unity-catalog/index.html)
- [Delta Lake Documentation](https://docs.databricks.com/delta/index.html)

### **Development Resources**
- [Databricks SQL Connector for Python](https://docs.databricks.com/dev-tools/python-sql-connector.html)
- [Personal Access Tokens](https://docs.databricks.com/dev-tools/auth/pat.html)
- [SQL Endpoints](https://docs.databricks.com/sql/admin/sql-endpoints.html)

---

## 🎉 **Expected Benefits**

### **Technical Benefits**
- **Scalability**: Handle larger datasets and more concurrent users
- **Performance**: Faster query execution with optimized SQL warehouse
- **Reliability**: ACID transactions and data consistency
- **Security**: Enterprise-grade security with Unity Catalog

### **Business Benefits**
- **Data Governance**: Centralized data management and access control
- **Analytics**: Advanced analytics capabilities with Databricks
- **Cost Efficiency**: Pay-per-use model for compute resources
- **Future-Proof**: Platform for advanced AI/ML capabilities

---

*This migration plan provides a comprehensive roadmap for transitioning your React application to use Databricks Lakebase as the backend, ensuring a smooth transition while maintaining all existing functionality and adding new capabilities.*
