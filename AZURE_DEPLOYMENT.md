# Azure App Service Deployment Guide

This guide provides step-by-step instructions for deploying FinanzApp to Azure App Service.

## Prerequisites

1. Azure subscription with an active App Service
2. GitHub repository with the application code
3. PostgreSQL database (Neon or Azure PostgreSQL)

## Environment Configuration

### Required Environment Variables

Configure the following environment variables in your Azure Web App:

1. Go to Azure Portal → Your Web App → Configuration → Application settings
2. Add the following variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://user:password@host/database` | PostgreSQL connection string |
| `TZ` | `America/Bogota` | Timezone for the application |
| `NODE_ENV` | `production` | Node environment |

### GitHub Secrets

For CI/CD pipeline to work, configure the following secret in GitHub:

1. Go to GitHub → Repository → Settings → Secrets and variables → Actions
2. Add:
   - `DATABASE_URL`: Your PostgreSQL connection string

## Deployment Steps

### Option 1: Automatic Deployment via GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/main_modelado5.yml`) that automatically deploys to Azure when you push to the `main` branch.

1. Push your code to the `main` branch
2. GitHub Actions will:
   - Install dependencies
   - Build the application
   - Deploy to Azure App Service

### Option 2: Manual Deployment via Azure CLI

```bash
# Login to Azure
az login

# Deploy to Azure Web App
az webapp up --name modelado5 --resource-group <your-resource-group>
```

## Configuration Files

### server.js
Custom Node.js server that handles HTTP requests and runs Next.js in server mode. This is required for Azure App Service compatibility.

### web.config
IIS configuration file that routes requests through iisnode to the Node.js server.

### next.config.mjs
Updated to remove `output: "export"` to enable server-side rendering, which is required for Azure App Service.

## Troubleshooting

### Build Fails with "DATABASE_URL is not set"

**Solution**: The database connection now uses lazy initialization. The `DATABASE_URL` environment variable is only required at runtime, not during build. Make sure it's configured in:
1. GitHub Secrets (for CI/CD)
2. Azure Web App Configuration (for runtime)

### App Doesn't Start on Azure

**Possible causes**:
1. Check that `server.js` exists in the root directory
2. Verify `package.json` has `"start": "node server.js"`
3. Check Azure logs: Portal → Web App → Log stream

### Database Connection Errors

**Solution**:
1. Verify `DATABASE_URL` is correctly configured in Azure Web App settings
2. Ensure your database allows connections from Azure
3. For Neon: Check that the connection string includes SSL parameters if required

### Port Issues

The application automatically uses the `PORT` environment variable provided by Azure (defaults to 3000 for local development). No manual configuration needed.

## Post-Deployment Verification

1. **Check Application Logs**:
   - Azure Portal → Your Web App → Log stream
   - Look for: `> Ready on http://localhost:<port>`

2. **Test the Application**:
   - Visit: `https://<your-app-name>.azurewebsites.net`
   - Test login functionality
   - Verify database connectivity

3. **Monitor Performance**:
   - Azure Portal → Your Web App → Metrics
   - Monitor CPU, Memory, and Response times

## Architecture Changes for Azure Compatibility

### Before
- Static export mode (`output: "export"`)
- Eager database initialization (fails during build)
- Google Fonts loaded at build time

### After
- Server-side rendering enabled
- Lazy database initialization (only at runtime)
- Google Fonts removed to prevent offline build issues
- Custom Node.js server for Azure App Service
- IIS configuration via web.config

## Security Considerations

1. **Never commit sensitive data**:
   - Use environment variables for all secrets
   - `.env.example` provides a template (no actual values)

2. **HTTPS**:
   - Azure App Service provides free SSL certificates
   - Enable "HTTPS Only" in Azure Portal → Web App → Configuration

3. **Database Security**:
   - Use connection strings with SSL
   - Restrict database access to Azure IP ranges
   - Regularly rotate credentials

## Support

For issues related to:
- **Azure**: Check Azure Portal logs and support documentation
- **Database**: Verify Neon/Azure PostgreSQL connection settings
- **Application**: Check GitHub repository issues

## Additional Resources

- [Azure Web Apps Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
