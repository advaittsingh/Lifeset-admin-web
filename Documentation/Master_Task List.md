# LifeSet Platform - Master Task List (P0 Development)

## Table of Contents
1. [Project Foundation](#phase-1--project-foundation-day-12)
2. [Backend Setup](#phase-2--backend-setup-day-24)
3. [User System & Onboarding](#phase-3--user-system--onboarding-week-1)
4. [Core Feed Engine](#phase-4--core-feed-engine-week-2)
5. [Learning Modules](#phase-5--learning-modules-week-3)
6. [Networking & Community](#phase-6--networking--community-week-4)
7. [Engagement Systems](#phase-7--engagement-systems-week-5)
8. [Performance & Badges](#phase-8--performance--badges-week-6)
9. [CMS Admin Panel](#phase-9--cms-admin-panel-runs-across-weeks-25)
10. [Final QA & Deployment](#phase-10--final-qa--deployment-end-of-week-6)

---

## Phase 1 — Project Foundation (Day 1–2)

### Task 1: Initialize Monorepo

**Objective**: Set up a monorepo structure to manage all packages in a single repository.

**Requirements**:
- Choose monorepo tool: **TurboRepo** or **Nx**
- Configure workspace structure
- Set up shared build configurations
- Configure package dependencies

**Package Structure**:
```
packages/
├── backend/              # NestJS + Prisma + Redis
├── admin-web/            # React + Vite + TypeScript
├── mobile-app/           # Expo + React Native + TypeScript
└── shared/               # Shared types/interfaces
```

**Deliverables**:
- [ ] Monorepo initialized with TurboRepo/Nx
- [ ] All packages created and configured
- [ ] Shared dependencies configured
- [ ] Build scripts set up
- [ ] Workspace documentation

---

## Phase 2 — Backend Setup (Day 2–4)

### Task 2: Setup NestJS Backend

**Objective**: Initialize NestJS application with core modules and configurations.

**Module Structure**:
```
NestJS Modules:
├── auth                  # Authentication & authorization
├── users                 # User management
├── profiles              # Profile management
├── feeds                 # Feed/post management
├── cms                   # Content management system
├── analytics             # Analytics & tracking
├── notifications         # Notification system
├── ads                   # Advertisement management
├── referral              # Referral system
└── performance           # Performance tracking
```

**Configuration Setup**:
- [ ] Environment variables configuration
- [ ] Logging system (Winston/Pino)
- [ ] Global exception filters
- [ ] Global interceptors
- [ ] Global validation pipe (class-validator)
- [ ] CORS configuration
- [ ] Rate limiting setup
- [ ] Helmet security configuration

**Deliverables**:
- [ ] NestJS project initialized
- [ ] All modules scaffolded
- [ ] Global configurations applied
- [ ] Environment configuration files
- [ ] Basic health check endpoint

### Task 3: Setup Prisma + PostgreSQL

**Objective**: Configure Prisma ORM and PostgreSQL database with initial schema.

**Database Tables**:
```prisma
Base Tables:
├── users                 # User accounts
├── profiles              # User profiles
├── sessions              # User sessions
├── feeds                 # Feed posts
├── user_events           # User activity events
├── notifications         # System notifications
├── ads                   # Advertisement data
├── referrals             # Referral tracking
└── badges                # User badges
```

**Setup Requirements**:
- [ ] Initialize Prisma schema
- [ ] Configure PostgreSQL connection
- [ ] Create base models in schema.prisma
- [ ] Set up Prisma migrations
- [ ] Add database seed scripts
- [ ] Configure connection pooling
- [ ] Set up database indexes

**Deliverables**:
- [ ] Prisma schema file with all base models
- [ ] Initial migration created
- [ ] Seed script for development data
- [ ] Database connection tested
- [ ] Prisma Client generated

### Task 4: Setup Redis

**Objective**: Configure Redis for caching and session management, and set up BullMQ for job queues.

**Redis Services**:
- [ ] Create Redis service file
- [ ] Configure Redis connection
- [ ] Set up connection pooling
- [ ] Implement caching utilities
- [ ] Session storage configuration

**BullMQ Queue Setup**:
```typescript
Queues:
├── notificationsQueue    # Push notification jobs
├── analyticsQueue        # Analytics event processing
└── adImpressionsQueue    # Ad impression tracking
```

**Requirements**:
- [ ] BullMQ queue manager setup
- [ ] Queue processors configured
- [ ] Retry mechanisms configured
- [ ] Queue monitoring setup

**Deliverables**:
- [ ] Redis service implemented
- [ ] All queues created and configured
- [ ] Queue processors implemented
- [ ] Connection tested and verified

---

## Phase 3 — User System & Onboarding (Week 1)

### Task 5: User Registration + Login API

**Objective**: Implement complete authentication system with multiple login methods.

**Features**:
- [ ] **Email/Phone Login**
  - Email-based authentication
  - Phone number-based authentication
  - Unified login endpoint

- [ ] **OTP System**
  - OTP generation (6-digit)
  - OTP storage in Redis with expiration
  - OTP verification endpoint
  - Resend OTP functionality

- [ ] **JWT Tokens**
  - Access token generation (15 min expiry)
  - Refresh token generation (7 days expiry)
  - Token payload structure
  - Token validation middleware

- [ ] **Token Refresh**
  - Refresh token endpoint
  - Automatic token refresh mechanism
  - Token rotation on refresh

- [ ] **Logout**
  - Token invalidation
  - Session cleanup
  - Redis token blacklist

- [ ] **Session Tracking**
  - Active session management
  - Multiple device support
  - Session history

**API Endpoints**:
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/send-otp
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
```

**Deliverables**:
- [ ] Complete authentication module
- [ ] All authentication endpoints implemented
- [ ] OTP system functional
- [ ] JWT token system working
- [ ] Session management implemented
- [ ] Unit tests for auth module

### Task 6: Profile Completion API

**Objective**: Implement step-by-step profile creation with completion tracking.

**Profile Steps**:
1. **Basic Info**
   - First name, last name
   - Date of birth
   - Gender
   - Address details

2. **Education**
   - 10th standard details
   - 12th standard details
   - Graduation details
   - Post-graduation details (optional)

3. **Skills**
   - Technical skills (array)
   - Soft skills (array)
   - Skill level indicators

4. **Interests**
   - Interest categories
   - Hobbies
   - Career interests

5. **Profile Image Upload**
   - Image upload to S3
   - Image processing and optimization
   - Profile image update endpoint

**Profile Completion Calculation**:
```typescript
Profile Completion % = (
  (Basic Info: 20%) +
  (Education: 30%) +
  (Skills: 20%) +
  (Interests: 10%) +
  (Profile Image: 10%) +
  (Additional Fields: 10%)
)
```

**API Endpoints**:
```
GET    /api/v1/profiles/me
PUT    /api/v1/profiles/me
POST   /api/v1/profiles/me/basic-info
POST   /api/v1/profiles/me/education
POST   /api/v1/profiles/me/skills
POST   /api/v1/profiles/me/interests
POST   /api/v1/profiles/me/image
GET    /api/v1/profiles/me/completion
```

**Deliverables**:
- [ ] Profile completion API endpoints
- [ ] Step-by-step profile update flow
- [ ] Profile completion percentage calculation
- [ ] Image upload functionality
- [ ] Profile validation logic

### Task 7: Mobile Onboarding Screens

**Objective**: Create complete mobile app onboarding flow with all necessary screens.

**Screens to Implement**:
1. **Splash Screen**
   - App logo and branding
   - Loading animation
   - Version check

2. **Login Screen**
   - Email/Phone input
   - Password input
   - Login button
   - Forgot password link
   - Social login options

3. **OTP Screen**
   - OTP input fields (6 digits)
   - Resend OTP button
   - Timer countdown
   - Auto-verification

4. **Registration Steps**
   - Step 1: Basic information
   - Step 2: Contact details
   - Step 3: Account creation
   - Progress indicator

5. **Profile Setup**
   - Multi-step form
   - Progress tracking
   - Image picker
   - Form validation

6. **My Profile Page**
   - Profile display
   - Edit profile option
   - Completion indicator
   - Profile sections

**Navigation Flow**:
```
Splash → Login/Register → OTP → Registration → Profile Setup → Dashboard
```

**Deliverables**:
- [ ] All onboarding screens implemented
- [ ] Navigation flow configured
- [ ] Form validation working
- [ ] API integration complete
- [ ] UI/UX polished
- [ ] Error handling implemented

---

## Phase 4 — Core Feed Engine (Week 2)

### Task 8: Unified Feed Module (Backend)

**Objective**: Create a unified feed system supporting multiple feed types with filtering and search.

**Feed Types (Enum)**:
```typescript
enum FeedType {
  COLLEGE_FEED    = 'college_feed',
  JOB             = 'job',
  INTERNSHIP      = 'internship',
  GOVT_JOB       = 'govt_job',
  CURRENT_AFFAIRS = 'current_affairs',
  EVENT           = 'event',
  FREELANCING     = 'freelancing',
  DIGEST          = 'digest'
}
```

**Feed CRUD APIs**:
```
GET    /api/v1/feeds                    # List feeds with filters
POST   /api/v1/feeds                    # Create new feed
GET    /api/v1/feeds/:id                # Get feed details
PUT    /api/v1/feeds/:id                # Update feed
DELETE /api/v1/feeds/:id                # Delete feed
```

**Metadata Structure** (JSONB):
```typescript
{
  type: FeedType,
  category?: string,
  tags?: string[],
  college?: string,
  location?: string,
  salary?: { min: number, max: number },
  deadline?: Date,
  // ... type-specific metadata
}
```

**Filtering Options**:
- `type` - Filter by feed type
- `search` - Full-text search
- `category` - Filter by category
- `tags` - Filter by tags
- `college` - Filter by college
- `recency` - Sort by date (newest/oldest)

**API Endpoints**:
```
GET    /api/v1/feeds?type=job&category=tech&search=developer
GET    /api/v1/feeds?college=college-id&recency=desc
```

**Deliverables**:
- [ ] Feed module with all CRUD operations
- [ ] Feed type enum and validation
- [ ] Metadata JSONB structure
- [ ] Filtering and search functionality
- [ ] Pagination support
- [ ] API documentation

### Task 9: Feed Personalization Base

**Objective**: Set up event logging and ranking algorithm foundation for feed personalization.

**Event Logging**:
Track the following events:
- `feed_open` - User opens a feed item
- `feed_like` - User likes a feed
- `feed_save` - User saves/bookmarks a feed
- `feed_apply` - User applies to a job/internship

**Event Storage**:
```typescript
interface FeedEvent {
  userId: string;
  feedId: string;
  eventType: 'feed_open' | 'feed_like' | 'feed_save' | 'feed_apply';
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

**Ranking Algorithm (Placeholder)**:
```typescript
// Initial ranking algorithm
function calculateFeedScore(feed: Feed, userEvents: FeedEvent[]): number {
  // Base score from recency
  let score = recencyScore(feed.createdAt);
  
  // Boost based on user interactions
  score += interactionScore(userEvents);
  
  // Boost based on user preferences
  score += preferenceScore(feed, userProfile);
  
  return score;
}
```

**Requirements**:
- [ ] Event logging service
- [ ] Event storage in database
- [ ] Event aggregation queries
- [ ] Basic ranking algorithm
- [ ] Feed scoring system

**Deliverables**:
- [ ] Event tracking system implemented
- [ ] Event logging on all feed interactions
- [ ] Ranking algorithm placeholder
- [ ] Feed scoring mechanism
- [ ] Analytics queries for events

### Task 10: Feed Screens (Mobile)

**Objective**: Implement all feed-related screens in the mobile app.

**Screens**:
1. **Feed Home Screen**
   - Infinite scroll feed list
   - Pull-to-refresh
   - Feed type tabs
   - Search functionality
   - Filter options

2. **Feed Category Tabs**
   - Tab navigation
   - Category-specific feeds
   - Tab badges (unread counts)

3. **Feed Detail Screen**
   - Full feed content
   - Images/media gallery
   - Action buttons (Like, Save, Apply, Share)
   - Comments section
   - Related feeds

4. **Feed Actions**
   - Like/Unlike functionality
   - Save/Unsave (bookmark)
   - Apply to job/internship
   - Share feed
   - Report feed

**Components**:
- FeedCard component
- FeedDetail component
- FeedFilter component
- FeedActions component

**Deliverables**:
- [ ] Feed home screen with infinite scroll
- [ ] Category tabs navigation
- [ ] Feed detail screen
- [ ] All feed actions implemented
- [ ] API integration complete
- [ ] Loading and error states
- [ ] Offline support (caching)

---

## Phase 5 — Learning Modules (Week 3)

### Task 11: MCQ + GK Backend

**Objective**: Implement MCQ (Multiple Choice Questions) and GK (General Knowledge) system.

**Database Tables**:
```prisma
model McqCategory {
  id          String
  name        String
  description String?
  isActive    Boolean
  createdAt   DateTime
  updatedAt   DateTime
  questions   McqQuestion[]
}

model McqQuestion {
  id          String
  categoryId  String
  question    String
  options     Json        // Array of options
  correctAnswer Int       // Index of correct answer
  explanation String?
  difficulty  String      // easy, medium, hard
  tags        String[]
  createdAt   DateTime
  updatedAt   DateTime
  attempts    McqAttempt[]
}

model McqAttempt {
  id          String
  userId      String
  questionId  String
  selectedAnswer Int
  isCorrect   Boolean
  timeSpent   Int?        // in seconds
  createdAt   DateTime
}
```

**API Endpoints**:
```
GET    /api/v1/mcq/categories              # Get all categories
GET    /api/v1/mcq/questions               # Get questions (with filters)
GET    /api/v1/mcq/questions/:id          # Get single question
POST   /api/v1/mcq/questions/:id/answer   # Submit answer
POST   /api/v1/mcq/questions/:id/bookmark  # Bookmark question
GET    /api/v1/mcq/bookmarks               # Get bookmarked questions
GET    /api/v1/mcq/attempts                # Get user attempts
```

**Features**:
- [ ] Category management
- [ ] Question CRUD operations
- [ ] Answer submission and validation
- [ ] Bookmark functionality
- [ ] Attempt tracking
- [ ] Performance analytics

**Deliverables**:
- [ ] All database models created
- [ ] MCQ API endpoints implemented
- [ ] Question management system
- [ ] Answer validation logic
- [ ] Bookmark system
- [ ] Attempt tracking

### Task 12: Know Yourself Module (Phase 1)

**Objective**: Implement personality quiz system for self-assessment.

**Features**:
- [ ] **Personality Quiz Questions**
  - Question bank
  - Multiple choice questions
  - Scoring system
  - Question categories

- [ ] **Answer Evaluation**
  - Answer collection
  - Score calculation
  - Personality type determination
  - Result interpretation

- [ ] **Personality Type Storage**
  - Save personality type to user profile
  - Personality type history
  - Re-take quiz option

**Database Schema**:
```prisma
model PersonalityQuiz {
  id          String
  title       String
  description String
  questions   Json        // Array of questions
  createdAt   DateTime
  updatedAt   DateTime
  attempts    PersonalityAttempt[]
}

model PersonalityAttempt {
  id          String
  userId      String
  quizId      String
  answers     Json
  personalityType String
  score       Int
  completedAt DateTime
}
```

**API Endpoints**:
```
GET    /api/v1/personality/quiz
POST   /api/v1/personality/quiz/attempt
GET    /api/v1/personality/result/:attemptId
GET    /api/v1/personality/my-type
```

**Deliverables**:
- [ ] Personality quiz system
- [ ] Question management
- [ ] Answer evaluation logic
- [ ] Personality type calculation
- [ ] Result storage and retrieval
- [ ] Mobile screens for quiz

### Task 13: Daily Digest & Current Affairs

**Objective**: Implement CMS-based daily digest and current affairs system.

**CMS CRUD Operations**:
1. **News Management**
   - Create news articles
   - Edit news articles
   - Categorize news
   - Publish/unpublish
   - Featured news

2. **Daily Digest**
   - Create daily digest
   - Add multiple news items
   - Schedule digest
   - Digest history

**Database Schema**:
```prisma
model News {
  id          String
  title       String
  content     String    @db.Text
  summary     String?
  category    String
  imageUrl    String?
  source      String?
  author      String?
  isPublished Boolean
  publishedAt DateTime?
  createdAt   DateTime
  updatedAt   DateTime
}

model DailyDigest {
  id          String
  date        DateTime  @unique
  title       String
  summary     String
  newsItems   Json      // Array of news IDs
  isPublished Boolean
  createdAt   DateTime
  updatedAt   DateTime
}
```

**API Endpoints**:
```
# Public APIs
GET    /api/v1/news
GET    /api/v1/news/:id
GET    /api/v1/digest
GET    /api/v1/digest/:date

# Admin APIs
POST   /api/v1/admin/news
PUT    /api/v1/admin/news/:id
DELETE /api/v1/admin/news/:id
POST   /api/v1/admin/digest
PUT    /api/v1/admin/digest/:id
```

**Mobile Screens**:
- [ ] News list screen
- [ ] News detail screen
- [ ] Daily digest screen
- [ ] Category filters
- [ ] Search functionality

**Deliverables**:
- [ ] News management system
- [ ] Daily digest system
- [ ] CMS APIs for content management
- [ ] Public APIs for mobile app
- [ ] Mobile screens implemented
- [ ] Content scheduling (if needed)

---

## Phase 6 — Networking & Community (Week 4)

### Task 14: Networking Module

**Objective**: Implement user networking features for connecting students and professionals.

**Features**:
- [ ] **User Search**
  - Search by name, skills, college
  - Advanced filters
  - Search suggestions
  - Recent searches

- [ ] **Filters**
  - Filter by college
  - Filter by course
  - Filter by skills
  - Filter by location
  - Filter by industry

- [ ] **Connection Request**
  - Send connection request
  - Request message (optional)
  - Request status tracking

- [ ] **Accept/Decline**
  - Accept connection request
  - Decline connection request
  - Block user option

- [ ] **My Network List**
  - List all connections
  - Connection search
  - Connection details
  - Remove connection

- [ ] **My Card API**
  - Generate user card
  - Share user card
  - Card customization
  - QR code generation

**Database Schema**:
```prisma
model Connection {
  id          String
  requesterId String
  receiverId  String
  status      String    // pending, accepted, declined, blocked
  message     String?
  createdAt   DateTime
  updatedAt   DateTime
}

model UserCard {
  id          String
  userId      String
  cardData    Json      // Card information
  qrCode      String?
  shareCount  Int
  createdAt   DateTime
  updatedAt   DateTime
}
```

**API Endpoints**:
```
GET    /api/v1/network/search
GET    /api/v1/network/connections
POST   /api/v1/network/request
POST   /api/v1/network/accept/:requestId
POST   /api/v1/network/decline/:requestId
DELETE /api/v1/network/connection/:connectionId
GET    /api/v1/network/my-card
POST   /api/v1/network/share-card
```

**Deliverables**:
- [ ] User search functionality
- [ ] Connection request system
- [ ] Network management
- [ ] User card generation
- [ ] All API endpoints
- [ ] Mobile screens

### Task 15: Explore Institute

**Objective**: Create institute exploration and course discovery system.

**Database Tables**:
```prisma
model Institute {
  id              String
  name            String
  code            String?  @unique
  address         String?
  city            String?
  state           String?
  logo            String?
  description     String?  @db.Text
  website         String?
  email           String?
  phone           String?
  accreditation   String?
  isActive        Boolean
  createdAt       DateTime
  updatedAt       DateTime
  courses         Course[]
}

model Course {
  id              String
  instituteId     String
  name            String
  code            String?
  duration        String?
  description     String?  @db.Text
  eligibility     String?
  fees            Json?
  isActive        Boolean
  createdAt       DateTime
  updatedAt       DateTime
}
```

**Features**:
- [ ] **Institute Profile API**
  - Get institute details
  - Get institute courses
  - Institute statistics
  - Student testimonials

- [ ] **Search & Filter**
  - Search institutes by name
  - Filter by location
  - Filter by course type
  - Filter by accreditation
  - Sort by rating/popularity

**API Endpoints**:
```
GET    /api/v1/institutes
GET    /api/v1/institutes/:id
GET    /api/v1/institutes/:id/courses
GET    /api/v1/institutes/search
GET    /api/v1/courses
GET    /api/v1/courses/:id
```

**Deliverables**:
- [ ] Institute and course models
- [ ] Institute profile APIs
- [ ] Search and filter functionality
- [ ] Mobile screens for institute exploration
- [ ] Course detail screens

### Task 16: Community + Mentors + Guruji

**Objective**: Implement community features, mentor profiles, and Guruji content.

**Features**:
1. **Community Categories**
   - Category management
   - Category-based discussions
   - Community rules

2. **Mentor Profiles**
   - Mentor registration
   - Mentor profile display
   - Mentor search
   - Booking/consultation system

3. **Guruji Article/Video List**
   - Article management
   - Video content
   - Category organization
   - Search and filter

**Database Schema**:
```prisma
model CommunityCategory {
  id          String
  name        String
  description String?
  icon        String?
  isActive    Boolean
  createdAt   DateTime
  updatedAt   DateTime
  posts       CommunityPost[]
}

model Mentor {
  id              String
  userId           String
  specialization   String[]
  experience       Int
  bio              String?  @db.Text
  rating           Float
  consultationFee  Float?
  availability     Json?
  isVerified       Boolean
  createdAt        DateTime
  updatedAt        DateTime
}

model GurujiContent {
  id          String
  title       String
  content     String    @db.Text
  type        String    // article, video
  category    String
  thumbnail   String?
  videoUrl    String?
  views       Int
  likes       Int
  createdAt   DateTime
  updatedAt   DateTime
}
```

**API Endpoints**:
```
# Community
GET    /api/v1/community/categories
GET    /api/v1/community/posts
POST   /api/v1/community/posts

# Mentors
GET    /api/v1/mentors
GET    /api/v1/mentors/:id
POST   /api/v1/mentors/booking

# Guruji
GET    /api/v1/guruji/content
GET    /api/v1/guruji/content/:id
```

**Deliverables**:
- [ ] Community category system
- [ ] Mentor profile system
- [ ] Guruji content management
- [ ] All related APIs
- [ ] Mobile screens

---

## Phase 7 — Engagement Systems (Week 5)

### Task 17: Push Notification Engine

**Objective**: Implement comprehensive push notification system using Firebase Admin SDK.

**Setup Requirements**:
- [ ] **Firebase Admin SDK Setup**
  - Firebase project configuration
  - Service account key setup
  - Firebase initialization
  - Token validation

- [ ] **User Token Registration**
  - FCM token registration endpoint
  - Token storage in database
  - Token update mechanism
  - Multi-device support

- [ ] **Segmentation Filters**
  - User segment creation
  - Filter by user type
  - Filter by location
  - Filter by interests
  - Custom filters

- [ ] **Bulk Notifications via BullMQ Queue**
  - Queue-based notification sending
  - Batch processing
  - Retry mechanism
  - Failure handling

- [ ] **Scheduled Notifications**
  - Notification scheduling
  - Cron-based scheduling
  - Timezone handling
  - Recurring notifications

**Database Schema**:
```prisma
model NotificationToken {
  id          String
  userId      String
  token       String
  platform    String    // ios, android
  deviceId    String?
  isActive    Boolean
  createdAt   DateTime
  updatedAt   DateTime
}

model NotificationCampaign {
  id          String
  title       String
  message     String
  segment     Json      // Filter criteria
  scheduledAt DateTime?
  status      String    // draft, scheduled, sent
  sentCount   Int
  createdAt   DateTime
  updatedAt   DateTime
}
```

**API Endpoints**:
```
POST   /api/v1/notifications/token
PUT    /api/v1/notifications/token
DELETE /api/v1/notifications/token
POST   /api/v1/notifications/send
POST   /api/v1/notifications/bulk
POST   /api/v1/notifications/schedule
```

**Deliverables**:
- [ ] Firebase Admin SDK integrated
- [ ] Token registration system
- [ ] Notification sending service
- [ ] BullMQ queue for notifications
- [ ] Segmentation system
- [ ] Scheduling functionality

### Task 18: Ads Management System

**Objective**: Implement advertisement management system with AdMob integration.

**Features**:
- [ ] **Ad Slots**
  - Define ad slot positions
  - Slot configuration
  - Slot targeting

- [ ] **Display Ads Config**
  - Ad format configuration
  - Ad frequency capping
  - Ad placement rules

- [ ] **Impression Counter**
  - Track ad impressions
  - Impression analytics
  - Revenue tracking

- [ ] **Admin Panel to Manage Ads**
  - Ad creation interface
  - Ad scheduling
  - Ad performance dashboard

- [ ] **AdMob Integration in Mobile**
  - AdMob SDK setup
  - Banner ads
  - Interstitial ads
  - Rewarded ads
  - Native ads

**Database Schema**:
```prisma
model AdSlot {
  id          String
  name        String
  position    String
  format      String    // banner, interstitial, rewarded
  isActive    Boolean
  createdAt   DateTime
  updatedAt   DateTime
  impressions AdImpression[]
}

model AdImpression {
  id          String
  adSlotId    String
  userId      String?
  revenue     Float?
  createdAt   DateTime
}
```

**API Endpoints**:
```
GET    /api/v1/ads/slots
GET    /api/v1/ads/config
POST   /api/v1/ads/impression
GET    /api/v1/ads/analytics
```

**Deliverables**:
- [ ] Ad slot management system
- [ ] Ad configuration APIs
- [ ] Impression tracking
- [ ] Admin panel for ad management
- [ ] AdMob SDK integration in mobile app
- [ ] Ad analytics dashboard

### Task 19: Student Referral Module

**Objective**: Implement student referral system with contact integration and tracking.

**Features**:
- [ ] **Contact Picker in App**
  - React Native contact picker integration
  - Contact import
  - Contact matching
  - Invite contacts

- [ ] **WhatsApp API Share**
  - WhatsApp deep linking
  - Share referral link
  - Pre-filled message
  - Share tracking

- [ ] **Referral Tracking**
  - Referral code generation
  - Referral link tracking
  - Referral status tracking
  - Conversion tracking

- [ ] **Leaderboard**
  - Top referrers list
  - Referral count ranking
  - Rewards display
  - Statistics

**Database Schema**:
```prisma
model Referral {
  id              String
  referrerId      String
  referredId      String?
  referralCode    String
  status          String    // pending, completed, expired
  rewardEarned    Boolean
  createdAt       DateTime
  updatedAt       DateTime
}

model ReferralLeaderboard {
  id          String
  userId      String
  referralCount Int
  rank        Int
  period      String    // daily, weekly, monthly
  updatedAt   DateTime
}
```

**API Endpoints**:
```
GET    /api/v1/referrals/my-code
GET    /api/v1/referrals/my-referrals
GET    /api/v1/referrals/leaderboard
POST   /api/v1/referrals/verify-code
```

**Deliverables**:
- [ ] Contact picker integration
- [ ] Referral code generation
- [ ] Referral tracking system
- [ ] WhatsApp sharing integration
- [ ] Leaderboard system
- [ ] Mobile screens for referrals

---

## Phase 8 — Performance & Badges (Week 6)

### Task 20: Activity Tracking Engine

**Objective**: Implement comprehensive activity tracking system for user engagement analytics.

**Events to Track**:
- `login` - User login events
- `feed_interaction` - Feed likes, saves, applies
- `mcq_attempt` - MCQ question attempts
- `community_action` - Community posts, comments
- `profile_view` - Profile view events
- `connection_request` - Network connection requests

**Event Storage**:
```prisma
model UserEvent {
  id          String
  userId      String
  eventType   String
  entityType  String?   // feed, question, user, etc.
  entityId    String?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime
}
```

**Features**:
- [ ] Event logging service
- [ ] Event aggregation
- [ ] Real-time event tracking
- [ ] Event analytics queries
- [ ] Event export functionality

**API Endpoints**:
```
POST   /api/v1/events/track
GET    /api/v1/events/user/:userId
GET    /api/v1/events/analytics
```

**Deliverables**:
- [ ] Event tracking system
- [ ] All event types implemented
- [ ] Event storage and retrieval
- [ ] Analytics queries
- [ ] Event dashboard

### Task 21: Scorecard Engine

**Objective**: Implement scoring system based on user activities with weights and time-based calculations.

**Score Calculation**:
```typescript
interface EventWeight {
  login: 10,
  feed_like: 5,
  feed_save: 10,
  feed_apply: 20,
  mcq_attempt: 15,
  mcq_correct: 25,
  community_post: 30,
  connection_request: 15,
  // ... more events
}

function calculateScore(userEvents: UserEvent[]): number {
  return userEvents.reduce((score, event) => {
    return score + (EventWeight[event.eventType] || 0);
  }, 0);
}
```

**Features**:
- [ ] **Compute Score from Event Weights**
  - Event weight configuration
  - Score calculation algorithm
  - Score caching

- [ ] **Provide Score API**
  - Get current score
  - Get score history
  - Get score breakdown

- [ ] **Weekly Score**
  - Weekly score calculation
  - Weekly leaderboard
  - Weekly rewards

- [ ] **Monthly Progress**
  - Monthly score tracking
  - Progress visualization
  - Monthly reports

**Database Schema**:
```prisma
model UserScore {
  id          String
  userId      String
  totalScore  Int
  weeklyScore Int
  monthlyScore Int
  rank        Int?
  updatedAt   DateTime
}

model ScoreHistory {
  id          String
  userId      String
  score       Int
  period      String    // daily, weekly, monthly
  periodDate  DateTime
  createdAt   DateTime
}
```

**API Endpoints**:
```
GET    /api/v1/scores/me
GET    /api/v1/scores/weekly
GET    /api/v1/scores/monthly
GET    /api/v1/scores/leaderboard
GET    /api/v1/scores/history
```

**Deliverables**:
- [ ] Score calculation engine
- [ ] Event weight system
- [ ] Score APIs
- [ ] Weekly/monthly tracking
- [ ] Leaderboard system
- [ ] Score visualization

### Task 22: Badge System

**Objective**: Implement gamification badge system based on user achievements.

**Badge Tiers**:
- **Bronze** - Entry-level achievements
- **Silver** - Intermediate achievements
- **Gold** - Advanced achievements
- **Platinum** - Elite achievements

**Badge Criteria**:
- **Score-based**: Achieve certain score milestones
- **Streak-based**: Maintain daily login streaks
- **Engagement-based**: High engagement metrics

**Database Schema**:
```prisma
model Badge {
  id          String
  name        String
  description String
  tier        String    // bronze, silver, gold, platinum
  icon        String
  criteria    Json      // Badge earning criteria
  createdAt   DateTime
  updatedAt   DateTime
  userBadges  UserBadge[]
}

model UserBadge {
  id          String
  userId      String
  badgeId     String
  earnedAt     DateTime
  progress    Int?      // Progress percentage if applicable
}
```

**Badge Types**:
```typescript
// Score-based badges
- First Steps (Bronze): Score 100
- Rising Star (Silver): Score 500
- Champion (Gold): Score 2000
- Legend (Platinum): Score 10000

// Streak-based badges
- Dedicated (Bronze): 7-day streak
- Committed (Silver): 30-day streak
- Unstoppable (Gold): 100-day streak

// Engagement-based badges
- Social Butterfly: 50 connections
- Knowledge Seeker: 100 MCQ attempts
- Community Hero: 50 community posts
```

**API Endpoints**:
```
GET    /api/v1/badges
GET    /api/v1/badges/my-badges
GET    /api/v1/badges/progress
POST   /api/v1/badges/check-eligibility
```

**Deliverables**:
- [ ] Badge system implementation
- [ ] Badge criteria engine
- [ ] Badge earning logic
- [ ] Badge display system
- [ ] Progress tracking
- [ ] Mobile badge screens

---

## Phase 9 — CMS Admin Panel (Runs across Weeks 2–5)

### Task 23: CMS Modules

**Objective**: Build comprehensive admin panel for content and system management.

**Modules to Implement**:
1. **Login**
   - Admin authentication
   - Session management
   - Role-based access

2. **Sidebar Structure**
   - Navigation menu
   - Module organization
   - User profile section

3. **Feed Management**
   - Create/edit feeds
   - Feed moderation
   - Feed analytics

4. **Jobs/Internships**
   - Job posting management
   - Application management
   - Job analytics

5. **MCQ/GK**
   - Question bank management
   - Category management
   - Question import/export

6. **Know Yourself**
   - Quiz management
   - Question management
   - Result analytics

7. **Daily Digest**
   - Digest creation
   - News management
   - Scheduling

8. **Events**
   - Event creation
   - Event management
   - Event registration

9. **Mentors**
   - Mentor approval
   - Mentor management
   - Mentor analytics

10. **Community**
    - Community moderation
    - Category management
    - Content management

11. **Institute Master**
    - Institute CRUD
    - Course management
    - Institute verification

**Technology Stack**:
- React + Vite
- TypeScript
- Tailwind CSS
- Shadcn/UI
- React Query
- React Router

**Deliverables**:
- [ ] Admin authentication system
- [ ] All CMS modules implemented
- [ ] CRUD operations for all entities
- [ ] Admin dashboard
- [ ] Analytics dashboards
- [ ] Responsive design

### Task 24: CMS User Rights

**Objective**: Implement role-based access control and permission system for admin panel.

**Features**:
- [ ] **Role-Based Access**
  - Admin roles definition
  - Role assignment
  - Role hierarchy

- [ ] **Permissions**
  - Fine-grained permissions
  - Permission groups
  - Permission inheritance

- [ ] **Audit Logs**
  - Action logging
  - User activity tracking
  - Change history
  - Export logs

**Role Structure**:
```typescript
enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  CONTENT_MANAGER = 'content_manager',
  ANALYST = 'analyst'
}

interface Permission {
  resource: string;  // feeds, users, jobs, etc.
  actions: string[];  // create, read, update, delete
}
```

**Database Schema**:
```prisma
model AdminRole {
  id          String
  name        String
  permissions Json
  createdAt   DateTime
  updatedAt   DateTime
  admins      Admin[]
}

model AuditLog {
  id          String
  adminId     String
  action      String
  resource    String
  resourceId  String?
  changes     Json?
  ipAddress   String?
  createdAt   DateTime
}
```

**Deliverables**:
- [ ] Role-based access control
- [ ] Permission system
- [ ] Audit logging system
- [ ] User management interface
- [ ] Permission management UI

---

## Phase 10 — Final QA & Deployment (End of Week 6)

### Task 25: Backend Deployment

**Objective**: Deploy backend services to production environment.

**Deployment Steps**:
- [ ] **Dockerize NestJS Service**
  - Create Dockerfile
  - Optimize Docker image
  - Multi-stage build
  - Health check configuration

- [ ] **PostgreSQL + Redis Setup**
  - Database server setup
  - Redis server setup
  - Connection configuration
  - Backup configuration

- [ ] **CI/CD Pipeline**
  - GitHub Actions setup
  - Automated testing
  - Automated deployment
  - Rollback mechanism

**Docker Configuration**:
```dockerfile
# Dockerfile example
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main"]
```

**Deliverables**:
- [ ] Dockerized application
- [ ] Production database setup
- [ ] CI/CD pipeline configured
- [ ] Environment variables configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented

### Task 26: Mobile Deployment

**Objective**: Deploy mobile app to app stores.

**Deployment Steps**:
- [ ] **TestFlight Setup (iOS)**
  - Apple Developer account setup
  - App Store Connect configuration
  - TestFlight build upload
  - Beta testing setup

- [ ] **Play Store Setup (Android)**
  - Google Play Console setup
  - App signing configuration
  - Production build generation
  - Store listing preparation

**Requirements**:
- [ ] App icons and splash screens
- [ ] App store screenshots
- [ ] App description and metadata
- [ ] Privacy policy and terms
- [ ] Version management
- [ ] Release notes

**Deliverables**:
- [ ] iOS app deployed to TestFlight
- [ ] Android app deployed to Play Store (internal testing)
- [ ] App store listings prepared
- [ ] Beta testing groups configured
- [ ] Release documentation

### Task 27: End-to-End Testing

**Objective**: Comprehensive testing of all major user flows and features.

**Test Flows**:
1. **Feed Flows**
   - [ ] Feed loading and pagination
   - [ ] Feed filtering and search
   - [ ] Feed interactions (like, save, apply)
   - [ ] Feed detail view
   - [ ] Feed creation (admin)

2. **Profile Flows**
   - [ ] Profile creation
   - [ ] Profile completion
   - [ ] Profile editing
   - [ ] Profile viewing
   - [ ] Profile image upload

3. **Login/OTP**
   - [ ] Registration flow
   - [ ] Login flow
   - [ ] OTP verification
   - [ ] Password reset
   - [ ] Session management

4. **MCQ**
   - [ ] MCQ category selection
   - [ ] Question display
   - [ ] Answer submission
   - [ ] Result display
   - [ ] Bookmark functionality

5. **Notifications**
   - [ ] Push notification delivery
   - [ ] In-app notifications
   - [ ] Notification preferences
   - [ ] Notification history

6. **Ads**
   - [ ] Ad display
   - [ ] Ad interaction
   - [ ] Impression tracking
   - [ ] Ad refresh

**Testing Tools**:
- Unit tests (Jest)
- Integration tests
- E2E tests (Detox/Appium)
- API testing (Postman/Insomnia)
- Performance testing

**Deliverables**:
- [ ] All test flows documented
- [ ] Test cases executed
- [ ] Bugs identified and logged
- [ ] Test report generated
- [ ] Critical bugs fixed
- [ ] Regression testing completed

---

## Summary

This master task list covers the complete P0 development phase for the LifeSet platform, organized into 10 phases over 6 weeks. Each task includes:

- **Objective**: Clear goal statement
- **Requirements**: Detailed feature list
- **Database Schema**: Prisma model definitions where applicable
- **API Endpoints**: RESTful API specifications
- **Deliverables**: Checklist of completion criteria

### Key Milestones

- **Week 1**: User system and onboarding complete
- **Week 2**: Core feed engine functional
- **Week 3**: Learning modules implemented
- **Week 4**: Networking and community features
- **Week 5**: Engagement systems and admin panel
- **Week 6**: Performance tracking, badges, and deployment

### Success Criteria

- [ ] All 27 tasks completed
- [ ] All APIs functional and tested
- [ ] Mobile app ready for beta testing
- [ ] Admin panel fully operational
- [ ] Backend deployed to production
- [ ] Documentation complete

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Project**: LifeSet Platform P0 Development  
**Timeline**: 6 Weeks
