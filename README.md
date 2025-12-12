<<<<<<< HEAD
# LifeSet Platform

A comprehensive educational and career management platform connecting students, educational institutions, recruiters, and administrators.

## Architecture

This repository contains three standalone projects:

- **backend-standalone/** - NestJS API server with Prisma ORM, PostgreSQL, Redis, and BullMQ
- **admin-web-standalone/** - React + Vite admin panel with Tailwind CSS and Shadcn/UI
- **mobile-app-standalone/** - React Native + Expo mobile application

Each project is completely independent and can be developed, deployed, and maintained separately.

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 15
- Redis >= 7
- Docker (optional, for containerized deployment)

## Getting Started

### Backend

```bash
cd backend-standalone
npm install
npm run dev
```

See [backend-standalone/README.md](./backend-standalone/README.md) for detailed setup instructions.

### Admin Web

```bash
cd admin-web-standalone
npm install
npm run dev
```

See [admin-web-standalone/README.md](./admin-web-standalone/README.md) for detailed setup instructions.

### Mobile App

```bash
cd mobile-app-standalone
npm install
npm start
```

See [mobile-app-standalone/README.md](./mobile-app-standalone/README.md) for detailed setup instructions.

## Project Structure

```
.
├── backend-standalone/     # Standalone NestJS backend
├── admin-web-standalone/   # Standalone React admin panel
├── mobile-app-standalone/  # Standalone React Native app
├── Documentation/         # Project documentation
└── README.md
```

## Migration from Monorepo

If you're migrating from the previous monorepo setup, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for details.

## Documentation

- [Migration Guide](./MIGRATION_GUIDE.md) - Guide for migrating from monorepo
- [Standalone Projects Summary](./STANDALONE_PROJECTS_SUMMARY.md) - Quick reference
- [Verification Checklist](./VERIFICATION_CHECKLIST.md) - Verification status
- [Documentation](./Documentation/) - Additional project documentation

## License

Proprietary
=======
# LifeSet Admin Web

Standalone admin panel web application for the LifeSet Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API endpoint
```

3. Start the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter

## Project Structure

- `src/` - Source code
  - `components/` - React components
  - `pages/` - Page components
  - `services/` - API services
  - `store/` - State management

## Notes

This is a standalone version of the admin web application, previously part of a monorepo.
>>>>>>> 965371f (Initial commit: lifeset-admin-web standalone project)
