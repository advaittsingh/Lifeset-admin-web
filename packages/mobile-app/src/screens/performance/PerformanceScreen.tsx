import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Circle } from 'react-native-progress';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api/client';
import { useAuthStore } from '../../store/authStore';

export default function PerformanceScreen({ navigation }: any) {
  const { user } = useAuthStore();

  const { data: score, isLoading: scoreLoading } = useQuery({
    queryKey: ['user-score'],
    queryFn: async () => {
      const response = await apiClient.get('/performance/score');
      return response.data.data || response.data;
    },
  });

  const { data: badges, isLoading: badgesLoading } = useQuery({
    queryKey: ['user-badges'],
    queryFn: async () => {
      const response = await apiClient.get('/performance/badges/my-badges');
      return response.data.data || response.data;
    },
  });

  const { data: weeklyProgress } = useQuery({
    queryKey: ['weekly-progress'],
    queryFn: async () => {
      const response = await apiClient.get('/performance/score/weekly');
      return response.data.data || response.data;
    },
  });

  if (scoreLoading || badgesLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const totalScore = score?.totalScore || 0;
  const weeklyScore = score?.weeklyScore || 0;
  const monthlyScore = score?.monthlyScore || 0;
  const progress = Math.min(100, (totalScore / 2000) * 100);

  return (
    <ScrollView style={styles.container}>
      {/* Performance Dial */}
      <View style={styles.dialSection}>
        <Text style={styles.sectionTitle}>Your Performance</Text>
        <View style={styles.dialContainer}>
          <Circle
            size={200}
            progress={progress / 100}
            showsText={true}
            formatText={() => `${Math.round(progress)}%`}
            color="#3b82f6"
            unfilledColor="#e5e7eb"
            thickness={12}
            textStyle={styles.dialText}
          />
          <View style={styles.dialInfo}>
            <Text style={styles.dialScore}>{totalScore}</Text>
            <Text style={styles.dialLabel}>Total Score</Text>
          </View>
        </View>
      </View>

      {/* Score Breakdown */}
      <View style={styles.scoresSection}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{weeklyScore}</Text>
          <Text style={styles.scoreLabel}>Weekly Score</Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{monthlyScore}</Text>
          <Text style={styles.scoreLabel}>Monthly Score</Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{score?.rank || 'N/A'}</Text>
          <Text style={styles.scoreLabel}>Rank</Text>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badgesSection}>
        <Text style={styles.sectionTitle}>My Badges ({badges?.length || 0})</Text>
        {badges && badges.length > 0 ? (
          <View style={styles.badgesGrid}>
            {badges.map((userBadge: any) => (
              <View key={userBadge.id} style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>
                  {userBadge.badge?.icon || '🏆'}
                </Text>
                <Text style={styles.badgeName}>{userBadge.badge?.name}</Text>
                <Text style={styles.badgeTier}>{userBadge.badge?.tier}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No badges earned yet</Text>
        )}
      </View>

      {/* Weekly Progress */}
      {weeklyProgress && (
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <View style={styles.progressCard}>
            {weeklyProgress.map((day: any, index: number) => (
              <View key={index} style={styles.progressDay}>
                <View
                  style={[
                    styles.progressBar,
                    { height: `${(day.score / 100) * 100}%` },
                  ]}
                />
                <Text style={styles.progressDayLabel}>
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  dialContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  dialInfo: {
    position: 'absolute',
    alignItems: 'center',
  },
  dialScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  dialLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  scoresSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  badgesSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '30%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeTier: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  progressSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressDay: {
    alignItems: 'center',
    flex: 1,
  },
  progressBar: {
    width: 30,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    marginBottom: 8,
    minHeight: 4,
  },
  progressDayLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
  },
});

