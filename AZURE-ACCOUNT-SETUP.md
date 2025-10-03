# Azure Account-Level Groups Setup

To enable account-level group checking for your Databricks App, you need to configure the Account ID.

## Required Environment Variable

Set the following environment variable in your Databricks App configuration:

```
DATABRICKS_ACCOUNT_ID=your-account-id-here
```

## How to Find Your Account ID

1. **From Azure Portal**:
   - Go to your Azure Databricks workspace
   - Look at the URL or resource details
   - The Account ID is typically a UUID format

2. **From Databricks Workspace**:
   - Go to Settings → Account Settings
   - The Account ID should be displayed there

3. **From the workspace URL**:
   - Your workspace URL contains the account information
   - Format: `https://instance-{instance-id}.{account-id}.database.azuredatabricks.net`

## Setting the Environment Variable

In your Databricks App configuration (app.yaml or environment settings), add:

```yaml
environment:
  DATABRICKS_ACCOUNT_ID: "your-actual-account-id"
```

## Verification

Once set, the app will:
1. Use the Account SCIM API to check account-level groups
2. Look for the `marketplace_app_admins` group
3. Enable authoring features for group members

Check the logs for messages like:
- "Using account ID: your-account-id"
- "Account SCIM API returned X groups"
- "Found membership in account-level group: marketplace_app_admins"
