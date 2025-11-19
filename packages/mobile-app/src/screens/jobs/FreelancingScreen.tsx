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

export default function FreelancingScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ['freelancing'],
    queryFn: async () => {
      const response = await apiClient.get('/feeds', {
        params: { type: 'FREELANCING' },
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
      {projects && projects.length > 0 ? (
        projects.map((project: any) => (
          <TouchableOpacity
            key={project.id}
            style={styles.projectCard}
            onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
          >
            <View style={styles.projectHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Freelance</Text>
              </View>
              <Text style={styles.projectDate}>
                {new Date(project.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <Text style={styles.projectDescription} numberOfLines={3}>
              {project.description}
            </Text>
            {project.metadata?.budget && (
              <Text style={styles.projectBudget}>Budget: ${project.metadata.budget}</Text>
            )}
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>View Project</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No freelance projects available</Text>
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
  projectCard: {
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
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#fce7f3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#be185d',
  },
  projectDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  projectBudget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 12,
  },
  applyButton: {
    backgroundColor: '#8b5cf6',
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

