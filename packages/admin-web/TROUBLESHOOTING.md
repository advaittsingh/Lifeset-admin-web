# Troubleshooting Guide

## Network Error on Login

If you see a "Network Error" on the admin panel login page, it usually means the backend API is not running.

### Quick Fix

1. **Start the backend server:**
   ```bash
   cd packages/backend
   npm run dev
   ```

2. **Verify backend is running:**
   - Backend should be on: `http://localhost:3000`
   - Check: `curl http://localhost:3000/api/v1/health`

3. **Refresh the admin panel:**
   - The admin panel should automatically reconnect once the backend is running

### Common Issues

#### Backend Not Running
- **Symptom:** Network Error on login page
- **Solution:** Start backend with `npm run dev` in `packages/backend`

#### Wrong API URL
- **Symptom:** Network Error persists even with backend running
- **Solution:** Check `.env` file in `packages/admin-web`:
  ```env
  VITE_API_URL=http://localhost:3000/api/v1
  ```
- **Note:** After changing `.env`, restart the admin panel dev server

#### Port Conflicts
- **Symptom:** Backend fails to start
- **Solution:** 
  - Check if port 3000 is in use: `lsof -ti:3000`
  - Kill the process: `kill -9 $(lsof -ti:3000)`
  - Or change backend port in `packages/backend/src/main.ts`

#### CORS Errors
- **Symptom:** Network Error in browser console with CORS message
- **Solution:** Ensure backend CORS is configured to allow `http://localhost:5173`

### Verification Steps

1. **Check backend status:**
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

2. **Check admin panel API URL:**
   - Open browser console (F12)
   - Look for network requests
   - Verify they're going to `http://localhost:3000/api/v1`

3. **Check both are running:**
   ```bash
   # Backend (should show process)
   lsof -ti:3000
   
   # Admin Panel (should show process)
   lsof -ti:5173
   ```

### Starting Both Services

**Terminal 1 - Backend:**
```bash
cd packages/backend
npm run dev
```

**Terminal 2 - Admin Panel:**
```bash
cd packages/admin-web
npm run dev
```

### Still Having Issues?

1. Check backend logs for errors
2. Check admin panel browser console for detailed error messages
3. Verify database connection (if backend needs database)
4. Check firewall/antivirus blocking localhost connections





















