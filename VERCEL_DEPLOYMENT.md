# Vercel Deployment Guide

This guide covers deploying the LifeSet Platform backend API and admin web app to Vercel.

## Architecture

- **Backend API**: Deployed as Vercel serverless functions (NestJS)
- **Admin Web**: Deployed as static site (Vite + React)
- **Database**: Uses existing PostgreSQL database (via `DATABASE_URL`)

## Prerequisites

1. Vercel account
2. Vercel CLI installed: `npm i -g vercel`
3. Existing PostgreSQL database with connection string

## Project Structure

```
/
├── vercel.json                    # Root Vercel config (monorepo)
├── api/
│   └── index.ts                   # Root API handler (imports from backend)
├── packages/
│   ├── backend/
│   │   ├── api/
│   │   │   └── index.ts          # Vercel serverless handler implementation
│   │   ├── vercel.json           # Backend-specific config
│   │   └── package.json          # Includes Prisma generation
│   └── admin-web/
│       ├── vercel.json           # Admin web config
│       └── package.json          # Vite build config
```

## Environment Variables

### Required Environment Variables

Set these in Vercel Dashboard → Project Settings → Environment Variables:

#### Backend API
- `DATABASE_URL`: PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database?sslmode=require`
- `API_PREFIX`: API route prefix (default: `/v1`)
  - Note: Vercel routes `/api/*` to the backend, so full path is `/api/v1/*`
- `CORS_ORIGIN`: Comma-separated list of allowed origins
  - Example: `https://your-admin-app.vercel.app,https://yourdomain.com`
  - Use `*` to allow all origins (not recommended for production)
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_EXPIRES_IN`: JWT expiration time (e.g., `7d`, `24h`)

#### Optional Backend Variables
- `REDIS_URL`: Redis connection string (if using Redis)
- `AWS_ACCESS_KEY_ID`: AWS access key (if using S3)
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `AWS_S3_BUCKET`: S3 bucket name
- `FIREBASE_PROJECT_ID`: Firebase project ID (if using Firebase)
- `FIREBASE_PRIVATE_KEY`: Firebase private key
- `FIREBASE_CLIENT_EMAIL`: Firebase client email

#### Admin Web
- `VITE_API_URL`: Backend API base URL
  - Production: `https://your-backend.vercel.app/api`
  - Development: `http://localhost:3000/api/v1`

### Environment-Specific Setup

1. **Production**: Set all variables in Vercel Dashboard
2. **Preview**: Vercel automatically uses production env vars (can override)
3. **Development**: Use `.env` files locally

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository
   - Select the root directory

2. **Configure Project**
   - **Framework Preset**: Other
   - **Root Directory**: `/` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `packages/admin-web/dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables**
   - Add all required environment variables (see above)
   - Ensure `VITE_API_URL` points to your backend URL

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Project** (first time only)
   ```bash
   cd /path/to/Lifeset
   vercel link
   ```
   - Follow prompts to link to existing project or create new one

4. **Set Environment Variables**
   ```bash
   # Set production variables
   vercel env add DATABASE_URL production
   vercel env add API_PREFIX production
   vercel env add CORS_ORIGIN production
   vercel env add JWT_SECRET production
   vercel env add VITE_API_URL production
   # ... add other variables as needed
   ```

5. **Deploy**
   ```bash
   # Deploy to production
   vercel --prod
   
   # Or deploy preview
   vercel
   ```

## Build Process

### Backend Build
1. `prisma generate` - Generates Prisma Client
2. `nest build` - Compiles NestJS application
3. Vercel packages the `api/index.ts` handler as a serverless function

### Admin Web Build
1. `npm install` - Installs dependencies
2. `vite build` - Builds React app to `dist/`
3. Vercel serves static files from `dist/`

## Routing

### Backend API Routes
- All requests to `/api/*` are routed to `packages/backend/api/index.ts`
- API prefix is `/v1` (configurable via `API_PREFIX`)
- Full API path: `/api/v1/*`
- Swagger docs: `/api/v1/docs`

### Admin Web Routes
- All other routes (`/*`) serve the admin web app
- React Router handles client-side routing
- SPA fallback: all routes serve `index.html`

## Prisma in Serverless

Prisma Client is automatically generated during:
- `npm install` (via `postinstall` script)
- `npm run build` (explicitly in build script)

The generated Prisma Client is included in the serverless function bundle.

## Troubleshooting

### Build Failures

1. **Prisma Generation Fails**
   - Ensure `DATABASE_URL` is set (even if migrations aren't run)
   - Check Prisma schema is valid: `npx prisma validate`

2. **TypeScript Errors**
   - Run `npm run build` locally to catch errors
   - Check `tsconfig.json` paths are correct

3. **Missing Dependencies**
   - Ensure all dependencies are in `package.json`
   - Check for peer dependency warnings

### Runtime Errors

1. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Check database allows connections from Vercel IPs
   - Ensure SSL is enabled: `?sslmode=require`

2. **CORS Errors**
   - Verify `CORS_ORIGIN` includes your admin web URL
   - Check browser console for specific CORS errors

3. **API Not Found (404)**
   - Verify `VITE_API_URL` in admin web points to correct backend
   - Check Vercel function logs for routing issues

### Function Timeout

- Default timeout: 10 seconds (Hobby plan)
- Pro plan: 60 seconds
- Enterprise: 300 seconds
- Consider optimizing slow endpoints or upgrading plan

## Monitoring

1. **Function Logs**
   - Vercel Dashboard → Project → Functions → View Logs
   - Or use CLI: `vercel logs`

2. **Analytics**
   - Enable Vercel Analytics in dashboard
   - Monitor function invocations and errors

## Post-Deployment

1. **Verify Backend**
   - Visit: `https://your-project.vercel.app/api/v1/docs`
   - Should see Swagger documentation

2. **Verify Admin Web**
   - Visit: `https://your-project.vercel.app`
   - Should load admin interface
   - Check browser console for API connection

3. **Test API Endpoints**
   ```bash
   curl https://your-project.vercel.app/api/v1/health
   ```

## Custom Domain

1. Add domain in Vercel Dashboard → Settings → Domains
2. Update DNS records as instructed
3. Update `CORS_ORIGIN` to include custom domain
4. Update `VITE_API_URL` if needed

## CI/CD

Vercel automatically deploys on:
- Push to main branch → Production
- Pull requests → Preview deployments

Configure in `.vercel/project.json` or Vercel Dashboard.

## Cost Considerations

- **Hobby Plan**: Free, 100GB bandwidth, 100 hours function execution
- **Pro Plan**: $20/month, unlimited bandwidth, better performance
- Monitor function invocations and execution time

## Security Notes

1. **Environment Variables**: Never commit secrets
2. **CORS**: Restrict `CORS_ORIGIN` in production
3. **Database**: Use connection pooling for serverless
4. **Rate Limiting**: Consider adding rate limits for API endpoints
5. **SSL**: Vercel provides SSL certificates automatically

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Serverless](https://docs.nestjs.com/faq/serverless)
- [Prisma Serverless](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
