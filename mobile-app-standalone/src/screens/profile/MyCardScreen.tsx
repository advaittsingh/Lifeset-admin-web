import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api/client';

export default function MyCardScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [isSharing, setIsSharing] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const response = await apiClient.get('/profiles/me');
      return response.data.data || response.data;
    },
    enabled: !!user?.id,
  });

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out my LifeSet profile!\n\n${user?.email || user?.mobile}\n\nDownload LifeSet app to connect with me!`,
        title: 'My LifeSet Card',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share card');
    }
  };

  const studentProfile = profile?.studentProfile;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {profile?.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Name & Title */}
        <View style={styles.nameSection}>
          <Text style={styles.name}>
            {studentProfile?.firstName && studentProfile?.lastName
              ? `${studentProfile.firstName} ${studentProfile.lastName}`
              : user?.email?.split('@')[0] || 'User'}
          </Text>
          {studentProfile?.course?.name && (
            <Text style={styles.title}>{studentProfile.course.name}</Text>
          )}
          {studentProfile?.college?.name && (
            <Text style={styles.subtitle}>{studentProfile.college.name}</Text>
          )}
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          {user?.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          )}
          {user?.mobile && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile:</Text>
              <Text style={styles.infoValue}>{user.mobile}</Text>
            </View>
          )}
        </View>

        {/* Skills */}
        {studentProfile?.technicalSkills && studentProfile.technicalSkills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {studentProfile.technicalSkills.map((skill: string, index: number) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Education */}
        {studentProfile?.graduation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <Text style={styles.educationText}>
              {studentProfile.graduation.degree} - {studentProfile.graduation.institution}
            </Text>
          </View>
        )}

        {/* Profile Score */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>Profile Completion</Text>
          <Text style={styles.scoreValue}>{Math.round(studentProfile?.profileScore || 0)}%</Text>
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
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  avatar: {
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  shareButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  nameSection: {
    marginBottom: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    color: '#3b82f6',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  skillText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  educationText: {
    fontSize: 14,
    color: '#1f2937',
  },
  scoreSection: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
});

