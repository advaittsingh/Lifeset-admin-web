# LifeSet Admin Panel

React admin panel built with Vite, Tailwind CSS, and Shadcn/UI.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
# Set VITE_API_URL to your backend URL
```

3. Start development server:
```bash
npm run dev
```

Visit http://localhost:5173

## Features

- User management
- Feed management
- Job management
- CMS content management
- Analytics dashboard
- Institutes management
- Monitoring and analytics
- And more...

## Build

```bash
npm run build
```

The build output will be in the `dist` directory.

## Deployment

The admin panel can be deployed to various platforms. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy Options:

**Vercel (Recommended):**
```bash
npm i -g vercel
cd packages/admin-web
vercel --prod
```

**Netlify:**
```bash
npm i -g netlify-cli
cd packages/admin-web
npm run build
netlify deploy --prod --dir=dist
```

**Docker:**
```bash
cd packages/admin-web
docker build -t lifeset-admin-web .
docker run -p 8080:80 -e VITE_API_URL=https://your-api.com/api/v1 lifeset-admin-web
```

**Quick Deploy Script:**
```bash
cd packages/admin-web
./deploy.sh
```

For more deployment options and detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: `http://localhost:3000/api/v1`)

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

