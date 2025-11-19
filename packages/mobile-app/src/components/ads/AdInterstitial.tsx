// Note: AdMob SDK will be available after running: npm install react-native-google-mobile-ads
let InterstitialAd: any, AdEventType: any, TestIds: any;
try {
  const ads = require('react-native-google-mobile-ads');
  InterstitialAd = ads.InterstitialAd;
  AdEventType = ads.AdEventType;
  TestIds = ads.TestIds;
} catch (e) {
  // AdMob not installed yet
  InterstitialAd = null;
  AdEventType = {};
  TestIds = { INTERSTITIAL: 'test-interstitial' };
}
import { Platform } from 'react-native';
import { apiClient } from '../../services/api/client';

// Ad Unit IDs - Replace with your actual AdMob ad unit IDs
const AD_UNIT_IDS = {
  ios: {
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3940256099942544/4411468910', // Replace with your iOS interstitial ad unit ID
  },
  android: {
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-3940256099942544/1033173712', // Replace with your Android interstitial ad unit ID
  },
};

let interstitialAd: InterstitialAd | null = null;

export function initializeInterstitialAd(adSlotId: string) {
  if (!InterstitialAd) {
    console.warn('AdMob SDK not installed. Run: npm install react-native-google-mobile-ads');
    return null;
  }

  const adUnitId = Platform.OS === 'ios' 
    ? AD_UNIT_IDS.ios.interstitial 
    : AD_UNIT_IDS.android.interstitial;

  interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: false,
  });

  // Track ad load
  interstitialAd.addAdEventListener(AdEventType.LOADED, async () => {
    try {
      await apiClient.post('/ads/impression', { 
        adSlotId,
        platform: Platform.OS,
        adType: 'interstitial',
      });
    } catch (error) {
      console.error('Error tracking ad impression:', error);
    }
  });

  // Load the ad
  interstitialAd.load();

  return interstitialAd;
}

export function showInterstitialAd() {
  if (interstitialAd && interstitialAd.loaded) {
    interstitialAd.show();
    // Reload for next time
    interstitialAd.load();
  }
}

