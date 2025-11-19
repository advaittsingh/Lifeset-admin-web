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

export default function GurujiScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);

  const { data: content, isLoading, refetch } = useQuery({
    queryKey: ['guruji-content'],
    queryFn: async () => {
      const response = await apiClient.get('/mentors/guruji');
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Guruji</Text>
        <Text style={styles.headerSubtitle}>Wisdom from Industry Leaders</Text>
      </View>

      {content && content.length > 0 ? (
        content.map((item: any) => (
          <TouchableOpacity
            key={item.id}
            style={styles.contentCard}
            onPress={() => navigation.navigate('GurujiDetail', { contentId: item.id })}
          >
            <View style={styles.contentHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>🧘</Text>
              </View>
              <View style={styles.contentInfo}>
                <Text style={styles.contentTitle}>{item.title}</Text>
                <Text style={styles.contentAuthor}>By {item.author || 'Guruji'}</Text>
              </View>
            </View>
            <Text style={styles.contentDescription} numberOfLines={3}>
              {item.description || item.content}
            </Text>
            <View style={styles.contentFooter}>
              <Text style={styles.contentDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <TouchableOpacity>
                <Text style={styles.readMoreText}>Read More →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No Guruji content available</Text>
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
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  contentCard: {
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
  contentHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  contentAuthor: {
    fontSize: 14,
    color: '#6b7280',
  },
  contentDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  contentDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  readMoreText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
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

