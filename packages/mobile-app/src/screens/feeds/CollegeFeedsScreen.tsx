import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api/client';
import { useAuthStore } from '../../store/authStore';

export default function CollegeFeedsScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();

  const { data: feeds, isLoading, refetch } = useQuery({
    queryKey: ['college-feeds'],
    queryFn: async () => {
      const response = await apiClient.get('/feeds', {
        params: { type: 'COLLEGE_FEED' },
      });
      return response.data.data || response.data;
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLike = async (feedId: string) => {
    try {
      await apiClient.post(`/feeds/${feedId}/like`);
      refetch();
    } catch (error) {
      console.error('Error liking feed:', error);
    }
  };

  const handleBookmark = async (feedId: string) => {
    try {
      await apiClient.post(`/feeds/${feedId}/bookmark`);
      refetch();
    } catch (error) {
      console.error('Error bookmarking feed:', error);
    }
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
          <View key={feed.id} style={styles.feedCard}>
            {/* Header */}
            <View style={styles.feedHeader}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {feed.user?.email?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.userName}>
                    {feed.user?.email?.split('@')[0] || 'User'}
                  </Text>
                  <Text style={styles.timeAgo}>
                    {new Date(feed.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Content */}
            <Text style={styles.feedTitle}>{feed.title}</Text>
            <Text style={styles.feedDescription}>{feed.description}</Text>

            {/* Images */}
            {feed.images && feed.images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                {feed.images.map((image: string, index: number) => (
                  <Image key={index} source={{ uri: image }} style={styles.feedImage} />
                ))}
              </ScrollView>
            )}

            {/* Actions */}
            <View style={styles.feedActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleLike(feed.id)}
              >
                <Text style={styles.actionIcon}>❤️</Text>
                <Text style={styles.actionText}>{feed._count?.likes || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionText}>{feed._count?.comments || 0}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleBookmark(feed.id)}
              >
                <Text style={styles.actionIcon}>🔖</Text>
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No college feeds available</Text>
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
  feedCard: {
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
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  timeAgo: {
    fontSize: 12,
    color: '#6b7280',
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  feedDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
  },
  feedImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginRight: 8,
  },
  feedActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  actionText: {
    fontSize: 14,
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

