// Note: AdMob SDK will be available after running: npm install react-native-google-mobile-ads
let mobileAds: any;
try {
  mobileAds = require('react-native-google-mobile-ads').default;
} catch (e) {
  // AdMob not installed yet
  mobileAds = null;
}
import { Platform } from 'react-native';

// Initialize AdMob
export async function initializeAdMob() {
  if (!mobileAds) {
    console.warn('AdMob SDK not installed. Run: npm install react-native-google-mobile-ads');
    return;
  }
  
  try {
    await mobileAds().initialize();
    console.log('AdMob initialized successfully');
    
    // Set request configuration
    await mobileAds().setRequestConfiguration({
      // Set content rating
      maxAdContentRating: mobileAds.MaxAdContentRating.PG,
      // Tag for child-directed treatment
      tagForChildDirectedTreatment: false,
      // Tag for under age of consent
      tagForUnderAgeOfConsent: false,
    });
  } catch (error) {
    console.error('Error initializing AdMob:', error);
  }
}

// Get ad unit ID based on slot and platform
export function getAdUnitId(slotId: string, adType: 'banner' | 'interstitial' | 'rewarded'): string {
  // In development, use test IDs
  if (__DEV__) {
    switch (adType) {
      case 'banner':
        return Platform.OS === 'ios' 
          ? 'ca-app-pub-3940256099942544/2934735716' // iOS Test ID
          : 'ca-app-pub-3940256099942544/6300978111'; // Android Test ID
      case 'interstitial':
        return Platform.OS === 'ios'
          ? 'ca-app-pub-3940256099942544/4411468910' // iOS Test ID
          : 'ca-app-pub-3940256099942544/1033173712'; // Android Test ID
      case 'rewarded':
        return Platform.OS === 'ios'
          ? 'ca-app-pub-3940256099942544/1712485313' // iOS Test ID
          : 'ca-app-pub-3940256099942544/5224354917'; // Android Test ID
    }
  }

  // In production, map slotId to actual ad unit IDs
  // You would fetch this from your backend or config
  const adUnitMap: Record<string, string> = {
    'dashboard-banner': Platform.OS === 'ios' 
      ? 'YOUR_IOS_BANNER_AD_UNIT_ID'
      : 'YOUR_ANDROID_BANNER_AD_UNIT_ID',
    'feed-interstitial': Platform.OS === 'ios'
      ? 'YOUR_IOS_INTERSTITIAL_AD_UNIT_ID'
      : 'YOUR_ANDROID_INTERSTITIAL_AD_UNIT_ID',
    // Add more mappings as needed
  };

  return adUnitMap[slotId] || (Platform.OS === 'ios' 
    ? 'ca-app-pub-3940256099942544/2934735716'
    : 'ca-app-pub-3940256099942544/6300978111');
}

