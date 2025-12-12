# 🚀 Start Admin Panel on Localhost

## Quick Start (3 Steps)

### 1. Navigate to admin-web directory
```bash
cd packages/admin-web
```

### 2. Install dependencies (if not already installed)
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

That's it! The admin panel will be available at:
👉 **http://localhost:5173**

---

## Using the Startup Script

For automatic setup, use the provided script:

```bash
cd packages/admin-web
./start-local.sh
```

This script will:
- ✅ Create `.env` file automatically
- ✅ Install dependencies if needed
- ✅ Start the dev server

---

## Environment Configuration

The admin panel needs to know where your backend API is running.

**Default:** `http://localhost:3000/api/v1`

If your backend is running on a different URL, create a `.env` file:

```bash
cd packages/admin-web
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env
```

Or edit `.env` manually:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

**Common scenarios:**
- Backend on port 3000: `http://localhost:3000/api/v1` ✅ (default)
- Backend on port 4000: `http://localhost:4000/api/v1`
- Remote backend: `https://api.yourdomain.com/api/v1`

---

## Prerequisites

1. **Node.js 20+** installed
   ```bash
   node --version  # Should show 20.x or higher
   ```

2. **Backend API running**
   - Make sure your backend is running
   - Default backend URL: `http://localhost:3000`

---

## Troubleshooting

### Port 5173 already in use?
- Vite will automatically use the next available port
- Check the terminal for the actual URL

### Backend connection errors?
1. Make sure backend is running: `curl http://localhost:3000/api/v1/health`
2. Check `.env` file has correct `VITE_API_URL`
3. Verify backend CORS allows `http://localhost:5173`

### Dependencies not installing?
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## What's Next?

Once running:
1. Open http://localhost:5173 in your browser
2. Login with your admin credentials
3. Start managing your platform!

For more details, see [LOCAL_HOST.md](./LOCAL_HOST.md)





















