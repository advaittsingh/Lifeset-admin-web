# Vercel Deployment - Quick Start

## Prerequisites Checklist

- [ ] Vercel account created
- [ ] PostgreSQL database with connection string
- [ ] Git repository connected to Vercel

## Step-by-Step Deployment

### 1. Connect Repository to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Select the root directory (`/`)

### 2. Configure Build Settings

**Framework Preset**: Other (or leave blank)

**Build Settings**:
- **Root Directory**: `/` (root)
- **Build Command**: `cd packages/admin-web && npm install && npm run build`
- **Output Directory**: `packages/admin-web/dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables

Click "Environment Variables" and add:

#### Required Variables

```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
API_PREFIX=/v1
CORS_ORIGIN=https://your-admin-app.vercel.app
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
VITE_API_URL=https://your-project.vercel.app/api
```

**Note**: Replace `your-project.vercel.app` with your actual Vercel project URL after first deployment.

#### Optional Variables (if using these features)

```
REDIS_URL=redis://...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket
```

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete (5-10 minutes first time)
3. Note your deployment URL

### 5. Update Environment Variables

After first deployment, update:
- `VITE_API_URL` to point to your actual backend URL
- `CORS_ORIGIN` to include your admin web URL
- Redeploy if needed

### 6. Verify Deployment

1. **Backend API**: Visit `https://your-project.vercel.app/api/v1/docs`
   - Should show Swagger documentation

2. **Admin Web**: Visit `https://your-project.vercel.app`
   - Should load admin interface
   - Check browser console for errors

## Common Issues

### Build Fails

**Error**: "Cannot find module '@prisma/client'"
- **Fix**: Ensure `DATABASE_URL` is set (Prisma needs it to generate client)

**Error**: TypeScript compilation errors
- **Fix**: Run `npm run build` locally first to catch errors

### API Returns 404

- Check that `VITE_API_URL` in admin web matches backend URL
- Verify API routes are `/api/v1/*` (not `/api/api/v1/*`)

### CORS Errors

- Add your admin web URL to `CORS_ORIGIN`
- Format: `https://your-admin.vercel.app` (comma-separated for multiple)

### Database Connection Fails

- Verify `DATABASE_URL` format is correct
- Ensure database allows connections from Vercel IPs
- Check SSL is enabled: `?sslmode=require`

## Next Steps

- Set up custom domain (optional)
- Configure CI/CD for automatic deployments
- Set up monitoring and alerts
- Review [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed documentation

## Support

- Check function logs in Vercel Dashboard
- Review [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for troubleshooting
- Vercel Docs: https://vercel.com/docs
