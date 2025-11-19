import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import AdBanner from '../../components/ads/AdBanner';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();

  const quickActions = [
    { title: 'My Card', icon: '💳', screen: 'MyCard', color: '#3b82f6' },
    { title: 'Networking', icon: '👥', screen: 'Networking', color: '#10b981' },
    { title: 'College Feeds', icon: '📚', screen: 'CollegeFeeds', color: '#f59e0b' },
    { title: 'Current Affairs', icon: '📰', screen: 'CurrentAffairs', color: '#8b5cf6' },
    { title: 'General Knowledge', icon: '🧠', screen: 'GeneralKnowledge', color: '#ec4899' },
    { title: 'MCQ Practice', icon: '✍️', screen: 'MCQ', color: '#06b6d4' },
    { title: 'Know Yourself', icon: '🔮', screen: 'KnowYourself', color: '#f97316' },
    { title: 'Daily Digest', icon: '📖', screen: 'DailyDigest', color: '#14b8a6' },
    { title: 'Govt Vacancies', icon: '🏛️', screen: 'GovtVacancies', color: '#6366f1' },
    { title: 'Jobs', icon: '💼', screen: 'Jobs', color: '#3b82f6' },
    { title: 'Internships', icon: '🎓', screen: 'Internships', color: '#10b981' },
    { title: 'Freelancing', icon: '💻', screen: 'Freelancing', color: '#8b5cf6' },
    { title: 'College Events', icon: '🎉', screen: 'CollegeEvents', color: '#ec4899' },
    { title: 'Community', icon: '👨‍👩‍👧‍👦', screen: 'StudentsCommunity', color: '#f59e0b' },
    { title: 'Mentors', icon: '🎯', screen: 'Mentors', color: '#06b6d4' },
    { title: 'Guruji', icon: '🧘', screen: 'Guruji', color: '#f97316' },
    { title: 'Explore Institutes', icon: '🏛️', screen: 'ExploreInstitute', color: '#14b8a6' },
    { title: 'Refer & Earn', icon: '🎁', screen: 'Referral', color: '#6366f1' },
    { title: 'My Performance', icon: '📊', screen: 'Performance', color: '#3b82f6' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.userName}>
          {user?.email?.split('@')[0] || 'User'}
        </Text>
      </View>

      {/* Ad Banner */}
      <AdBanner adSlotId="dashboard-banner" style={styles.adBanner} />

      {/* Quick Actions Grid */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.grid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { borderLeftColor: action.color }]}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  adBanner: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  actionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 44) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
});
