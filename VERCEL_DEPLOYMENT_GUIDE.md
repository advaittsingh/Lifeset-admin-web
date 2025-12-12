# Vercel Deployment Guide - Separate Projects

This guide walks you through deploying the backend and admin panel as **separate Vercel projects** with subdomain routing.

## Overview

- **Backend Project**: Handles all API requests (e.g., `api.yourdomain.com` or `backend-project.vercel.app`)
- **Admin Panel Project**: Serves the React admin interface (e.g., `admin.yourdomain.com` or `admin-project.vercel.app`)

## Prerequisites

1. Vercel account (sign up at [vercel.com](https://vercel.com))
2. GitHub/GitLab/Bitbucket repository with your code
3. PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.)
4. Redis instance (Upstash, Redis Cloud, etc.) - optional but recommended
5. Domain name (optional - can use Vercel URLs)

## Step 1: Deploy Backend Project

### 1.1 Create Backend Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your repository
4. Configure the project:
   - **Project Name**: `lifeset-backend` (or your preferred name)
   - **Root Directory**: `backend-standalone`
   - **Framework Preset**: `Other`
   - **Build Command**: `npm run build`
   - **Output Directory**: (leave empty - not needed for serverless)
   - **Install Command**: `npm install`

### 1.2 Configure Environment Variables

Go to **Settings** → **Environment Variables** and add:

**Required:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - A secure random string (min 32 characters)
- `REDIS_HOST` - Your Redis hostname
- `REDIS_PORT` - Redis port (usually `6379`)

**Important for CORS:**
- `CORS_ORIGIN` - Your admin panel URL(s), comma-separated:
  - If using Vercel URLs: `https://admin-project.vercel.app`
  - If using custom domain: `https://admin.yourdomain.com`
  - Multiple: `https://admin.yourdomain.com,https://admin-project.vercel.app`

**Optional:**
- `API_PREFIX` - Set to `/v1` (default)
- `NODE_ENV` - Set to `production`

See [VERCEL_DEPLOYMENT_ENV_VARIABLES.md](./VERCEL_DEPLOYMENT_ENV_VARIABLES.md) for complete list.

### 1.3 Deploy Backend

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Note your backend URL: `https://backend-project.vercel.app` (or custom domain)

### 1.4 Verify Backend Deployment

1. Visit: `https://your-backend-url.vercel.app/v1/docs` (Swagger docs)
2. Test an endpoint: `https://your-backend-url.vercel.app/v1/health` (if available)
3. Check Vercel logs for any errors

## Step 2: Deploy Admin Panel Project

### 2.1 Create Admin Panel Vercel Project

1. In Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Import the same repository
3. Configure the project:
   - **Project Name**: `lifeset-admin` (or your preferred name)
   - **Root Directory**: `admin-web-standalone`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### 2.2 Configure Environment Variables

Go to **Settings** → **Environment Variables** and add:

**Required:**
- `VITE_API_URL` - Your backend API URL:
  - If using Vercel URLs: `https://backend-project.vercel.app/v1`
  - If using custom domain: `https://api.yourdomain.com/v1`

**Note:** The admin panel will auto-detect subdomain routing if `VITE_API_URL` is not set, but it's recommended to set it explicitly.

### 2.3 Deploy Admin Panel

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Note your admin panel URL: `https://admin-project.vercel.app` (or custom domain)

### 2.4 Verify Admin Panel Deployment

1. Visit your admin panel URL
2. Check browser console for any errors
3. Try logging in (if authentication is set up)
4. Verify API calls are working

## Step 3: Configure Custom Domains (Optional)

If you want to use custom domains instead of Vercel URLs:

### 3.1 Add Domain to Backend Project

1. Go to Backend project → **Settings** → **Domains**
2. Add domain: `api.yourdomain.com`
3. Follow DNS configuration instructions:
   - Add CNAME record: `api` → `cname.vercel-dns.com`
4. Update `CORS_ORIGIN` environment variable to include: `https://admin.yourdomain.com`

### 3.2 Add Domain to Admin Panel Project

1. Go to Admin Panel project → **Settings** → **Domains**
2. Add domain: `admin.yourdomain.com`
3. Follow DNS configuration instructions:
   - Add CNAME record: `admin` → `cname.vercel-dns.com`
4. Update `VITE_API_URL` environment variable to: `https://api.yourdomain.com/v1`

### 3.3 Update Environment Variables

**Backend:**
- Update `CORS_ORIGIN`: `https://admin.yourdomain.com`

**Admin Panel:**
- Update `VITE_API_URL`: `https://api.yourdomain.com/v1`

**Redeploy both projects** after updating environment variables.

## Step 4: Testing

### 4.1 Test Backend

```bash
# Test Swagger docs
curl https://api.yourdomain.com/v1/docs

# Test health endpoint (if available)
curl https://api.yourdomain.com/v1/health
```

### 4.2 Test Admin Panel

1. Open admin panel in browser
2. Open browser DevTools → Network tab
3. Try logging in or making API calls
4. Verify:
   - API calls go to correct backend URL
   - No CORS errors
   - Authentication works
   - Data loads correctly

### 4.3 Test CORS

If you see CORS errors:
1. Check `CORS_ORIGIN` in backend includes your admin panel URL
2. Verify URLs match exactly (including `https://`)
3. Check browser console for specific CORS error messages

## Troubleshooting

### Backend Issues

**Problem: "JWT_SECRET is not configured"**
- Solution: Add `JWT_SECRET` environment variable in backend project

**Problem: "Database connection error"**
- Solution: Verify `DATABASE_URL` is correct and accessible from Vercel

**Problem: "CORS error"**
- Solution: Add admin panel URL to `CORS_ORIGIN` in backend project

**Problem: "Function timeout"**
- Solution: Increase `maxDuration` in `backend-standalone/vercel.json` (currently 30s)

### Admin Panel Issues

**Problem: "Cannot connect to API"**
- Solution: Verify `VITE_API_URL` is set correctly
- Check backend is deployed and accessible
- Verify backend URL in browser

**Problem: "Network Error"**
- Solution: Check browser console for detailed error
- Verify CORS is configured correctly
- Check backend logs in Vercel

**Problem: "Build fails"**
- Solution: Check build logs in Vercel
- Verify all dependencies are in `package.json`
- Check for TypeScript errors

### General Issues

**Problem: Changes not reflecting**
- Solution: Environment variables require redeployment
- Vite variables (`VITE_*`) are embedded at build time
- Redeploy after changing environment variables

**Problem: Slow API responses**
- Solution: Check Vercel function logs
- Consider upgrading Vercel plan for better performance
- Optimize database queries

## Project Structure Reference

```
Lifeset/
├── backend-standalone/
│   ├── vercel.json          # Backend Vercel config
│   ├── api/
│   │   └── index.ts         # Serverless function entry
│   └── src/                 # NestJS source code
│
├── admin-web-standalone/
│   ├── vercel.json          # Admin panel Vercel config
│   └── src/
│       └── services/
│           └── api/
│               └── client.ts # API client (auto-detects subdomain)
│
└── vercel.json              # Deprecated (kept for reference)
```

## Next Steps

1. Set up monitoring and logging
2. Configure CI/CD for automatic deployments
3. Set up staging environments
4. Configure custom error pages
5. Set up analytics (if needed)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Deployment](https://docs.nestjs.com/faq/serverless)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Environment Variables Guide](./VERCEL_DEPLOYMENT_ENV_VARIABLES.md)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console (for admin panel)
3. Verify all environment variables are set
4. Review this guide and troubleshooting section
5. Check project-specific README files:
   - [backend-standalone/README.md](./backend-standalone/README.md)
   - [admin-web-standalone/README.md](./admin-web-standalone/README.md)

