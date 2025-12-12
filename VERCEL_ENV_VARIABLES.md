# Vercel Environment Variables for Production

This document lists all environment variables that need to be configured in your Vercel project settings for the LifeSet application to work in production.

## 🔴 Critical (Required for Basic Functionality)

These variables MUST be set for the application to work:

### Database
```bash
DATABASE_URL=postgresql://username:password@host:5432/database?schema=public
```
**Action Required:** 
- Set up a production PostgreSQL database (e.g., Vercel Postgres, Neon, Supabase, or Railway)
- Replace `username`, `password`, `host`, and `database` with your actual production database credentials
- **DO NOT use localhost URLs** - they won't work in production

### Authentication
```bash
JWT_SECRET=<generate-a-secure-random-string>
JWT_REFRESH_SECRET=<generate-a-different-secure-random-string>
```
**Action Required:**
- Generate two different secure random strings (at least 32 characters)
- You can generate them using: `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- **CRITICAL:** Never commit these secrets to version control
- Use different values for JWT_SECRET and JWT_REFRESH_SECRET

### Redis (Optional but Recommended)
```bash
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```
**Action Required:**
- Set up a production Redis instance (e.g., Upstash Redis, Redis Cloud, or Railway Redis)
- If using Upstash Redis (recommended for Vercel):
  - Get your Redis URL from Upstash dashboard
  - Parse it: `redis://default:password@host:port` → REDIS_HOST=host, REDIS_PORT=port, REDIS_PASSWORD=password
- If Redis is not available, the app will continue but some features (caching, rate limiting, real-time features) will be limited

### Environment
```bash
NODE_ENV=production
```
**Action Required:**
- Must be set to `production` for deployed environments

### CORS
```bash
CORS_ORIGIN=https://lifeset.vercel.app,https://app.lifeset.co.in
```
**Action Required:**
- Add all domains that will access your API
- Include your Vercel deployment URL
- Separate multiple origins with commas (no spaces)

## 🟡 Important (Required for Full Functionality)

### API Configuration
```bash
API_PREFIX=/v1
PORT=3080
```
**Note:** PORT is typically ignored in serverless environments, but API_PREFIX should be `/v1` (not `/api/v1`) as Vercel routing already handles `/api`

## 🟢 Optional (Feature-Specific)

These are only needed if you're using specific features:

### AWS S3 (File Uploads)
```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=lifeset-uploads
```

### Firebase (Push Notifications)
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### Razorpay (Payments)
```bash
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### SMS Gateway
```bash
SMS_API_KEY=your-sms-api-key
SMS_API_URL=https://api.smsprovider.com
```

### Email (SMTP)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### OpenAI (AI Features)
```bash
OPENAI_API_KEY=sk-your-openai-key
```

### JWT Expiration (Optional - has defaults)
```bash
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Rate Limiting (Optional - has defaults)
```bash
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

## 📋 Quick Setup Checklist for Vercel

1. ✅ Set up production PostgreSQL database
   - [ ] Create database instance
   - [ ] Copy connection string
   - [ ] Set `DATABASE_URL` in Vercel

2. ✅ Generate and set JWT secrets
   - [ ] Generate `JWT_SECRET`: `openssl rand -base64 32`
   - [ ] Generate `JWT_REFRESH_SECRET`: `openssl rand -base64 32`
   - [ ] Set both in Vercel

3. ✅ Set up production Redis (optional but recommended)
   - [ ] Create Redis instance (Upstash recommended)
   - [ ] Extract connection details
   - [ ] Set `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` in Vercel

4. ✅ Set environment variables
   - [ ] Set `NODE_ENV=production`
   - [ ] Set `CORS_ORIGIN` with your domains
   - [ ] Set `API_PREFIX=/v1`

5. ✅ Run database migrations
   - [ ] Connect to production database
   - [ ] Run: `npx prisma migrate deploy`
   - [ ] Generate Prisma client if needed

6. ✅ Test the deployment
   - [ ] Verify API endpoints work
   - [ ] Test authentication
   - [ ] Check logs in Vercel dashboard

## 🚨 Common Issues & Solutions

### "A server error has occurred"
- **Cause:** Missing or incorrect `DATABASE_URL` or `JWT_SECRET`
- **Fix:** Ensure both are set correctly in Vercel environment variables

### Database connection errors
- **Cause:** `DATABASE_URL` pointing to localhost or incorrect credentials
- **Fix:** Use a production database connection string

### Redis connection errors
- **Cause:** Redis pointing to localhost or incorrect credentials
- **Fix:** Update `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` with production values
- **Note:** The app will continue to work without Redis, but with limited functionality

### CORS errors
- **Cause:** Frontend domain not in `CORS_ORIGIN`
- **Fix:** Add your frontend domain to `CORS_ORIGIN` (comma-separated)

## 📝 How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Name:** The variable name (e.g., `DATABASE_URL`)
   - **Value:** The variable value
   - **Environment:** Select `Production`, `Preview`, and/or `Development` as needed
4. Click **Save**
5. **Important:** Redeploy your application after adding/updating environment variables

## 🔐 Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong, unique secrets** for JWT_SECRET and JWT_REFRESH_SECRET
3. **Rotate secrets regularly** especially if exposed
4. **Use environment-specific values** (different secrets for dev/staging/prod)
5. **Limit access** to environment variables in Vercel team settings
6. **Use Vercel's built-in secret management** instead of hardcoding

## 📚 Recommended Services for Production

- **Database:** Vercel Postgres, Neon, Supabase, Railway, AWS RDS
- **Redis:** Upstash Redis, Redis Cloud, Railway Redis
- **File Storage:** AWS S3, Cloudflare R2, Vercel Blob Storage
- **Email:** SendGrid, Mailgun, Resend, AWS SES
- **SMS:** Twilio, AWS SNS

