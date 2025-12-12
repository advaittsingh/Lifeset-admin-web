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

export default function JobsScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['jobs', searchQuery],
    queryFn: async () => {
      const response = await apiClient.get('/jobs', {
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
          placeholder="Search jobs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {jobs && jobs.length > 0 ? (
          jobs.map((job: any) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
            >
              <Text style={styles.jobTitle}>{job.jobTitle}</Text>
              <Text style={styles.companyName}>
                {job.company?.companyName || job.post?.user?.email || 'Company'}
              </Text>
              
              <View style={styles.jobDetails}>
                {job.location && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>📍</Text>
                    <Text style={styles.detailText}>{job.location}</Text>
                  </View>
                )}
                {(job.salaryMin || job.salaryMax) && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailIcon}>💰</Text>
                    <Text style={styles.detailText}>
                      {job.salaryMin && job.salaryMax
                        ? `$${job.salaryMin}k - $${job.salaryMax}k`
                        : job.salaryMin
                        ? `$${job.salaryMin}k+`
                        : `Up to $${job.salaryMax}k`}
                    </Text>
                  </View>
                )}
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>👥</Text>
                  <Text style={styles.detailText}>
                    {job._count?.jobApplications || 0} applications
                  </Text>
                </View>
              </View>

              <Text style={styles.jobDescription} numberOfLines={2}>
                {job.jobDescription}
              </Text>

              {job.skills && job.skills.length > 0 && (
                <View style={styles.skillsContainer}>
                  {job.skills.slice(0, 3).map((skill: string, index: number) => (
                    <View key={index} style={styles.skillTag}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                  {job.skills.length > 3 && (
                    <Text style={styles.moreSkills}>+{job.skills.length - 3} more</Text>
                  )}
                </View>
              )}

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
              >
                <Text style={styles.applyButtonText}>View & Apply</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No jobs available</Text>
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
  jobTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: '#3b82f6',
    marginBottom: 12,
  },
  jobDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  jobDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: 12,
    color: '#6b7280',
    alignSelf: 'center',
  },
  applyButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
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

