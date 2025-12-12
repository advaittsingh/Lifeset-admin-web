# Running Admin Panel on Localhost

This guide will help you run the LifeSet Admin Panel on your local machine.

## Quick Start

### Option 1: Using the Startup Script (Easiest)

```bash
cd packages/admin-web
./start-local.sh
```

This script will:
- Create `.env` file if it doesn't exist
- Install dependencies if needed
- Start the development server

### Option 2: Manual Setup

1. **Navigate to admin-web directory:**
   ```bash
   cd packages/admin-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:3000/api/v1" > .env
   ```
   
   Or manually create `.env` file with:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - The admin panel will be available at: **http://localhost:5173**
   - The terminal will show the exact URL

## Prerequisites

1. **Node.js 20+** installed
   ```bash
   node --version  # Should be 20 or higher
   ```

2. **Backend API running**
   - Make sure your backend is running on `http://localhost:3000`
   - Or update `VITE_API_URL` in `.env` to match your backend URL

## Configuration

### Environment Variables

Create a `.env` file in `packages/admin-web/`:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api/v1
```

**Common configurations:**

- Local backend (default): `http://localhost:3000/api/v1`
- Different port: `http://localhost:4000/api/v1`
- Remote backend: `https://api.yourdomain.com/api/v1`
- Docker backend: `http://localhost:3000/api/v1` (if port is mapped)

### Changing the Port

If port 5173 is already in use, Vite will automatically try the next available port. You can also specify a port in `vite.config.ts`:

```typescript
server: {
  port: 5174, // or any other port
},
```

## Running Production Build Locally

To test the production build locally:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Preview the build:**
   ```bash
   npm run preview
   ```

   This will start a local server (usually on port 4173) serving the production build.

## Troubleshooting

### Port Already in Use

If port 5173 is busy:
- Vite will automatically use the next available port
- Check the terminal output for the actual URL
- Or change the port in `vite.config.ts`

### Backend Connection Issues

1. **Check if backend is running:**
   ```bash
   curl http://localhost:3000/api/v1/health
   # or check your backend logs
   ```

2. **Verify CORS settings:**
   - Make sure your backend allows requests from `http://localhost:5173`
   - Check backend CORS configuration

3. **Check environment variable:**
   ```bash
   # In packages/admin-web directory
   cat .env
   # Should show: VITE_API_URL=http://localhost:3000/api/v1
   ```

### Dependencies Issues

If you encounter dependency errors:

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

If the build fails:

```bash
# Check TypeScript errors
npm run build

# Check for linting errors
npm run lint
```

## Development Workflow

1. **Start backend** (in a separate terminal):
   ```bash
   cd packages/backend
   npm run dev
   ```

2. **Start admin panel** (in another terminal):
   ```bash
   cd packages/admin-web
   npm run dev
   ```

3. **Access admin panel:**
   - Open http://localhost:5173 in your browser
   - Login with your admin credentials

## Hot Reload

The development server supports hot module replacement (HMR):
- Changes to React components will update instantly
- No need to refresh the page
- State is preserved during updates

## Browser Support

The admin panel works best on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Next Steps

Once running locally:
1. Login with your admin credentials
2. Test all features
3. Make changes and see them update in real-time
4. When ready, deploy using the deployment guides

## Need Help?

- Check the main [README.md](./README.md)
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Check backend logs if API calls fail





















