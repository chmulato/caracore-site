# Microsoft Entra ID (Azure AD) Setup with Custom Domain

This document outlines the steps taken to properly configure the Microsoft Entra ID (Azure AD) authentication with our custom domain (`www.caracore.com.br`) hosted on GitHub Pages.

## Problem

When authenticating with Microsoft Entra ID from our custom domain, the token exchange process was failing because:

1. The frontend was trying to use a relative path (`/oauth/microsoft/token`) which doesn't exist on GitHub Pages
2. The Azure App Service backend needed explicit CORS configuration to allow requests from the custom domain

## Solution

### 1. Frontend Configuration Changes

We updated the following files:

#### 1.1. `js/config.js`

Added the explicit Microsoft token endpoint pointing directly to the Azure backend:

```javascript
const CARA_CORE_DEFAULT_CONFIG = {
  // other settings...
  googleTokenEndpoint: 'https://caracore-backend.azurewebsites.net/oauth/google/token',
  microsoftTokenEndpoint: 'https://caracore-backend.azurewebsites.net/oauth/microsoft/token', // Added this line
  // other settings...
};
```

#### 1.2. `secure/dynamic-config.js`

Modified the Microsoft token endpoint to use the direct URL to the backend instead of a relative URL:

```javascript
const microsoftTokenEndpoint = window.CARA_CORE_CONFIG?.microsoftTokenEndpoint || 
                              "https://caracore-backend.azurewebsites.net/oauth/microsoft/token";
```

### 2. Backend Configuration

Updated the Azure App Service configuration to allow CORS requests from our custom domain:

```bash
az webapp config appsettings set --name caracore-backend --resource-group rg-caracore \
    --settings ORIGIN_ALLOWED=https://www.caracore.com.br
```

Then restarted the App Service to apply the changes:

```bash
az webapp restart --name caracore-backend --resource-group rg-caracore
```

## Verification

To verify that the authentication works correctly:

1. Navigate to `https://www.caracore.com.br`
2. Click on the "Login with Microsoft" option
3. Complete the Microsoft authentication flow
4. You should be successfully redirected back to the application

## Notes

- These changes ensure that the token exchange happens directly between the frontend and the backend without relying on proxying
- Both Google and Microsoft authentication should now work correctly with the custom domain
- The Azure App Service is properly configured to accept CORS requests from the custom domain