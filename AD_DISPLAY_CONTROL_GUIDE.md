# Ad Display Control - Usage Guide

## Overview

The LifeSet platform includes a comprehensive ad management system that allows you to control ad display across the mobile app and track ad impressions in the backend.

## Architecture

### Backend Components

1. **Ad Slot Management** (`/api/v1/ads/slots`)
   - Create and manage ad slots
   - Configure ad positions and formats
   - Enable/disable ad slots

2. **Ad Impression Tracking** (`/api/v1/ads/impression`)
   - Track when ads are displayed
   - Record user interactions
   - Calculate revenue

### Mobile App Components

1. **AdBanner Component** - Displays banner ads
2. **AdInterstitial Component** - Shows full-screen interstitial ads
3. **AdMob SDK Integration** - Google Mobile Ads SDK

---

## Setup Instructions

### 1. Install AdMob SDK

```bash
cd packages/mobile-app
npm install react-native-google-mobile-ads
```

### 2. Configure AdMob App IDs

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

**Get your AdMob App IDs:**
1. Go to [Google AdMob Console](https://apps.admob.com/)
2. Create a new app or select existing app
3. Copy the App ID for iOS and Android

### 3. Get Ad Unit IDs

1. In AdMob Console, go to your app
2. Click "Ad units" → "Add ad unit"
3. Choose ad format (Banner, Interstitial, Rewarded)
4. Copy the Ad Unit ID

### 4. Update Ad Unit IDs in Code

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

---

## Usage Examples

### 1. Display Banner Ad in a Screen

```tsx
import AdBanner from '../components/ads/AdBanner';

export default function MyScreen() {
  return (
    <View>
      <Text>My Content</Text>
      
      {/* Banner Ad */}
      <AdBanner 
        adSlotId="dashboard-banner" 
        size={BannerAdSize.BANNER}
      />
      
      <Text>More Content</Text>
    </View>
  );
}
```

### 2. Show Interstitial Ad

```tsx
import { initializeInterstitialAd, showInterstitialAd } from '../components/ads/AdInterstitial';
import { useEffect } from 'react';

export default function MyScreen() {
  useEffect(() => {
    // Initialize interstitial ad when screen loads
    initializeInterstitialAd('feed-interstitial');
  }, []);

  const handleAction = () => {
    // Show interstitial ad before navigation
    showInterstitialAd();
    navigation.navigate('NextScreen');
  };

  return (
    <View>
      <Button onPress={handleAction} title="Continue" />
    </View>
  );
}
```

### 3. Ad Sizes

```tsx
import { BannerAdSize } from 'react-native-google-mobile-ads';

// Available sizes:
<AdBanner adSlotId="slot1" size={BannerAdSize.BANNER} />           // 320x50
<AdBanner adSlotId="slot2" size={BannerAdSize.LARGE_BANNER} />     // 320x100
<AdBanner adSlotId="slot3" size={BannerAdSize.MEDIUM_RECTANGLE} /> // 300x250
<AdBanner adSlotId="slot4" size={BannerAdSize.FULL_BANNER} />      // 468x60
<AdBanner adSlotId="slot5" size={BannerAdSize.LEADERBOARD} />     // 728x90
```

---

## Backend Ad Management

### Create Ad Slot (Admin)

```bash
POST /api/v1/admin/ads/slots
{
  "name": "Dashboard Banner",
  "position": "dashboard-top",
  "format": "banner",
  "isActive": true
}
```

### Track Ad Impression (Automatic)

The mobile app automatically tracks impressions when ads are loaded:

```typescript
// This happens automatically in AdBanner component
await apiClient.post('/ads/impression', { 
  adSlotId: 'dashboard-banner',
  platform: 'ios', // or 'android'
});
```

### View Ad Analytics (Admin)

```bash
GET /api/v1/admin/ads/analytics?slotId=dashboard-banner&startDate=2024-01-01&endDate=2024-01-31
```

---

## Ad Placement Strategy

### Recommended Positions

1. **Dashboard**
   - Banner ad at top (after header)
   - Interstitial ad when navigating to detailed screens

2. **Feed Screens**
   - Banner ad between feed items (every 5-10 items)
   - Interstitial ad when opening full post

3. **Profile Screens**
   - Banner ad at bottom
   - Avoid interstitial ads (user is viewing their own content)

4. **MCQ/Quiz Screens**
   - Banner ad after completing a question
   - Rewarded ad for hints/extra time

### Best Practices

1. **Don't Overload**: Maximum 1-2 ads per screen
2. **User Experience**: Place ads where they don't interrupt content flow
3. **Loading States**: Show placeholder while ad loads
4. **Error Handling**: Gracefully handle ad load failures
5. **Testing**: Always use test ad unit IDs during development

---

## Testing

### Test Ad Unit IDs

AdMob provides test ad unit IDs that always return test ads:

```typescript
// iOS Test IDs
Banner: 'ca-app-pub-3940256099942544/2934735716'
Interstitial: 'ca-app-pub-3940256099942544/4411468910'
Rewarded: 'ca-app-pub-3940256099942544/1712485313'

// Android Test IDs
Banner: 'ca-app-pub-3940256099942544/6300978111'
Interstitial: 'ca-app-pub-3940256099942544/1033173712'
Rewarded: 'ca-app-pub-3940256099942544/5224354917'
```

The code automatically uses test IDs in development mode (`__DEV__`).

---

## Troubleshooting

### Ad Not Showing

1. **Check AdMob App ID**: Ensure it's correctly set in `app.json`
2. **Check Ad Unit ID**: Verify the ad unit ID matches your AdMob console
3. **Check Network**: Ensure device has internet connection
4. **Check Logs**: Look for AdMob error messages in console
5. **Wait Time**: New ad units may take a few hours to start serving ads

### Common Errors

- **"Ad failed to load"**: Ad unit ID might be incorrect or ad unit not ready
- **"No ad config"**: AdMob App ID not configured
- **"Network error"**: Check internet connection

---

## Revenue Tracking

The backend automatically tracks:
- Ad impressions (when ad is displayed)
- Ad clicks (when user clicks ad)
- Revenue estimates (from AdMob)

View analytics in admin panel: `/admin/analytics/ads`

---

## Environment Variables

Add to `.env`:

```bash
# AdMob (optional - mainly for server-side tracking)
ADMOB_API_KEY=your-admob-api-key
```

---

## Next Steps

1. ✅ Install AdMob SDK
2. ✅ Configure App IDs in `app.json`
3. ✅ Replace test ad unit IDs with production IDs
4. ✅ Test ads in development
5. ✅ Deploy to production
6. ✅ Monitor ad performance in AdMob console

---

## Support

For AdMob-specific issues:
- [AdMob Documentation](https://developers.google.com/admob)
- [AdMob Support](https://support.google.com/admob)

For LifeSet platform issues:
- Check backend logs: `/api/v1/admin/logs`
- Check ad analytics: `/api/v1/admin/ads/analytics`

