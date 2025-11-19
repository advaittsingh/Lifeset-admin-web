# LifeSet Backend API

NestJS backend API for LifeSet Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Setup database:
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

4. Start development server:
```bash
npm run dev
```

## API Documentation

Visit http://localhost:3000/api/v1/docs for Swagger documentation.

## Modules

- **Auth** - Authentication and authorization
- **Users** - User management and networking
- **Profiles** - Profile management
- **Feeds** - Feed/post system
- **MCQ** - MCQ and GK system
- **Notifications** - Push notifications
- **Performance** - Scorecard and badges
- **Chat** - Messaging system
- **Jobs** - Job posting and applications
- **Institutes** - College and course management
- **Referral** - Referral system
- **Analytics** - Event tracking
- **Queue** - Background job processing
- **Ads** - Advertisement management
- **CMS** - Content management
- And more...

## Testing

```bash
npm run test
npm run test:e2e
```

