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

export default function GovtVacanciesScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['govt-vacancies'],
    queryFn: async () => {
      const response = await apiClient.get('/feeds', {
        params: { type: 'GOVT_JOB' },
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
      {jobs && jobs.length > 0 ? (
        jobs.map((job: any) => (
          <TouchableOpacity
            key={job.id}
            style={styles.jobCard}
            onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
          >
            <View style={styles.jobHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Government</Text>
              </View>
              <Text style={styles.jobDate}>
                {new Date(job.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.jobDescription} numberOfLines={3}>
              {job.description}
            </Text>
            <View style={styles.jobFooter}>
              <Text style={styles.jobType}>Full Time</Text>
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No government vacancies available</Text>
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
  jobCard: {
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
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706',
  },
  jobDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  jobDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  jobType: {
    fontSize: 14,
    color: '#6b7280',
  },
  applyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 14,
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

