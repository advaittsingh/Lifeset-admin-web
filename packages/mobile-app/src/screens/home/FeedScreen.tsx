import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';

const mockPosts = [
  {
    id: 1,
    user: 'John Doe',
    avatar: '👤',
    time: '2h ago',
    title: 'New Job Opportunity at Tech Corp',
    description: 'We are hiring software engineers with 2+ years of experience...',
    type: 'JOB',
    likes: 24,
    comments: 8,
  },
  {
    id: 2,
    user: 'Jane Smith',
    avatar: '👤',
    time: '5h ago',
    title: 'Weekly MCQ Challenge',
    description: 'Test your knowledge with our weekly quiz. Top performers get badges!',
    type: 'QUIZ',
    likes: 45,
    comments: 12,
  },
  {
    id: 3,
    user: 'Career Center',
    avatar: '🏢',
    time: '1d ago',
    title: 'Career Development Workshop',
    description: 'Join us this Saturday for an interactive workshop on career planning...',
    type: 'EVENT',
    likes: 67,
    comments: 23,
  },
];

export default function FeedScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'JOB':
        return '#3b82f6';
      case 'QUIZ':
        return '#10b981';
      case 'EVENT':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <Text style={styles.headerSubtitle}>Stay updated with latest opportunities</Text>
      </View>

      {mockPosts.map((post) => (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{post.avatar}</Text>
              </View>
              <View>
                <Text style={styles.userName}>{post.user}</Text>
                <Text style={styles.postTime}>{post.time}</Text>
              </View>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: getTypeColor(post.type) + '20' }]}>
              <Text style={[styles.typeText, { color: getTypeColor(post.type) }]}>
                {post.type}
              </Text>
            </View>
          </View>

          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postDescription}>{post.description}</Text>

          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>❤️</Text>
              <Text style={styles.actionCount}>{post.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionCount}>{post.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🔖</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.applyButton]}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  postCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postHeader: {
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
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  postTime: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  actionCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  applyButton: {
    marginLeft: 'auto',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});
