# Vercel Deployment Environment Variables

This document outlines all environment variables needed for deploying the backend and admin panel as separate Vercel projects.

## Backend Project Environment Variables

Configure these in your **Backend Vercel Project** settings:

### Required Variables

| Variable | Description | Example | Notes |
|---------|-------------|---------|-------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` | Required for database access |
| `JWT_SECRET` | Secret key for JWT token signing | `your-secret-key-here` | Required for authentication |
| `REDIS_HOST` | Redis server hostname | `redis.example.com` or `localhost` | Required for queue/cache |
| `REDIS_PORT` | Redis server port | `6379` | Default: 6379 |

### Optional but Recommended Variables

| Variable | Description | Example | Notes |
|---------|-------------|---------|-------|
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `https://admin.yourdomain.com,https://admin-project.vercel.app` | **Important**: Set this to your admin panel URL(s) |
| `API_PREFIX` | API route prefix | `/v1` | Default: `/v1` |
| `NODE_ENV` | Environment mode | `production` | Set to `production` for production |
| `PORT` | Server port | `3000` | Usually not needed for Vercel serverless |

### Additional Backend Variables

These may be needed depending on your setup:

- `AWS_ACCESS_KEY_ID` - For AWS S3 file uploads
- `AWS_SECRET_ACCESS_KEY` - For AWS S3 file uploads
- `AWS_REGION` - AWS region
- `AWS_S3_BUCKET` - S3 bucket name
- `FIREBASE_PROJECT_ID` - For Firebase integration
- `FIREBASE_PRIVATE_KEY` - For Firebase integration
- `FIREBASE_CLIENT_EMAIL` - For Firebase integration
- `OPENAI_API_KEY` - For personality service (if used)
- `WHATSAPP_API_KEY` - For referral service (if used)
- `WHATSAPP_API_URL` - WhatsApp API endpoint

## Admin Panel Project Environment Variables

Configure these in your **Admin Panel Vercel Project** settings:

### Required Variables

| Variable | Description | Example | Notes |
|---------|-------------|---------|-------|
| `VITE_API_URL` | Backend API URL | `https://api.yourdomain.com/v1` or `https://backend-project.vercel.app/v1` | **Required**: Full URL to backend API |

### Optional Variables

| Variable | Description | Example | Notes |
|---------|-------------|---------|-------|
| `NODE_ENV` | Environment mode | `production` | Set to `production` for production builds |

## Environment Variable Setup Instructions

### For Backend Project:

1. Go to your Backend Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable listed above
4. For `CORS_ORIGIN`, include:
   - Your admin panel Vercel URL: `https://admin-project.vercel.app`
   - Your custom admin domain (if using): `https://admin.yourdomain.com`
   - Separate multiple origins with commas: `https://admin.yourdomain.com,https://admin-project.vercel.app`

### For Admin Panel Project:

1. Go to your Admin Panel Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add `VITE_API_URL` with your backend URL:
   - If using Vercel URLs: `https://backend-project.vercel.app/v1`
   - If using custom domain: `https://api.yourdomain.com/v1`

## Important Notes

### CORS Configuration

- The backend allows all origins by default if `CORS_ORIGIN` is not set
- **For production**, always set `CORS_ORIGIN` to your specific admin panel URL(s)
- Multiple origins can be comma-separated: `https://admin.domain.com,https://admin-project.vercel.app`

### API URL Configuration

- The admin panel will auto-detect subdomain routing if `VITE_API_URL` is not set
- If your admin panel is at `admin.yourdomain.com`, it will automatically use `api.yourdomain.com`
- For explicit control, always set `VITE_API_URL` in the admin panel project

### Vite Environment Variables

- Admin panel uses Vite, so environment variables must be prefixed with `VITE_`
- Variables are embedded at build time, not runtime
- After changing `VITE_API_URL`, you need to rebuild the admin panel

## Example Configurations

### Using Vercel URLs (No Custom Domain)

**Backend Project:**
```
CORS_ORIGIN=https://admin-project.vercel.app
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```

**Admin Panel Project:**
```
VITE_API_URL=https://backend-project.vercel.app/v1
```

### Using Custom Domains

**Backend Project:**
```
CORS_ORIGIN=https://admin.yourdomain.com
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
REDIS_HOST=your-redis-host
REDIS_PORT=6379
```

**Admin Panel Project:**
```
VITE_API_URL=https://api.yourdomain.com/v1
```

## Security Best Practices

1. **Never commit environment variables** to version control
2. **Use Vercel's environment variable encryption** - variables are encrypted at rest
3. **Set different values for different environments** (Production, Preview, Development)
4. **Rotate secrets regularly**, especially `JWT_SECRET`
5. **Use strong, random values** for `JWT_SECRET` (minimum 32 characters)
6. **Restrict CORS origins** in production - don't use `*` in production

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check that `CORS_ORIGIN` in backend includes your admin panel URL
2. Ensure URLs match exactly (including `https://` and no trailing slashes)
3. Verify credentials are enabled (already configured in code)

### API Connection Errors

If admin panel can't connect to backend:
1. Verify `VITE_API_URL` is set correctly in admin panel project
2. Check that backend URL is accessible (test in browser)
3. Ensure backend is deployed and running
4. Check browser console for detailed error messages

### Build Errors

If builds fail:
1. Verify all required environment variables are set
2. Check that `DATABASE_URL` is valid and accessible
3. Ensure `JWT_SECRET` is set (backend won't start without it)
4. Check Vercel build logs for specific error messages

