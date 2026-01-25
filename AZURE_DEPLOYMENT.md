# Azure Deployment Guide for FinanzApp

This document explains how to deploy FinanzApp to Azure App Service.

## Prerequisites

- Azure subscription
- Azure App Service (Node.js runtime)
- PostgreSQL database (Neon or Azure Database for PostgreSQL)

## Deployment Options

This application supports two Azure deployment methods:

### 1. Azure App Service (Recommended)

Azure App Service provides a fully managed platform for hosting web applications with Node.js runtime.

#### Configuration Requirements

1. **Runtime**: Node.js 22.x or higher
2. **Start Command**: `node server.js`
3. **Environment Variables**:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   NODE_ENV=production
   ```

#### Deployment via GitHub Actions

The repository includes a pre-configured GitHub Actions workflow (`.github/workflows/main_modelado5.yml`) that:
- Builds the application
- Creates a deployment package
- Deploys to Azure App Service

**Setup Steps:**
1. Create an Azure App Service with Node.js 22.x runtime
2. Configure the following GitHub secrets:
   - `AZUREAPPSERVICE_CLIENTID_*`
   - `AZUREAPPSERVICE_TENANTID_*`
   - `AZUREAPPSERVICE_SUBSCRIPTIONID_*`
3. Add `DATABASE_URL` to App Service Application Settings
4. Push to `main` branch to trigger automatic deployment

### 2. Azure Static Web Apps

For static deployment (limited functionality - API routes won't work).

#### Configuration

The workflow is at `.github/workflows/azure-static-web-apps-lively-field-0b4a1ae0f.yml`.

**Note**: This method requires changing `next.config.mjs` to include `output: "export"` and will not support server-side API routes.

## File Structure for Azure Deployment

### Key Files

- **server.js**: Custom Node.js server for Azure App Service
- **web.config**: IIS configuration for Azure App Service
- **next.config.mjs**: Next.js configuration
- **.env.example**: Environment variables template

### Custom Server (server.js)

The `server.js` file is required for Azure App Service deployment and handles:
- HTTP request routing
- Port configuration (uses Azure's `PORT` environment variable)
- Next.js application initialization

### Web Config (web.config)

The `web.config` file configures IIS to:
- Route requests to the Node.js application
- Handle static content
- Enable proper Node.js hosting via iisnode

## Environment Variables

Configure these in Azure App Service → Configuration → Application Settings:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Yes | Node environment | `production` |
| `PORT` | No | Server port (auto-set by Azure) | `8080` |
| `WEBSITE_NODE_DEFAULT_VERSION` | No | Node.js version | `22.x` |

## Database Setup

1. **Option A: Neon PostgreSQL** (Recommended)
   - Serverless PostgreSQL with free tier
   - Low latency for global deployments
   - Connection string: Available in Neon dashboard

2. **Option B: Azure Database for PostgreSQL**
   - Fully managed PostgreSQL in Azure
   - Better integration with Azure services
   - Connection string format: `postgresql://user:password@server.postgres.database.azure.com:5432/database?sslmode=require`

### Database Initialization

Run the SQL schema from `scripts/init-database.sql` in your PostgreSQL instance.

## Build Process

### Local Build

```bash
# Install dependencies
npm install

# Build (requires DATABASE_URL)
DATABASE_URL="postgresql://user:pass@host:5432/db" npm run build

# Start production server
npm start
```

### Azure Build

The GitHub Actions workflow automatically:
1. Installs dependencies
2. Builds with a dummy DATABASE_URL (for static page generation)
3. Packages the application
4. Deploys to Azure

## Troubleshooting

### Build Fails with "DATABASE_URL is not set"

**Solution**: The build process requires a DATABASE_URL. Use a dummy value:
```bash
DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npm run build
```

### Application Doesn't Start on Azure

**Checklist**:
- [ ] Verify `server.js` exists in deployment
- [ ] Check `DATABASE_URL` is set in App Service Configuration
- [ ] Confirm Node.js version is 22.x or higher
- [ ] Review Application Logs in Azure Portal

### Database Connection Errors

**Solutions**:
- Verify DATABASE_URL format
- Check firewall rules (allow Azure services)
- For Neon: Ensure connection string includes all parameters
- For Azure PostgreSQL: Verify SSL mode is enabled

### Static Assets Not Loading

**Solution**: Ensure `web.config` is deployed and properly configured for static content routing.

## Performance Optimization

1. **Enable Application Insights**: Monitor performance and errors
2. **Configure Auto-Scaling**: Handle traffic spikes
3. **Use CDN**: Serve static assets via Azure CDN
4. **Enable Compression**: In App Service settings
5. **Database Connection Pooling**: Already configured via Neon serverless

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Database Access**: Use firewall rules to restrict access
3. **HTTPS**: Enabled by default on Azure App Service
4. **Secrets Management**: Use Azure Key Vault for sensitive data
5. **Authentication**: Cookie-based auth with httpOnly cookies (already implemented)

## Monitoring

### Application Logs

Access via Azure Portal:
- App Service → Monitoring → Log stream
- App Service → Monitoring → Application Insights

### Health Checks

Configure in App Service → Health check:
- Path: `/api/users/me` (requires authentication)
- Or create a dedicated `/api/health` endpoint

## Cost Estimation

### Azure App Service
- **Free Tier**: F1 (60 CPU minutes/day, 1 GB memory)
- **Basic**: B1 (~$13/month)
- **Standard**: S1 (~$70/month) - Recommended for production

### Database
- **Neon Free Tier**: $0 (0.5 GB storage, 10 hrs compute/month)
- **Azure PostgreSQL**: Starting at ~$25/month

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Neon PostgreSQL](https://neon.tech/)
- [Azure Database for PostgreSQL](https://azure.microsoft.com/services/postgresql/)

## Support

For issues specific to:
- **Application Code**: Open an issue in this repository
- **Azure Services**: Contact Azure Support
- **Database**: Neon Support or Azure PostgreSQL Support
