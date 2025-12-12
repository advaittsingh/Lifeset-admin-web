import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
// Note: AdMob SDK will be available after running: npm install react-native-google-mobile-ads
// For now, using conditional import to prevent errors
let BannerAd: any, BannerAdSize: any, TestIds: any;
try {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
  TestIds = ads.TestIds;
} catch (e) {
  // AdMob not installed yet - will use placeholder
  BannerAd = null;
  BannerAdSize = { BANNER: 'BANNER' };
  TestIds = { BANNER: 'test-banner' };
}
import { apiClient } from '../../services/api/client';

interface AdBannerProps {
  adSlotId: string;
  style?: any;
  size?: any;
}

// Ad Unit IDs - Replace with your actual AdMob ad unit IDs
const AD_UNIT_IDS = {
  ios: {
    banner: __DEV__ ? (TestIds?.BANNER || 'test-banner') : 'ca-app-pub-3940256099942544/2934735716', // Replace with your iOS banner ad unit ID
  },
  android: {
    banner: __DEV__ ? (TestIds?.BANNER || 'test-banner') : 'ca-app-pub-3940256099942544/6300978111', // Replace with your Android banner ad unit ID
  },
};

export default function AdBanner({ adSlotId, style, size }: AdBannerProps) {
  const [adUnitId, setAdUnitId] = useState<string>('test-banner');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get ad unit ID based on platform
    const platformAdUnitId = Platform.OS === 'ios' 
      ? AD_UNIT_IDS.ios.banner 
      : AD_UNIT_IDS.android.banner;
    setAdUnitId(platformAdUnitId);
  }, []);

  const handleAdLoaded = async () => {
    try {
      // Track ad impression in backend
      await apiClient.post('/ads/impression', { 
        adSlotId,
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Error tracking ad impression:', error);
    }
  };

  const handleAdFailedToLoad = (error: any) => {
    console.error('Ad failed to load:', error);
    setError('Ad failed to load');
  };

  // If AdMob SDK is not installed, show placeholder
  if (!BannerAd) {
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <Text style={styles.placeholderText}>Ad (Install AdMob SDK)</Text>
      </View>
    );
  }

  if (error) {
    // Fallback UI if ad fails to load
    return (
      <View style={[styles.container, styles.placeholder, style]}>
        <Text style={styles.placeholderText}>Ad</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={size || BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  placeholder: {
    height: 50,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
