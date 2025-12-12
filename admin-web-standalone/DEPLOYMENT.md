# Admin Panel Deployment Guide

This guide covers multiple deployment options for the LifeSet Admin Panel.

## Prerequisites

1. Ensure your backend API is deployed and accessible
2. Have the backend API URL ready
3. Node.js 20+ installed (for local builds)

## Environment Variables

Create a `.env` file in `packages/admin-web/` with:

```env
VITE_API_URL=https://your-backend-api.com/api/v1
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest option for React/Vite applications.

#### Steps:

1. **Install Vercel CLI** (optional, you can also use the web interface):
   ```bash
   npm i -g vercel
   ```

2. **Deploy from the admin-web directory**:
   ```bash
   cd packages/admin-web
   vercel
   ```

3. **Set environment variables**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add `VITE_API_URL` with your backend API URL

4. **Configure build settings**:
   - Root Directory: `packages/admin-web`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Deploy**:
   ```bash
   vercel --prod
   ```

#### Using GitHub Integration:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure:
   - Root Directory: `packages/admin-web`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variable `VITE_API_URL`
6. Deploy

---

### Option 2: Netlify

#### Steps:

1. **Install Netlify CLI** (optional):
   ```bash
   npm i -g netlify-cli
   ```

2. **Build the project**:
   ```bash
   cd packages/admin-web
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Set environment variables**:
   - Go to Site settings → Environment variables
   - Add `VITE_API_URL` with your backend API URL
   - Redeploy after adding variables

#### Using GitHub Integration:

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Add new site from Git
4. Select your repository
5. Configure:
   - Base directory: `packages/admin-web`
   - Build command: `npm run build`
   - Publish directory: `packages/admin-web/dist`
6. Add environment variable `VITE_API_URL`
7. Deploy

---

### Option 3: Docker Deployment

#### Build and Run Locally:

```bash
cd packages/admin-web

# Build the Docker image
docker build -t lifeset-admin-web .

# Run the container
docker run -p 8080:80 \
  -e VITE_API_URL=https://your-backend-api.com/api/v1 \
  lifeset-admin-web
```

#### Using Docker Compose:

```bash
cd packages/admin-web

# Create .env file with your API URL
echo "VITE_API_URL=https://your-backend-api.com/api/v1" > .env

# Build and run
docker-compose up -d
```

The admin panel will be available at `http://localhost:8080`

#### Deploy to Cloud with Docker:

**AWS ECS / Google Cloud Run / Azure Container Instances:**

1. Build and push to a container registry:
   ```bash
   docker build -t your-registry/lifeset-admin-web .
   docker push your-registry/lifeset-admin-web
   ```

2. Deploy using your cloud provider's container service
3. Set environment variable `VITE_API_URL` in your cloud console

---

### Option 4: GitHub Pages

#### Steps:

1. **Install gh-pages**:
   ```bash
   cd packages/admin-web
   npm install --save-dev gh-pages
   ```

2. **Update package.json**:
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/lifeset-admin"
   }
   ```

3. **Build and deploy**:
   ```bash
   npm run deploy
   ```

4. **Configure GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`

**Note:** GitHub Pages serves static files, so you'll need to ensure your backend API has CORS enabled for your GitHub Pages domain.

---

### Option 5: Traditional Web Hosting (cPanel, etc.)

#### Steps:

1. **Build the project**:
   ```bash
   cd packages/admin-web
   npm run build
   ```

2. **Upload files**:
   - Upload all files from the `dist` folder to your web hosting's `public_html` or `www` directory

3. **Configure environment**:
   - Since environment variables can't be set at runtime, you'll need to:
     - Either hardcode the API URL in the build (not recommended)
     - Or use a build script that injects the API URL

4. **Create .htaccess** (for Apache servers):
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

---

## Post-Deployment Checklist

- [ ] Verify the admin panel loads correctly
- [ ] Test login functionality
- [ ] Verify API calls are working (check browser console)
- [ ] Test all major features
- [ ] Set up SSL/HTTPS (if not automatically done)
- [ ] Configure custom domain (if needed)
- [ ] Set up monitoring/analytics
- [ ] Test on different browsers and devices

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure your backend API has CORS configured to allow requests from your admin panel domain.

### Environment Variables Not Working

- Vite requires environment variables to be prefixed with `VITE_`
- Rebuild the application after changing environment variables
- For Vercel/Netlify, ensure variables are set in the platform's dashboard

### Routing Issues (404 on refresh)

- Ensure your hosting provider is configured to serve `index.html` for all routes
- Check that redirect rules are properly configured

### Build Failures

- Ensure Node.js version is 20 or higher
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

## Support

For issues or questions, please refer to the main project documentation or contact the development team.





















