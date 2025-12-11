# LifeSet Platform

A comprehensive educational and career management platform connecting students, educational institutions, recruiters, and administrators.

## Architecture

This is a monorepo containing:

- **backend** - NestJS API server with Prisma ORM, PostgreSQL, Redis, and BullMQ
- **admin-web** - React + Vite admin panel with Tailwind CSS and Shadcn/UI
- **mobile-app** - React Native + Expo mobile application
- **shared** - Shared TypeScript types and utilities

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 15
- Redis >= 7
- Docker (optional, for containerized deployment)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

Run all packages in development mode:

```bash
npm run dev
```

Run specific package:

```bash
npm run backend:dev
npm run admin:dev
npm run mobile:dev
```

### Build

Build all packages:

```bash
npm run build
```

### Environment Setup

Each package has its own `.env` file. See individual package READMEs for configuration details.

## Project Structure

```
.
├── packages/
│   ├── backend/          # NestJS backend
│   ├── admin-web/        # React admin panel
│   ├── mobile-app/       # React Native app
│   └── shared/           # Shared types
├── package.json
├── turbo.json
└── README.md
```

## Documentation

- [Master Task List](./Master_Task%20List.md) - Complete development task breakdown
- [Project Documentation (New Stack)](./PROJECT_DOCUMENTATION_NEW_STACK.md) - Technical documentation

## License

Proprietary

