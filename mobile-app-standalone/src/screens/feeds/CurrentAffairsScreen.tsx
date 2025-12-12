import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api/client';

export default function CurrentAffairsScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);

  const { data: feeds, isLoading, refetch } = useQuery({
    queryKey: ['current-affairs'],
    queryFn: async () => {
      const response = await apiClient.get('/feeds', {
        params: { type: 'CURRENT_AFFAIRS' },
      });
      return response.data.data || response.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {feeds && feeds.length > 0 ? (
        feeds.map((feed: any) => (
          <TouchableOpacity
            key={feed.id}
            style={styles.newsCard}
            onPress={() => navigation.navigate('FeedDetail', { feedId: feed.id })}
          >
            <View style={styles.newsHeader}>
              <Text style={styles.newsCategory}>Current Affairs</Text>
              <Text style={styles.newsDate}>
                {new Date(feed.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.newsTitle}>{feed.title}</Text>
            <Text style={styles.newsDescription} numberOfLines={3}>
              {feed.description}
            </Text>
            <View style={styles.newsFooter}>
              <Text style={styles.newsSource}>LifeSet News</Text>
              <View style={styles.newsStats}>
                <Text style={styles.statText}>👁️ {feed._count?.likes || 0}</Text>
                <Text style={styles.statText}>💬 {feed._count?.comments || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No current affairs available</Text>
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
  newsCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  newsCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
  },
  newsDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  newsSource: {
    fontSize: 12,
    color: '#6b7280',
  },
  newsStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

