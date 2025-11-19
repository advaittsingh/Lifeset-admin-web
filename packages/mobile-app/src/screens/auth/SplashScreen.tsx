import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function SplashScreen({ navigation }: any) {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
    
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('Main');
      } else {
        navigation.replace('Login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>LifeSet</Text>
        <Text style={styles.tagline}>Your Career Journey Starts Here</Text>
        <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#e0e7ff',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});
