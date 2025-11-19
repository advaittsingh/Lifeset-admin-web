# LifeSet Platform - Complete Project Documentation (Modern Stack)

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Directory Structure](#directory-structure)
5. [Database Schema](#database-schema)
6. [API Architecture](#api-architecture)
7. [Services & Modules](#services--modules)
8. [Authentication & Authorization](#authentication--authorization)
9. [Key Features](#key-features)
10. [API Endpoints](#api-endpoints)
11. [Mobile App Architecture](#mobile-app-architecture)
12. [Admin Panel Architecture](#admin-panel-architecture)
13. [Third-Party Integrations](#third-party-integrations)
14. [Background Jobs & Queues](#background-jobs--queues)
15. [Analytics & Monitoring](#analytics--monitoring)
16. [AI Integration](#ai-integration)
17. [Configuration](#configuration)
18. [Deployment](#deployment)
19. [CI/CD Pipeline](#cicd-pipeline)
20. [Development Guidelines](#development-guidelines)

---

## Project Overview

**LifeSet** is a comprehensive educational and career management platform that connects students, educational institutions (colleges/institutes), recruiters/companies, and administrators. The platform facilitates job postings, student profiles, educational content, exams, quizzes, social interactions, and communication between various stakeholders.

### Core Purpose
- **Student Management**: Profile creation, job applications, exam participation, project submissions
- **College/Institute Management**: Course management, student enrollment, faculty management
- **Recruiter/Company Management**: Job postings, candidate shortlisting, student profile viewing
- **Content Management**: Wall posts, FAQs, news, galleries, notifications
- **Communication**: Real-time chat system between students and recruiters
- **Assessment**: Exams, quizzes, reviews, personality tests, surveys
- **AI-Powered Features**: Intelligent job matching, profile recommendations, automated responses

### User Types
1. **Students** - Primary users who create profiles, apply for jobs, take exams
2. **Colleges/Institutes** - Educational institutions managing courses and students
3. **Companies/Recruiters** - Organizations posting jobs and recruiting students
4. **Administrators** - System administrators managing the entire platform
5. **AMS (Admission Management System) Users** - Specialized users for admission management
6. **Faculty Members** - College faculty managing students and courses

---

## Technology Stack

### Backend
- **NestJS** (TypeScript) - Progressive Node.js framework for building efficient and scalable server-side applications
- **Prisma ORM** - Next-generation ORM for type-safe database access
- **PostgreSQL** - Advanced open-source relational database
- **Redis** - In-memory data structure store for caching and session management
- **BullMQ** - High-performance job queue system for background processing
- **Firebase Admin SDK** - Server-side Firebase integration for push notifications

### Mobile App
- **React Native** - Cross-platform mobile application framework
- **Expo** - Development platform and toolchain for React Native
- **TypeScript** - Type-safe JavaScript for better code quality
- **AdMob** - Mobile advertising platform integration
- **React Native Push Notifications** - Push notification handling
- **React Native Contact Picker** - Contact integration for referrals

### Admin Panel
- **React** - UI library for building user interfaces
- **Vite** - Next-generation frontend build tool
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality component library
- **Recharts** - Composable charting library for analytics

### Cloud & Infrastructure
- **Docker** - Containerization platform
- **Docker Compose** - Multi-container Docker application management
- **S3 Storage** - Object storage for files and media
- **NGINX** - High-performance web server and reverse proxy

### CI/CD
- **GitHub Actions** - Automated CI/CD pipeline

### Analytics
- **PostgreSQL Events** - Database-level event tracking
- **Redis Counters** - Real-time counter metrics
- **ClickHouse** (Future Phase) - Column-oriented database for analytics

### AI Services
- **OpenAI API** - GPT models for intelligent features
- **Llama** - Open-source LLM integration
- **Mistral AI** - Alternative AI service provider
- **Node Services** - Dedicated AI service layer

---

## Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Mobile App   │  │ Admin Panel  │  │  Public Web  │         │
│  │ (React       │  │ (React+Vite) │  │   (Future)   │         │
│  │  Native)     │  │              │  │              │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼─────────────────┼──────────────────┼──────────────────┘
           │                 │                  │
           └─────────────────┴──────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NGINX Reverse Proxy                         │
│              (Load Balancing, SSL Termination)                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NestJS API Gateway                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Auth Module  │  │ Users Module │  │ Posts Module │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Chat Module  │  │ Jobs Module  │  │ CMS Module   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ AI Module    │  │ Queue Module │  │ File Module  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ PostgreSQL   │  │    Redis     │  │  BullMQ      │
│   Database   │  │   (Cache +   │  │  (Job Queue) │
│              │  │   Sessions)  │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   S3 Storage │  │   Firebase   │  │   OpenAI/     │         │
│  │              │  │   Admin SDK  │  │   Llama/Mist │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Razorpay   │  │  SMS Gateway │  │ Email Service│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### NestJS Module Architecture

The application follows **Modular Architecture** pattern:

```
AppModule (Root)
├── AuthModule
│   ├── JWT Strategy
│   ├── Local Strategy
│   ├── Google OAuth Strategy
│   └── Refresh Token Strategy
├── UsersModule
│   ├── Students Service
│   ├── Companies Service
│   ├── Colleges Service
│   └── Admins Service
├── PostsModule
│   ├── Wall Posts Service
│   ├── Job Posts Service
│   ├── Exam Posts Service
│   └── Quiz Posts Service
├── ChatModule
│   ├── Chat Service
│   ├── WebSocket Gateway
│   └── Message Service
├── JobsModule
│   ├── Job Posting Service
│   ├── Application Service
│   └── Shortlisting Service
├── ProjectsModule
│   ├── Project Service
│   └── Portfolio Service
├── NotificationsModule
│   ├── Notification Service
│   ├── Push Notification Service
│   └── Email Notification Service
├── PaymentModule
│   ├── Razorpay Service
│   └── Credit Management Service
├── CMSModule
│   ├── Pages Service
│   ├── News Service
│   └── Gallery Service
├── FileModule
│   ├── S3 Upload Service
│   └── Image Processing Service
├── QueueModule
│   ├── Email Queue
│   ├── SMS Queue
│   ├── Notification Queue
│   └── Analytics Queue
├── AIServiceModule
│   ├── OpenAI Service
│   ├── Job Matching Service
│   └── Recommendation Service
└── AnalyticsModule
    ├── Event Tracking Service
    ├── Counter Service
    └── Reporting Service
```

### Request Flow

1. **Client Request** → NGINX Reverse Proxy
2. **NGINX** → Routes to NestJS API Gateway
3. **NestJS Middleware Stack**:
   - CORS Middleware
   - Helmet (Security)
   - Rate Limiting
   - Authentication Guard
   - Authorization Guard
   - Validation Pipe
4. **Controller** → Receives request, validates input
5. **Service** → Business logic execution
6. **Repository/Prisma** → Database operations
7. **Response** → Returns JSON response
8. **Background Jobs** → Queue tasks via BullMQ if needed

### Data Flow

```
Request → Controller → Service → Repository → Prisma → PostgreSQL
                                                      ↓
Response ← Controller ← Service ← Repository ← Prisma ← PostgreSQL
```

---

## Directory Structure

### Backend (NestJS)

```
backend/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   │
│   ├── common/                          # Shared utilities
│   │   ├── decorators/                  # Custom decorators
│   │   │   ├── roles.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   └── public.decorator.ts
│   │   ├── filters/                     # Exception filters
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/                      # Auth guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── refresh-token.guard.ts
│   │   ├── interceptors/                # Interceptors
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── pipes/                       # Validation pipes
│   │   │   └── validation.pipe.ts
│   │   ├── interfaces/                  # TypeScript interfaces
│   │   └── constants/                   # Constants
│   │
│   ├── config/                          # Configuration
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── s3.config.ts
│   │   ├── firebase.config.ts
│   │   └── app.config.ts
│   │
│   ├── auth/                            # Authentication Module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── local.strategy.ts
│   │   │   ├── google.strategy.ts
│   │   │   └── refresh-token.strategy.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   └── guards/
│   │
│   ├── users/                           # Users Module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── students/
│   │   │   ├── students.controller.ts
│   │   │   ├── students.service.ts
│   │   │   └── dto/
│   │   ├── companies/
│   │   │   ├── companies.controller.ts
│   │   │   ├── companies.service.ts
│   │   │   └── dto/
│   │   ├── colleges/
│   │   │   ├── colleges.controller.ts
│   │   │   ├── colleges.service.ts
│   │   │   └── dto/
│   │   └── admins/
│   │       ├── admins.controller.ts
│   │       ├── admins.service.ts
│   │       └── dto/
│   │
│   ├── posts/                           # Posts Module
│   │   ├── posts.module.ts
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   ├── wall-posts/
│   │   ├── job-posts/
│   │   ├── exam-posts/
│   │   ├── quiz-posts/
│   │   └── dto/
│   │
│   ├── chat/                            # Chat Module
│   │   ├── chat.module.ts
│   │   ├── chat.controller.ts
│   │   ├── chat.service.ts
│   │   ├── chat.gateway.ts              # WebSocket Gateway
│   │   ├── messages/
│   │   └── dto/
│   │
│   ├── jobs/                            # Jobs Module
│   │   ├── jobs.module.ts
│   │   ├── jobs.controller.ts
│   │   ├── jobs.service.ts
│   │   ├── applications/
│   │   └── dto/
│   │
│   ├── projects/                        # Projects Module
│   │   ├── projects.module.ts
│   │   ├── projects.controller.ts
│   │   ├── projects.service.ts
│   │   └── dto/
│   │
│   ├── notifications/                   # Notifications Module
│   │   ├── notifications.module.ts
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   ├── push-notification.service.ts
│   │   └── dto/
│   │
│   ├── payments/                        # Payments Module
│   │   ├── payments.module.ts
│   │   ├── payments.controller.ts
│   │   ├── payments.service.ts
│   │   ├── razorpay.service.ts
│   │   └── dto/
│   │
│   ├── cms/                             # CMS Module
│   │   ├── cms.module.ts
│   │   ├── cms.controller.ts
│   │   ├── cms.service.ts
│   │   ├── pages/
│   │   ├── news/
│   │   └── gallery/
│   │
│   ├── files/                           # File Upload Module
│   │   ├── files.module.ts
│   │   ├── files.controller.ts
│   │   ├── files.service.ts
│   │   ├── s3.service.ts
│   │   └── image-processing.service.ts
│   │
│   ├── queue/                           # Queue Module
│   │   ├── queue.module.ts
│   │   ├── processors/
│   │   │   ├── email.processor.ts
│   │   │   ├── sms.processor.ts
│   │   │   └── notification.processor.ts
│   │   └── queues/
│   │
│   ├── ai/                              # AI Services Module
│   │   ├── ai.module.ts
│   │   ├── ai.service.ts
│   │   ├── openai.service.ts
│   │   ├── job-matching.service.ts
│   │   └── recommendation.service.ts
│   │
│   └── analytics/                       # Analytics Module
│       ├── analytics.module.ts
│       ├── analytics.controller.ts
│       ├── analytics.service.ts
│       ├── event-tracking.service.ts
│       └── counter.service.ts
│
├── prisma/
│   ├── schema.prisma                    # Prisma schema
│   ├── migrations/                      # Database migrations
│   └── seed.ts                          # Database seeding
│
├── test/                                # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

### Mobile App (React Native)

```
mobile-app/
├── src/
│   ├── App.tsx                          # App entry point
│   ├── app.json                         # Expo configuration
│   │
│   ├── navigation/                      # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   │
│   ├── screens/                         # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── home/
│   │   │   ├── DashboardScreen.tsx
│   │   │   └── WallScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── EditProfileScreen.tsx
│   │   ├── jobs/
│   │   │   ├── JobListScreen.tsx
│   │   │   └── JobDetailScreen.tsx
│   │   ├── chat/
│   │   │   ├── ChatListScreen.tsx
│   │   │   └── ChatDetailScreen.tsx
│   │   └── exams/
│   │       ├── ExamListScreen.tsx
│   │       └── ExamDetailScreen.tsx
│   │
│   ├── components/                      # Reusable components
│   │   ├── common/
│   │   ├── forms/
│   │   └── cards/
│   │
│   ├── services/                        # API services
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── posts.api.ts
│   │   │   └── chat.api.ts
│   │   ├── storage/
│   │   │   └── async-storage.service.ts
│   │   └── notifications/
│   │       └── push-notification.service.ts
│   │
│   ├── hooks/                           # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useNotifications.ts
│   │
│   ├── store/                           # State management (Redux/Zustand)
│   │   ├── slices/
│   │   │   ├── auth.slice.ts
│   │   │   └── posts.slice.ts
│   │   └── store.ts
│   │
│   ├── utils/                           # Utility functions
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   └── constants.ts
│   │
│   └── types/                           # TypeScript types
│       ├── user.types.ts
│       ├── post.types.ts
│       └── api.types.ts
│
├── assets/                              # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── .env.example
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

### Admin Panel (React + Vite)

```
admin-panel/
├── src/
│   ├── main.tsx                         # Entry point
│   ├── App.tsx                          # Root component
│   │
│   ├── routes/                          # Route definitions
│   │   ├── index.tsx
│   │   └── routes.tsx
│   │
│   ├── pages/                           # Page components
│   │   ├── auth/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── users/
│   │   │   ├── UsersListPage.tsx
│   │   │   └── UserDetailPage.tsx
│   │   ├── posts/
│   │   │   ├── PostsListPage.tsx
│   │   │   └── PostEditPage.tsx
│   │   ├── cms/
│   │   │   ├── PagesPage.tsx
│   │   │   ├── NewsPage.tsx
│   │   │   └── GalleryPage.tsx
│   │   └── analytics/
│   │       └── AnalyticsPage.tsx
│   │
│   ├── components/                      # Reusable components
│   │   ├── ui/                          # Shadcn/UI components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   └── charts/                      # Recharts components
│   │
│   ├── services/                        # API services
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── endpoints.ts
│   │   └── auth/
│   │       └── auth.service.ts
│   │
│   ├── hooks/                           # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useQuery.ts
│   │
│   ├── store/                           # State management
│   │   ├── slices/
│   │   └── store.ts
│   │
│   ├── utils/                           # Utilities
│   │   ├── formatters.ts
│   │   └── validators.ts
│   │
│   └── types/                           # TypeScript types
│
├── public/
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## Database Schema

### Prisma Schema Overview

The database schema is defined using Prisma Schema Language. Key models include:

### User Management Models

```prisma
model User {
  id            String   @id @default(uuid())
  email         String?  @unique
  mobile        String?  @unique
  password      String
  userType      UserType
  isActive      Boolean  @default(true)
  isVerified    Boolean  @default(false)
  profileImage  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  studentProfile    StudentProfile?
  companyProfile   CompanyProfile?
  collegeProfile   CollegeProfile?
  adminProfile     AdminProfile?
  amsProfile       AmsProfile?

  // Activity tracking
  sessions         Session[]
  notifications    Notification[]
  posts            Post[]
  chatMessages     ChatMessage[]
  applications     JobApplication[]

  @@index([email])
  @@index([mobile])
  @@index([userType])
}

enum UserType {
  STUDENT
  COMPANY
  COLLEGE
  ADMIN
  AMS
  FACULTY
}

model StudentProfile {
  id              String   @id @default(uuid())
  userId          String   @unique
  firstName       String
  lastName        String
  dateOfBirth     DateTime?
  gender          String?
  address         String?
  city            String?
  state           String?
  pincode         String?
  profileImage    String?
  voiceRecording  String?
  profileScore    Int      @default(0)
  collegeId       String?
  courseId        String?
  
  // Education
  education10th   Json?
  education12th   Json?
  graduation      Json?
  postGraduation  Json?

  // Skills
  technicalSkills String[]
  softSkills      String[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  college         College? @relation(fields: [collegeId], references: [id])
  course          Course?  @relation(fields: [courseId], references: [id])
  projects        Project[]
  experiences     Experience[]

  @@index([collegeId])
  @@index([courseId])
}

model CompanyProfile {
  id              String   @id @default(uuid())
  userId          String   @unique
  companyName     String
  industry        String?
  website         String?
  address         String?
  city            String?
  state           String?
  logo            String?
  description     String?
  credits         Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobPosts        JobPost[]
  creditHistory   CreditTransaction[]
}

model CollegeProfile {
  id              String   @id @default(uuid())
  userId          String   @unique
  collegeName     String
  address         String?
  city            String?
  state           String?
  logo            String?
  accreditation   String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  courses         Course[]
  students        StudentProfile[]
}
```

### Posts & Content Models

```prisma
model Post {
  id            String      @id @default(uuid())
  userId        String
  title         String
  description   String      @db.Text
  postType      PostType
  categoryId    String?
  images        String[]
  isActive      Boolean     @default(true)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  user          User        @relation(fields: [userId], references: [id])
  category      WallCategory? @relation(fields: [categoryId], references: [id])
  
  // Interactions
  likes         PostLike[]
  comments      PostComment[]
  bookmarks     PostBookmark[]
  interests     PostInterest[]
  applications  JobApplication[]
  
  // Post-specific data
  jobPost       JobPost?
  examPost      ExamPost?
  quizPost      QuizPost?
  reviewPost    ReviewPost?

  @@index([userId])
  @@index([postType])
  @@index([categoryId])
  @@index([createdAt])
}

enum PostType {
  JOB
  EXAM
  QUIZ
  REVIEW
  PERSONALITY_TEST
  SURVEY
  FAQ
  GENERAL
}

model JobPost {
  id              String   @id @default(uuid())
  postId          String   @unique
  jobTitle        String
  jobDescription  String   @db.Text
  location        String?
  salaryMin       Float?
  salaryMax       Float?
  experience      String?
  skills          String[]
  applicationDeadline DateTime?
  views           Int      @default(0)
  applications    Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  post            Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  jobApplications JobApplication[]
  viewActivities  JobViewActivity[]
}

model ExamPost {
  id              String   @id @default(uuid())
  postId          String   @unique
  examDate        DateTime?
  duration        Int?     // in minutes
  totalMarks      Int?
  passingMarks    Int?
  questions       Json     // Array of questions
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  post            Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  examAttempts    ExamAttempt[]
}

model QuizPost {
  id              String   @id @default(uuid())
  postId          String   @unique
  questions       Json     // Array of quiz questions
  totalScore      Int?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  post            Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  quizAttempts    QuizAttempt[]
}
```

### Communication Models

```prisma
model ChatMessage {
  id          String      @id @default(uuid())
  senderId    String
  receiverId  String
  message     String      @db.Text
  messageType String      @default("text") // text, image, file
  isRead      Boolean     @default(false)
  readAt      DateTime?
  createdAt   DateTime    @default(now())

  sender      User        @relation("SentMessages", fields: [senderId], references: [id])
  receiver    User        @relation("ReceivedMessages", fields: [receiverId], references: [id])

  @@index([senderId, receiverId])
  @@index([createdAt])
}

model ChatInvitation {
  id          String      @id @default(uuid())
  senderId    String
  receiverId  String
  status      String      @default("pending") // pending, accepted, rejected
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  sender      User        @relation("SentInvitations", fields: [senderId], references: [id])
  receiver    User        @relation("ReceivedInvitations", fields: [receiverId], references: [id])

  @@unique([senderId, receiverId])
}

model Notification {
  id          String      @id @default(uuid())
  userId      String
  title       String
  message     String      @db.Text
  type        String      // job, chat, exam, system
  isRead      Boolean     @default(false)
  readAt      DateTime?
  createdAt   DateTime    @default(now())

  user        User        @relation(fields: [userId], references: [id])

  @@index([userId, isRead])
  @@index([createdAt])
}
```

### Educational Models

```prisma
model College {
  id              String   @id @default(uuid())
  name            String
  code            String?  @unique
  address         String?
  city            String?
  state           String?
  universityId    String?
  accreditation   String?
  logo            String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  university      University? @relation(fields: [universityId], references: [id])
  courses         Course[]
  students        StudentProfile[]
  sections        CollegeSection[]
}

model Course {
  id              String   @id @default(uuid())
  collegeId       String?
  categoryId      String?
  name            String
  code            String?
  duration        String?
  description     String?  @db.Text
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  college         College? @relation(fields: [collegeId], references: [id])
  category        CourseCategory? @relation(fields: [categoryId], references: [id])
  students        StudentProfile[]
  assignments     CourseAssignment[]
}

model CourseCategory {
  id          String    @id @default(uuid())
  name        String
  description String?   @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  courses     Course[]
}
```

### Payment Models

```prisma
model PaymentTransaction {
  id              String      @id @default(uuid())
  userId          String
  amount          Float
  currency        String      @default("INR")
  paymentMethod   String      // razorpay, etc.
  status          String      // pending, completed, failed
  razorpayOrderId String?
  razorpayPaymentId String?
  metadata        Json?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user            User        @relation(fields: [userId], references: [id])
  creditTransaction CreditTransaction?

  @@index([userId])
  @@index([status])
}

model CreditTransaction {
  id              String      @id @default(uuid())
  companyId       String
  amount          Int         // Credits added/deducted
  transactionType String      // purchase, deduction, refund
  description     String?
  paymentId       String?     @unique
  createdAt       DateTime    @default(now())

  company         CompanyProfile @relation(fields: [companyId], references: [id])
  payment         PaymentTransaction? @relation(fields: [paymentId], references: [id])

  @@index([companyId])
}
```

### Analytics Models

```prisma
model EventLog {
  id          String      @id @default(uuid())
  userId      String?
  eventType   String      // job_view, profile_view, application, etc.
  entityType  String?     // job, user, post
  entityId    String?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime    @default(now())

  @@index([userId, eventType])
  @@index([createdAt])
  @@index([entityType, entityId])
}

model Counter {
  id          String      @id @default(uuid())
  key         String      @unique
  value       Int         @default(0)
  updatedAt   DateTime    @updatedAt

  @@index([key])
}
```

---

## API Architecture

### RESTful API Design

All APIs follow RESTful conventions with versioning:

```
/api/v1/auth/login
/api/v1/auth/register
/api/v1/users/profile
/api/v1/posts
/api/v1/jobs
/api/v1/chat
```

### Response Format

Standard JSON response structure:

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00Z"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### API Versioning

- URL-based versioning: `/api/v1/`, `/api/v2/`
- Header-based versioning (optional): `Accept: application/vnd.lifeset.v1+json`

### Rate Limiting

- Global rate limit: 100 requests per minute per IP
- Authenticated users: 1000 requests per minute
- Specific endpoints may have custom limits

### CORS Configuration

- Allowed origins: Configured via environment variables
- Credentials: Enabled for authenticated requests
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS

---

## Services & Modules

### Auth Service

**Responsibilities**:
- User authentication (JWT, OAuth)
- Password hashing and validation
- Token generation and refresh
- Session management via Redis

**Key Methods**:
- `login(credentials)` - Authenticate user
- `register(userData)` - Register new user
- `refreshToken(token)` - Refresh access token
- `logout(userId)` - Invalidate tokens
- `validateToken(token)` - Validate JWT token

### Users Service

**Responsibilities**:
- User profile management
- Profile completion tracking
- User search and filtering
- Profile updates

**Key Methods**:
- `getProfile(userId)` - Get user profile
- `updateProfile(userId, data)` - Update profile
- `calculateProfileScore(userId)` - Calculate completion score
- `searchUsers(query, filters)` - Search users

### Posts Service

**Responsibilities**:
- Wall post creation and management
- Post interactions (like, comment, bookmark)
- Post filtering and search
- Post analytics

**Key Methods**:
- `createPost(userId, postData)` - Create new post
- `getPosts(filters, pagination)` - Get posts list
- `likePost(userId, postId)` - Like/unlike post
- `commentOnPost(userId, postId, comment)` - Add comment
- `bookmarkPost(userId, postId)` - Bookmark post

### Chat Service

**Responsibilities**:
- Real-time messaging via WebSocket
- Chat history management
- Message delivery status
- Chat invitations

**Key Methods**:
- `sendMessage(senderId, receiverId, message)` - Send message
- `getChatHistory(userId1, userId2)` - Get chat history
- `getChatList(userId)` - Get user's chat list
- `sendInvitation(senderId, receiverId)` - Send chat invitation
- `markAsRead(userId, messageId)` - Mark message as read

### Jobs Service

**Responsibilities**:
- Job posting management
- Job application processing
- Candidate shortlisting
- Job analytics

**Key Methods**:
- `createJobPost(companyId, jobData)` - Create job post
- `applyForJob(studentId, jobId)` - Apply for job
- `shortlistCandidate(companyId, applicationId)` - Shortlist candidate
- `getJobAnalytics(jobId)` - Get job analytics

### Notifications Service

**Responsibilities**:
- Notification creation and delivery
- Push notification sending
- Email notification sending
- Notification preferences

**Key Methods**:
- `createNotification(userId, notificationData)` - Create notification
- `sendPushNotification(userId, notification)` - Send push notification
- `sendEmailNotification(userId, emailData)` - Send email
- `getNotifications(userId, filters)` - Get user notifications
- `markAsRead(userId, notificationId)` - Mark as read

### File Service

**Responsibilities**:
- File upload to S3
- Image processing and optimization
- File validation
- File URL generation

**Key Methods**:
- `uploadFile(file, options)` - Upload file to S3
- `uploadImage(image, options)` - Upload and process image
- `deleteFile(fileKey)` - Delete file from S3
- `getFileUrl(fileKey)` - Get signed URL

### Queue Service

**Responsibilities**:
- Background job management
- Email queue processing
- SMS queue processing
- Notification queue processing

**Key Methods**:
- `addEmailJob(emailData)` - Queue email job
- `addSMSJob(smsData)` - Queue SMS job
- `addNotificationJob(notificationData)` - Queue notification job

### AI Service

**Responsibilities**:
- Job matching using AI
- Profile recommendations
- Automated responses
- Content generation

**Key Methods**:
- `matchJobs(studentId)` - Match jobs for student
- `recommendStudents(jobId)` - Recommend students for job
- `generateResponse(context)` - Generate AI response
- `analyzeProfile(userId)` - Analyze user profile

---

## Authentication & Authorization

### Authentication Methods

1. **JWT (JSON Web Tokens)**
   - Access tokens (short-lived: 15 minutes)
   - Refresh tokens (long-lived: 7 days)
   - Stored in HTTP-only cookies or Authorization header

2. **OAuth 2.0**
   - Google OAuth integration
   - Social login support

3. **OTP Verification**
   - SMS-based OTP for registration
   - Email OTP for password reset
   - OTP stored in Redis with expiration

### Token Structure

```typescript
// Access Token Payload
{
  sub: "user-id",
  email: "user@example.com",
  userType: "STUDENT",
  roles: ["USER"],
  iat: 1234567890,
  exp: 1234567890
}
```

### Authorization Levels

#### Role-Based Access Control (RBAC)

```typescript
enum Role {
  STUDENT = 'STUDENT',
  COMPANY = 'COMPANY',
  COLLEGE = 'COLLEGE',
  ADMIN = 'ADMIN',
  AMS = 'AMS',
  FACULTY = 'FACULTY'
}
```

#### Permission-Based Access Control

- Fine-grained permissions for specific actions
- Permissions stored in database
- Checked via guards and decorators

### Guards

- `JwtAuthGuard` - Validates JWT token
- `RolesGuard` - Checks user roles
- `PermissionsGuard` - Checks specific permissions

### Session Management

- Sessions stored in Redis
- Session expiration: 24 hours (configurable)
- Automatic session refresh on activity

---

## Key Features

### 1. Student Profile Management

**Implementation**:
- Multi-step profile creation with validation
- Real-time profile completion score calculation
- Education details (10th, 12th, graduation, post-graduation)
- Skills management with autocomplete
- Project portfolio with media uploads
- Voice recording for profile introduction
- Profile PDF generation using AI

**AI Integration**:
- Profile completion suggestions
- Skill recommendations based on industry trends
- Profile optimization tips

### 2. Job Management

**Implementation**:
- Job posting with rich text editor
- Advanced job search and filtering
- Job application tracking
- Application status updates
- Candidate shortlisting
- Job view analytics
- Automated email notifications

**AI Integration**:
- Intelligent job matching based on profile
- Resume parsing and analysis
- Application ranking and scoring

### 3. Wall System (LifeSet Wall)

**Post Types**:
- Job Posts
- Exam Posts
- Quiz Posts
- Review Posts
- Personality Tests
- Surveys
- FAQ Posts

**Interactions**:
- Like/Unlike (real-time updates)
- Bookmark
- Share
- Comment (nested comments)
- Interested/Applied

**Features**:
- Categorized wall posts
- Bulk upload via CSV
- Post analytics
- Trending posts algorithm

### 4. Exam & Assessment System

**Implementation**:
- Exam creation with question bank
- Interactive quiz system
- Review-based assessments
- Personality tests
- Surveys
- Score tracking and analytics
- Saved exams for later

**AI Integration**:
- Question generation
- Answer evaluation
- Performance analysis and recommendations

### 5. Communication System

**Real-time Chat**:
- WebSocket-based real-time messaging
- Student-Recruiter chat
- Student-Student chat
- Chat invitations
- Message status (sent, delivered, read)
- Typing indicators
- File sharing in chat

**Features**:
- Chat history with pagination
- Search within conversations
- Message reactions
- Chat backup and export

### 6. Project Management

**Implementation**:
- Project submission with media
- Detailed project information
- Experience tracking
- Project portfolio showcase
- Project recommendations

### 7. Notification System

**Channels**:
- In-app notifications
- Push notifications (Firebase)
- Email notifications
- SMS notifications (optional)

**Types**:
- Job application updates
- New job matches
- Chat messages
- Exam reminders
- System announcements

**Features**:
- Notification preferences
- Batch notifications
- Notification history
- Unread count tracking

### 8. Payment System

**Implementation**:
- Razorpay integration
- Credit-based system for recruiters
- Payment history
- Invoice generation
- Refund processing

**Features**:
- Multiple payment methods
- Payment webhooks
- Transaction tracking
- Credit balance management

### 9. Content Management System (CMS)

**Features**:
- Page management with WYSIWYG editor
- Page categories
- News article management
- Image gallery with categories
- Video gallery
- Homepage slider management
- FAQ management

### 10. Analytics & Reporting

**Tracking**:
- PostgreSQL event logging
- Redis counter metrics
- User activity tracking
- Job view analytics
- Profile view analytics
- Application funnel analysis

**Reports**:
- Student reports
- Recruiter activity summaries
- TPO (Training & Placement Officer) summaries
- System-wide analytics dashboard

**Future**: ClickHouse integration for advanced analytics

### 11. Referral System

**Features**:
- Student referrals
- Referral tracking
- Referral network visualization
- Referral rewards (future)

### 12. Admission Management System (AMS)

**Features**:
- Student enquiry management
- Counsellor management
- Institute management
- Course management
- Student import/export (CSV)
- Admission status tracking

---

## API Endpoints

### Authentication Endpoints

```
POST   /api/v1/auth/register              Register new user
POST   /api/v1/auth/login                 Login user
POST   /api/v1/auth/refresh               Refresh access token
POST   /api/v1/auth/logout                Logout user
POST   /api/v1/auth/forgot-password       Request password reset
POST   /api/v1/auth/reset-password        Reset password
POST   /api/v1/auth/verify-otp            Verify OTP
POST   /api/v1/auth/send-otp              Send OTP
GET    /api/v1/auth/google                Google OAuth login
GET    /api/v1/auth/google/callback       Google OAuth callback
```

### User Endpoints

```
GET    /api/v1/users/profile               Get current user profile
PUT    /api/v1/users/profile               Update user profile
GET    /api/v1/users/:id                   Get user by ID
GET    /api/v1/users/search                Search users
POST   /api/v1/users/profile-image         Upload profile image
POST   /api/v1/users/voice-recording       Upload voice recording
GET    /api/v1/users/profile-pdf           Generate profile PDF
```

### Posts Endpoints

```
GET    /api/v1/posts                       Get posts list
POST   /api/v1/posts                       Create new post
GET    /api/v1/posts/:id                   Get post details
PUT    /api/v1/posts/:id                   Update post
DELETE /api/v1/posts/:id                   Delete post
POST   /api/v1/posts/:id/like               Like/unlike post
POST   /api/v1/posts/:id/comment           Add comment
GET    /api/v1/posts/:id/comments          Get post comments
POST   /api/v1/posts/:id/bookmark          Bookmark post
POST   /api/v1/posts/:id/interested        Mark as interested
```

### Jobs Endpoints

```
GET    /api/v1/jobs                        Get jobs list
POST   /api/v1/jobs                        Create job post
GET    /api/v1/jobs/:id                    Get job details
PUT    /api/v1/jobs/:id                    Update job post
DELETE /api/v1/jobs/:id                    Delete job post
POST   /api/v1/jobs/:id/apply              Apply for job
GET    /api/v1/jobs/:id/applications       Get job applications
POST   /api/v1/jobs/:id/shortlist          Shortlist candidate
GET    /api/v1/jobs/:id/analytics          Get job analytics
```

### Chat Endpoints

```
GET    /api/v1/chat                        Get chat list
GET    /api/v1/chat/:userId                Get chat with user
POST   /api/v1/chat/message                Send message
GET    /api/v1/chat/:userId/history        Get chat history
POST   /api/v1/chat/invite                 Send chat invitation
GET    /api/v1/chat/invitations            Get invitations
POST   /api/v1/chat/invitations/:id/accept Accept invitation
POST   /api/v1/chat/messages/:id/read      Mark message as read
```

### Notifications Endpoints

```
GET    /api/v1/notifications               Get notifications
GET    /api/v1/notifications/unread-count  Get unread count
POST   /api/v1/notifications/:id/read     Mark as read
POST   /api/v1/notifications/read-all     Mark all as read
PUT    /api/v1/notifications/preferences  Update preferences
```

### Projects Endpoints

```
GET    /api/v1/projects                    Get projects list
POST   /api/v1/projects                    Create project
GET    /api/v1/projects/:id                Get project details
PUT    /api/v1/projects/:id                Update project
DELETE /api/v1/projects/:id                Delete project
```

### Exams Endpoints

```
GET    /api/v1/exams                       Get exams list
GET    /api/v1/exams/:id                   Get exam details
POST   /api/v1/exams/:id/attempt           Submit exam attempt
GET    /api/v1/exams/:id/results           Get exam results
GET    /api/v1/exams/saved                 Get saved exams
POST   /api/v1/exams/:id/save              Save exam
```

### Payments Endpoints

```
POST   /api/v1/payments/create-order        Create payment order
POST   /api/v1/payments/verify             Verify payment
GET    /api/v1/payments/history            Get payment history
GET    /api/v1/payments/credits            Get credit balance
```

### CMS Endpoints

```
GET    /api/v1/cms/pages                   Get CMS pages
GET    /api/v1/cms/pages/:slug             Get page by slug
GET    /api/v1/cms/news                    Get news articles
GET    /api/v1/cms/gallery                  Get gallery images
GET    /api/v1/cms/faqs                    Get FAQs
```

### Analytics Endpoints (Admin)

```
GET    /api/v1/analytics/dashboard          Get dashboard analytics
GET    /api/v1/analytics/users             Get user analytics
GET    /api/v1/analytics/jobs              Get job analytics
GET    /api/v1/analytics/revenue           Get revenue analytics
```

---

## Mobile App Architecture

### React Native + Expo Setup

**Key Features**:
- TypeScript for type safety
- Expo SDK for native features
- React Navigation for routing
- State management (Redux Toolkit or Zustand)
- API client with interceptors
- Offline support with AsyncStorage
- Push notifications integration

### Navigation Structure

```
AppNavigator
├── AuthNavigator (if not authenticated)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
│
└── MainNavigator (if authenticated)
    ├── HomeTabNavigator
    │   ├── DashboardScreen
    │   ├── WallScreen
    │   └── NotificationsScreen
    ├── JobsTabNavigator
    │   ├── JobListScreen
    │   └── JobDetailScreen
    ├── ChatTabNavigator
    │   ├── ChatListScreen
    │   └── ChatDetailScreen
    ├── ProfileTabNavigator
    │   ├── ProfileScreen
    │   └── EditProfileScreen
    └── ExamsTabNavigator
        ├── ExamListScreen
        └── ExamDetailScreen
```

### State Management

- **Redux Toolkit** or **Zustand** for global state
- **React Query** for server state management
- **AsyncStorage** for local persistence

### API Integration

- Axios or Fetch API with interceptors
- Automatic token refresh
- Request/response logging
- Error handling and retry logic

### Push Notifications

- Firebase Cloud Messaging (FCM)
- Background notification handling
- Notification actions
- Badge count management

### AdMob Integration

- Banner ads
- Interstitial ads
- Rewarded ads
- Ad placement strategy

### Contact Picker

- Import contacts for referrals
- Contact matching
- Invite contacts to platform

---

## Admin Panel Architecture

### React + Vite Setup

**Key Features**:
- Vite for fast development and building
- TypeScript for type safety
- React Router for navigation
- TanStack Query (React Query) for data fetching
- Zustand or Redux for state management
- Tailwind CSS for styling
- Shadcn/UI for components
- Recharts for data visualization

### Page Structure

```
AdminPanel
├── Auth
│   └── LoginPage
│
├── Dashboard
│   └── DashboardPage (Analytics overview)
│
├── Users
│   ├── UsersListPage
│   ├── UserDetailPage
│   └── UserEditPage
│
├── Posts
│   ├── PostsListPage
│   ├── PostEditPage
│   └── PostCreatePage
│
├── Jobs
│   ├── JobsListPage
│   ├── JobDetailPage
│   └── ApplicationsPage
│
├── CMS
│   ├── PagesPage
│   ├── NewsPage
│   ├── GalleryPage
│   └── FAQsPage
│
├── Analytics
│   ├── OverviewPage
│   ├── UsersAnalyticsPage
│   ├── JobsAnalyticsPage
│   └── RevenueAnalyticsPage
│
└── Settings
    ├── GeneralSettingsPage
    └── SecuritySettingsPage
```

### Component Library (Shadcn/UI)

- Button, Input, Select, Textarea
- Dialog, Dropdown, Popover
- Table, Card, Badge
- Form components
- Data table with sorting and filtering

### Charts (Recharts)

- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Area charts for cumulative data
- Real-time data updates

---

## Third-Party Integrations

### 1. Firebase Admin SDK

**Usage**:
- Push notifications to mobile apps
- Cloud messaging
- Configuration stored in environment variables

**Implementation**:
```typescript
// firebase.service.ts
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  async sendPushNotification(userId: string, notification: NotificationData) {
    // Implementation
  }
}
```

### 2. Payment Gateway - Razorpay

**Usage**:
- Payment processing for recruiter credits
- Webhook handling for payment status
- Refund processing

**Implementation**:
```typescript
// razorpay.service.ts
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  async createOrder(amount: number, metadata: any) {
    // Implementation
  }
  
  async verifyPayment(paymentId: string, signature: string) {
    // Implementation
  }
}
```

### 3. SMS Gateway

**Usage**:
- OTP sending
- Registration notifications
- Account activation messages

**Implementation**:
- Queue-based SMS sending via BullMQ
- Template-based messaging
- Delivery status tracking

### 4. Email Service

**Usage**:
- Transactional emails
- Email templates
- Bulk email sending

**Implementation**:
- Queue-based email sending
- Template engine (Handlebars or similar)
- Email tracking

### 5. S3 Storage

**Usage**:
- File uploads (images, documents, videos)
- Profile images
- Project files
- Chat attachments

**Implementation**:
```typescript
// s3.service.ts
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
  async uploadFile(file: Buffer, key: string, contentType: string) {
    // Implementation
  }
  
  async getSignedUrl(key: string) {
    // Implementation
  }
}
```

### 6. AI Services

**OpenAI Integration**:
- GPT models for intelligent features
- Job matching algorithms
- Profile recommendations
- Automated responses

**Implementation**:
```typescript
// openai.service.ts
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
  async matchJobs(studentId: string) {
    // Implementation using GPT
  }
  
  async generateRecommendations(userId: string) {
    // Implementation
  }
}
```

**Llama/Mistral Integration**:
- Alternative AI providers
- Fallback mechanisms
- Cost optimization

---

## Background Jobs & Queues

### BullMQ Setup

**Queue Configuration**:
- Redis connection for queue storage
- Multiple queues for different job types
- Priority queues for urgent tasks
- Retry mechanisms with exponential backoff

### Queue Types

1. **Email Queue**
   - Transactional emails
   - Notification emails
   - Bulk emails

2. **SMS Queue**
   - OTP messages
   - Notification SMS
   - Bulk SMS

3. **Notification Queue**
   - Push notifications
   - In-app notifications
   - Batch notifications

4. **Analytics Queue**
   - Event logging
   - Counter updates
   - Report generation

5. **File Processing Queue**
   - Image processing
   - Video transcoding
   - PDF generation

### Job Processors

```typescript
// email.processor.ts
@Processor('email')
export class EmailProcessor {
  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>) {
    // Process email sending
  }
}
```

### Job Scheduling

- Cron jobs for scheduled tasks
- Recurring jobs for periodic operations
- Delayed jobs for future execution

---

## Analytics & Monitoring

### Event Tracking

**PostgreSQL Events**:
- Database triggers for automatic event logging
- Event table for all user actions
- Efficient querying and aggregation

**Event Types**:
- `job_view`
- `profile_view`
- `application_submitted`
- `post_created`
- `message_sent`

### Redis Counters

**Real-time Metrics**:
- Active users count
- Job views counter
- Application counter
- Post likes counter

**Implementation**:
```typescript
// counter.service.ts
@Injectable()
export class CounterService {
  async increment(key: string, value: number = 1) {
    await this.redis.incrby(key, value);
  }
  
  async get(key: string) {
    return await this.redis.get(key);
  }
}
```

### ClickHouse Integration (Future)

**Purpose**:
- Advanced analytics and reporting
- Time-series data storage
- Complex aggregations
- Historical data analysis

**Migration Strategy**:
- Dual-write to PostgreSQL and ClickHouse
- Gradual migration of analytics queries
- Data retention policies

### Monitoring

- Application performance monitoring (APM)
- Error tracking and logging
- Database query monitoring
- API response time tracking
- Server resource monitoring

---

## AI Integration

### AI Service Architecture

```
AIServiceModule
├── OpenAIService
│   ├── Job Matching
│   ├── Profile Recommendations
│   └── Content Generation
├── LlamaService (Alternative)
├── MistralService (Alternative)
└── JobMatchingService
    ├── Profile Analysis
    ├── Job Analysis
    └── Matching Algorithm
```

### Use Cases

1. **Job Matching**
   - Analyze student profile
   - Match with job requirements
   - Score and rank matches
   - Provide match explanations

2. **Profile Recommendations**
   - Suggest profile improvements
   - Recommend skills to learn
   - Career path suggestions

3. **Automated Responses**
   - Chat bot responses
   - FAQ answers
   - Application status updates

4. **Content Generation**
   - Job description suggestions
   - Profile summary generation
   - Email template personalization

### Implementation

```typescript
// ai.service.ts
@Injectable()
export class AIService {
  constructor(
    private openAIService: OpenAIService,
    private jobMatchingService: JobMatchingService
  ) {}

  async matchJobsForStudent(studentId: string) {
    const student = await this.getStudentProfile(studentId);
    const jobs = await this.getActiveJobs();
    
    return this.jobMatchingService.match(student, jobs);
  }
}
```

---

## Configuration

### Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lifeset
DATABASE_POOL_SIZE=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET_NAME=lifeset-uploads

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# SMS Gateway
SMS_API_KEY=
SMS_API_URL=

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# OpenAI
OPENAI_API_KEY=

# CORS
CORS_ORIGIN=http://localhost:3000,https://app.lifeset.co.in

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### Prisma Configuration

```prisma
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### NestJS Configuration

```typescript
// app.config.ts
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});
```

---

## Deployment

### Docker Setup

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/lifeset
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=lifeset
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### NGINX Configuration

```nginx
upstream api {
    server api:3000;
}

server {
    listen 80;
    server_name api.lifeset.co.in;

    location / {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates configured
- [ ] NGINX reverse proxy setup
- [ ] Docker containers running
- [ ] S3 bucket configured
- [ ] Firebase credentials set
- [ ] Monitoring and logging setup
- [ ] Backup strategy implemented
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Error tracking enabled

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: lifeset/api:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deployment steps
```

### Pipeline Stages

1. **Test**: Run unit tests, integration tests, linting
2. **Build**: Build Docker images
3. **Deploy**: Deploy to production/staging
4. **Post-deploy**: Run migrations, health checks

---

## Development Guidelines

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb style guide
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

### Git Workflow

- **Main branch**: Production-ready code
- **Develop branch**: Development integration
- **Feature branches**: Feature development
- **Hotfix branches**: Critical fixes

### Testing

- **Unit tests**: Jest for backend, Vitest for frontend
- **Integration tests**: API endpoint testing
- **E2E tests**: Playwright or Cypress

### Documentation

- **API Documentation**: Swagger/OpenAPI
- **Code Comments**: JSDoc for functions
- **README**: Project setup and usage

### Security Best Practices

- Input validation on all endpoints
- SQL injection prevention (Prisma ORM)
- XSS prevention
- CSRF protection
- Rate limiting
- Authentication and authorization
- Secure password hashing (bcrypt)
- HTTPS only in production
- Environment variable security

### Performance Optimization

- Database query optimization
- Redis caching strategy
- Image optimization and CDN
- API response compression
- Lazy loading for mobile app
- Code splitting for admin panel

---

## Migration from CakePHP

### Key Differences

1. **Framework**: CakePHP → NestJS
2. **Language**: PHP → TypeScript
3. **Database**: MySQL → PostgreSQL
4. **ORM**: CakePHP ORM → Prisma
5. **Sessions**: PHP Sessions → JWT + Redis
6. **File Storage**: Local → S3
7. **Background Jobs**: None → BullMQ
8. **Real-time**: AJAX Polling → WebSockets

### Migration Strategy

1. **Phase 1**: Database migration (MySQL → PostgreSQL)
2. **Phase 2**: API development (NestJS)
3. **Phase 3**: Mobile app development
4. **Phase 4**: Admin panel development
5. **Phase 5**: Data migration and testing
6. **Phase 6**: Deployment and cutover

---

## Support & Maintenance

### Logging

- **Application logs**: Winston or Pino
- **Error tracking**: Sentry or similar
- **Access logs**: NGINX access logs
- **Database logs**: PostgreSQL logs

### Monitoring

- **Application monitoring**: PM2, New Relic, or Datadog
- **Database monitoring**: pgAdmin, Postgres monitoring tools
- **Server monitoring**: Server resource usage
- **Uptime monitoring**: External monitoring services

### Backup Strategy

- **Database backups**: Daily automated backups
- **S3 backups**: Versioning enabled
- **Configuration backups**: Git repository
- **Backup retention**: 30 days minimum

### Debugging

- **Development**: Debug mode with detailed logs
- **Production**: Error tracking with stack traces
- **API**: Request/response logging
- **Database**: Query logging in development

---

## Conclusion

This documentation provides a comprehensive overview of the LifeSet platform rebuilt with modern technologies. The new stack offers:

- **Scalability**: Microservices-ready architecture
- **Performance**: Optimized database queries and caching
- **Developer Experience**: TypeScript, modern tooling
- **Maintainability**: Clean architecture, modular design
- **Security**: Modern authentication, input validation
- **Real-time**: WebSocket support for chat
- **AI Integration**: Intelligent features and recommendations
- **Analytics**: Comprehensive tracking and reporting

The platform is designed to handle growth while maintaining code quality and developer productivity.

---

**Document Version**: 2.0  
**Last Updated**: 2024  
**Framework**: NestJS (TypeScript)  
**Database**: PostgreSQL with Prisma ORM  
**Mobile**: React Native (Expo)  
**Admin**: React + Vite + Tailwind

