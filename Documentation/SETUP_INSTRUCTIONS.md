# LifeSet Platform - Setup Instructions

## ✅ All Features Complete!

All requested features have been implemented. Follow these steps to set up and run the platform.

---

## Quick Start

### 1. Install Dependencies

```bash
# Root directory
npm install

# Backend
cd packages/backend
npm install

# Admin Panel
cd ../admin-web
npm install

# Mobile App
cd ../mobile-app
npm install
```

### 2. Setup Database

```bash
cd packages/backend

# Create .env file
cp .env.example .env

# Edit .env and add:
DATABASE_URL="postgresql://user:password@localhost:5432/lifeset"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
WHATSAPP_API_KEY=your-whatsapp-key
WHATSAPP_API_URL=your-whatsapp-api-url
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Run migrations
npx prisma migrate dev

# Seed database (creates admin user)
npx prisma db seed
```

### 3. Start Services

```bash
# From root directory
npm run dev

# This will start:
# - Backend: http://localhost:3000
# - Admin Panel: http://localhost:5173
# - Mobile App: Expo dev server
```

---

## AdMob Setup (For Ads)

### Step 1: Install AdMob SDK

```bash
cd packages/mobile-app
npm install react-native-google-mobile-ads
```

### Step 2: Get AdMob App IDs

1. Go to [Google AdMob Console](https://apps.admob.com/)
2. Create a new app or select existing app
3. Copy the App ID for iOS and Android

### Step 3: Configure App IDs

Edit `packages/mobile-app/app.json`:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
      }
    },
    "android": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
      }
    }
  }
}
```

### Step 4: Get Ad Unit IDs

1. In AdMob Console, go to your app
2. Click "Ad units" → "Add ad unit"
3. Choose format (Banner, Interstitial)
4. Copy the Ad Unit ID

### Step 5: Update Ad Unit IDs

Edit `packages/mobile-app/src/components/ads/AdBanner.tsx`:

```typescript
const AD_UNIT_IDS = {
  ios: {
    banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your iOS banner ad unit ID
  },
  android: {
    banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your Android banner ad unit ID
  },
};
```

**Note**: Test ad unit IDs are already configured for development. Replace with production IDs before release.

---

## Using Ad Display Control

### In Mobile App Screens

```tsx
import AdBanner from '../components/ads/AdBanner';

export default function MyScreen() {
  return (
    <View>
      <Text>My Content</Text>
      
      {/* Display banner ad */}
      <AdBanner 
        adSlotId="dashboard-banner" 
        size={BannerAdSize.BANNER}
      />
    </View>
  );
}
```

### Ad Placement Examples

**Dashboard Screen** (already implemented):
```tsx
<AdBanner adSlotId="dashboard-banner" />
```

**Feed Screens**:
```tsx
{/* Show ad every 5 items */}
{index % 5 === 0 && <AdBanner adSlotId="feed-banner" />}
```

**Interstitial Ads** (full-screen):
```tsx
import { initializeInterstitialAd, showInterstitialAd } from '../components/ads/AdInterstitial';

useEffect(() => {
  initializeInterstitialAd('feed-interstitial');
}, []);

const handleAction = () => {
  showInterstitialAd(); // Show before navigation
  navigation.navigate('NextScreen');
};
```

### Backend Ad Management

**Create Ad Slot** (Admin):
```bash
POST /api/v1/admin/ads/slots
{
  "name": "Dashboard Banner",
  "position": "dashboard-top",
  "format": "banner",
  "isActive": true
}
```

**View Ad Analytics** (Admin):
```bash
GET /api/v1/admin/ads/analytics?slotId=dashboard-banner
```

**Track Impression** (Automatic):
The mobile app automatically tracks impressions when ads load.

---

## Admin Panel Features

### Login Credentials

After seeding the database:
- **Email**: `admin@lifeset.com`
- **Password**: `admin123`

### Notification System

1. Go to `/admin/notifications`
2. Click "Send Notification"
3. Choose:
   - **Send to All**: Send to all active users
   - **Send to Specific User**: Enter user ID
   - **Filter Users**: Use advanced filters:
     - User Type (STUDENT, COMPANY, etc.)
     - City, State
     - Verification Status
     - Registration Date Range
     - College, Course (for students)

### User Management

- View all users
- Filter by type, status
- Activate/Deactivate users
- Search users

### Analytics

- User growth charts
- Engagement metrics
- Ad performance
- Notification stats

---

## Mobile App Features

### Profile Wizard

1. Go to Profile screen
2. Tap "Complete Profile"
3. Follow 4-step wizard:
   - Step 1: Basic Info (name, DOB, address)
   - Step 2: Education (10th, 12th, graduation)
   - Step 3: Skills (technical & soft skills)
   - Step 4: Complete!

### Referral System

1. Go to Profile → "Refer & Earn"
2. View your referral code
3. Grant contacts permission
4. Select contacts from address book
5. Send WhatsApp invites with referral code

### Performance Tracking

1. Go to Profile → "My Performance"
2. View:
   - Performance dial (circular progress)
   - Weekly/Monthly scores
   - Rank
   - Earned badges
   - Weekly progress chart

### Know Yourself (AI)

1. Go to Dashboard → "Know Yourself"
2. Answer personality quiz questions
3. Get AI-powered analysis:
   - Personality type
   - Traits with scores
   - Career recommendations

---

## Testing

### Test Ad Unit IDs

The app automatically uses test IDs in development:

- **iOS Banner**: `ca-app-pub-3940256099942544/2934735716`
- **Android Banner**: `ca-app-pub-3940256099942544/6300978111`
- **iOS Interstitial**: `ca-app-pub-3940256099942544/4411468910`
- **Android Interstitial**: `ca-app-pub-3940256099942544/1033173712`

These always return test ads - perfect for development!

---

## Troubleshooting

### AdMob Not Working

1. **Check Installation**:
   ```bash
   cd packages/mobile-app
   npm list react-native-google-mobile-ads
   ```

2. **Check App IDs**: Verify in `app.json`

3. **Check Ad Unit IDs**: Verify in `AdBanner.tsx`

4. **Check Logs**: Look for AdMob errors in console

### Notifications Not Sending

1. Check Firebase configuration in backend `.env`
2. Verify user has notification tokens
3. Check admin panel logs

### Profile Wizard Not Saving

1. Check backend API is running
2. Verify user is authenticated
3. Check network tab for API errors

---

## Documentation

- **Ad Display Control**: See `AD_DISPLAY_CONTROL_GUIDE.md`
- **Implementation Status**: See `IMPLEMENTATION_STATUS.md`
- **Project Documentation**: See `PROJECT_DOCUMENTATION_NEW_STACK.md`

---

## Production Deployment

### Before Deploying:

1. ✅ Replace test ad unit IDs with production IDs
2. ✅ Update AdMob App IDs in `app.json`
3. ✅ Set production environment variables
4. ✅ Run database migrations
5. ✅ Build mobile app for iOS/Android
6. ✅ Deploy backend to server
7. ✅ Deploy admin panel

---

## Support

All features are complete and ready for use! 🎉

For issues:
- Check logs in admin panel
- Review API documentation at `/api/v1/docs`
- Check `AD_DISPLAY_CONTROL_GUIDE.md` for ad setup
