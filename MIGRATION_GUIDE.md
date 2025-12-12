# Migration Guide: Monorepo to Standalone Projects

This guide explains the changes made when converting from a monorepo setup to standalone projects.

## What Changed

The monorepo has been split into three separate standalone projects:

1. **backend-standalone/** - Backend API (NestJS)
2. **admin-web-standalone/** - Admin Panel (React + Vite)
3. **mobile-app-standalone/** - Mobile App (React Native + Expo)

## Key Changes

### Backend

- **Shared Types Integration**: The `@lifeset/shared` package has been integrated directly into the backend at `src/shared/`
- **Import Updates**: All imports from `@lifeset/shared` have been changed to `@/shared`
- **Package Name**: Changed from `@lifeset/backend` to `lifeset-backend`
- **Dependencies**: Removed `@lifeset/shared` dependency from package.json

### Admin Web

- **Package Name**: Changed from `@lifeset/admin-web` to `lifeset-admin-web`
- **No Shared Dependencies**: This project didn't use the shared package, so no changes needed

### Mobile App

- **Package Name**: Changed from `@lifeset/mobile-app` to `lifeset-mobile-app`
- **No Shared Dependencies**: This project didn't use the shared package, so no changes needed

## Next Steps

1. **Install Dependencies**: For each standalone project, run:
   ```bash
   cd backend-standalone && npm install
   cd ../admin-web-standalone && npm install
   cd ../mobile-app-standalone && npm install
   ```

2. **Update Environment Variables**: Each project may need its own `.env` file. Copy from the original locations if they exist.

3. **Test Each Project**: Verify that each project works independently:
   - Backend: `npm run dev`
   - Admin Web: `npm run dev`
   - Mobile App: `npm start`

4. **Deployment**: Each project can now be deployed independently to different services.

## File Structure

```
Lifeset/
├── backend-standalone/     # Standalone backend
│   ├── src/
│   │   ├── shared/        # Integrated shared types
│   │   └── ...            # Other modules
│   └── package.json
├── admin-web-standalone/   # Standalone admin panel
│   ├── src/
│   └── package.json
├── mobile-app-standalone/  # Standalone mobile app
│   ├── src/
│   └── package.json
└── packages/              # Original monorepo (can be removed after verification)
```

## Important Notes

- The original `packages/` directory is still present for reference. You can remove it after verifying the standalone projects work correctly.
- Each project is now completely independent and can be moved to separate repositories if desired.
- The shared types are now duplicated in the backend. If you need them in other projects, you can copy them or publish as a separate npm package.

