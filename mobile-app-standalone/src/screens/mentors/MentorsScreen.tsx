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

export default function MentorsScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);

  const { data: mentors, isLoading, refetch } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const response = await apiClient.get('/mentors');
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
      {mentors && mentors.length > 0 ? (
        mentors.map((mentor: any) => (
          <TouchableOpacity
            key={mentor.id}
            style={styles.mentorCard}
            onPress={() => navigation.navigate('MentorDetail', { mentorId: mentor.id })}
          >
            <View style={styles.mentorHeader}>
              <View style={styles.mentorAvatar}>
                {mentor.profileImage ? (
                  <Image source={{ uri: mentor.profileImage }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {mentor.name?.charAt(0).toUpperCase() || 'M'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.mentorInfo}>
                <Text style={styles.mentorName}>{mentor.name || 'Industry Mentor'}</Text>
                <Text style={styles.mentorTitle}>{mentor.title || 'Senior Professional'}</Text>
                <Text style={styles.mentorCompany}>{mentor.company || 'Industry Expert'}</Text>
              </View>
            </View>
            {mentor.bio && (
              <Text style={styles.mentorBio} numberOfLines={3}>
                {mentor.bio}
              </Text>
            )}
            {mentor.expertise && mentor.expertise.length > 0 && (
              <View style={styles.expertiseContainer}>
                {mentor.expertise.slice(0, 3).map((skill: string, index: number) => (
                  <View key={index} style={styles.expertiseTag}>
                    <Text style={styles.expertiseText}>{skill}</Text>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No mentors available</Text>
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
  mentorCard: {
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
  mentorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  mentorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  mentorInfo: {
    flex: 1,
  },
  mentorName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  mentorTitle: {
    fontSize: 16,
    color: '#3b82f6',
    marginBottom: 2,
  },
  mentorCompany: {
    fontSize: 14,
    color: '#6b7280',
  },
  mentorBio: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  expertiseTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expertiseText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  connectButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButtonText: {
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

