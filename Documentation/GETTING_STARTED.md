# LifeSet Platform - Getting Started Guide

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 15
- Redis >= 7
- Docker (optional)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**

   Backend (`.env` in `packages/backend/`):
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/lifeset
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-refresh-secret
   ```

3. **Setup Database**
   ```bash
   cd packages/backend
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start Development Servers**

   All packages:
   ```bash
   npm run dev
   ```

   Individual packages:
   ```bash
   npm run backend:dev    # Backend API (port 3000)
   npm run admin:dev      # Admin Panel (port 5173)
   npm run mobile:dev     # Mobile App (Expo)
   ```

### Docker Setup

```bash
docker-compose up -d
```

This will start:
- Backend API on port 3000
- PostgreSQL on port 5432
- Redis on port 6379

## 📚 Documentation

- [Master Task List](./Master_Task%20List.md) - Complete task breakdown
- [Project Documentation](./PROJECT_DOCUMENTATION_NEW_STACK.md) - Technical docs
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Progress tracking
- [Final Status](./FINAL_STATUS.md) - Completion summary

## 🏗️ Project Structure

```
lifeset-platform/
├── packages/
│   ├── backend/         # NestJS API
│   ├── admin-web/       # React Admin Panel
│   ├── mobile-app/      # React Native App
│   └── shared/          # Shared Types
├── docker-compose.yml
└── .github/workflows/
```

## 🔗 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:3000/api/v1/docs

## 📱 Mobile App

```bash
cd packages/mobile-app
npm install
npm start
```

Scan QR code with Expo Go app.

## 🖥️ Admin Panel

```bash
cd packages/admin-web
npm install
npm run dev
```

Visit: http://localhost:5173

## ✅ Next Steps

1. Configure environment variables
2. Run database migrations
3. Start development servers
4. Test API endpoints
5. Build mobile app
6. Deploy to production

---

**Happy Coding! 🎉**

