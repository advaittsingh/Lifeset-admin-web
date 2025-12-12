# Quick Deployment Guide

## Fastest Way: Vercel (5 minutes)

### Option A: Using Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Navigate to admin-web:**
   ```bash
   cd packages/admin-web
   ```

3. **Login to Vercel:**
   ```bash
   vercel login
   ```

4. **Deploy:**
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked for project settings, use:
     - Framework: Vite
     - Root Directory: `./` (current directory)
     - Build Command: `npm run build`
     - Output Directory: `dist`

5. **Set Environment Variable:**
   ```bash
   vercel env add VITE_API_URL
   ```
   - Enter your backend API URL (e.g., `https://api.lifeset.co.in/api/v1`)

6. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

### Option B: Using GitHub + Vercel (Recommended)

1. **Push your code to GitHub** (if not already done)

2. **Go to [vercel.com](https://vercel.com)** and sign in

3. **Click "Add New Project"**

4. **Import your GitHub repository**

5. **Configure Project:**
   - **Root Directory:** Click "Edit" and set to `packages/admin-web`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build` (auto-filled)
   - **Output Directory:** `dist` (auto-filled)
   - **Install Command:** `npm install` (auto-filled)

6. **Add Environment Variable:**
   - Click "Environment Variables"
   - Add `VITE_API_URL` with your backend API URL
   - Value: `https://your-backend-api.com/api/v1`

7. **Click "Deploy"**

8. **Done!** Your admin panel will be live in ~2 minutes

---

## Alternative: Netlify (5 minutes)

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Navigate and build:**
   ```bash
   cd packages/admin-web
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Set environment variable:**
   - Go to Netlify dashboard → Site settings → Environment variables
   - Add `VITE_API_URL` with your backend API URL

---

## Docker Quick Deploy

```bash
cd packages/admin-web

# Build
docker build -t lifeset-admin-web .

# Run
docker run -d \
  -p 8080:80 \
  -e VITE_API_URL=https://your-backend-api.com/api/v1 \
  --name lifeset-admin \
  lifeset-admin-web
```

Access at: `http://localhost:8080`

---

## Important Notes

1. **Backend API URL:** Make sure your backend API has CORS enabled for your admin panel domain

2. **Environment Variables:** 
   - Must be set before building (for Vercel/Netlify, set in dashboard)
   - For Docker, pass via `-e` flag or `.env` file

3. **Custom Domain:**
   - Vercel: Project Settings → Domains
   - Netlify: Site settings → Domain management
   - Docker: Configure reverse proxy (nginx/traefik)

4. **SSL/HTTPS:**
   - Vercel & Netlify: Automatic
   - Docker: Use Let's Encrypt with certbot

---

## Troubleshooting

**Build fails?**
- Check Node.js version (needs 20+)
- Run `npm install` in `packages/admin-web`
- Check for TypeScript errors: `npm run build`

**CORS errors?**
- Ensure backend allows your admin panel domain
- Check backend CORS configuration

**404 on page refresh?**
- Ensure SPA routing is configured (Vercel/Netlify auto-handle this)
- For Docker, nginx.conf is already configured

**Environment variables not working?**
- Rebuild after setting variables
- For Vite, variables must start with `VITE_`
- Check browser console for actual API URL being used

---

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)





















