import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api/client';

export default function ExploreInstituteScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: institutes, isLoading, refetch } = useQuery({
    queryKey: ['institutes', searchQuery],
    queryFn: async () => {
      const response = await apiClient.get('/institutes', {
        params: { search: searchQuery || undefined },
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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search institutes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {institutes && institutes.length > 0 ? (
          institutes.map((institute: any) => (
            <TouchableOpacity
              key={institute.id}
              style={styles.instituteCard}
              onPress={() => navigation.navigate('InstituteDetail', { instituteId: institute.id })}
            >
              <View style={styles.instituteHeader}>
                <View style={styles.instituteIcon}>
                  <Text style={styles.instituteIconText}>🏛️</Text>
                </View>
                <View style={styles.instituteInfo}>
                  <Text style={styles.instituteName}>{institute.name}</Text>
                  {institute.city && institute.state && (
                    <Text style={styles.instituteLocation}>
                      📍 {institute.city}, {institute.state}
                    </Text>
                  )}
                  {institute.code && (
                    <Text style={styles.instituteCode}>Code: {institute.code}</Text>
                  )}
                </View>
              </View>
              {institute._count && (
                <View style={styles.instituteStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{institute._count.students || 0}</Text>
                    <Text style={styles.statLabel}>Students</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{institute._count.courses || 0}</Text>
                    <Text style={styles.statLabel}>Courses</Text>
                  </View>
                </View>
              )}
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No institutes found</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  searchContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  content: {
    flex: 1,
  },
  instituteCard: {
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
  instituteHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instituteIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instituteIconText: {
    fontSize: 28,
  },
  instituteInfo: {
    flex: 1,
  },
  instituteName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  instituteLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  instituteCode: {
    fontSize: 12,
    color: '#9ca3af',
  },
  instituteStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 16,
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

