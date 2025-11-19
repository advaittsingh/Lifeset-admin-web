import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/client';
import { useAuthStore } from '../../store/authStore';

export default function NetworkingScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const response = await apiClient.get('/users/network/connections');
      return response.data.data || response.data;
    },
  });

  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ['connection-requests'],
    queryFn: async () => {
      const response = await apiClient.get('/users/network/requests');
      return response.data.data || response.data;
    },
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['search-users', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await apiClient.get(`/users/network/search?q=${encodeURIComponent(searchQuery)}`);
      return response.data.data || response.data;
    },
    enabled: searchQuery.length > 2,
  });

  const sendRequestMutation = useMutation({
    mutationFn: (receiverId: string) =>
      apiClient.post('/users/network/request', { receiverId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-users'] });
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: (connectionId: string) =>
      apiClient.post(`/users/network/connections/${connectionId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9ca3af"
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Connection Requests */}
        {requests && requests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connection Requests</Text>
            {requests.map((request: any) => (
              <View key={request.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {request.requester?.email?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {request.requester?.email?.split('@')[0] || 'User'}
                    </Text>
                    <Text style={styles.userEmail}>{request.requester?.email}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => acceptRequestMutation.mutate(request.id)}
                >
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Search Results */}
        {searchQuery.length > 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Search Results</Text>
            {searchLoading ? (
              <ActivityIndicator size="large" color="#3b82f6" />
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((result: any) => (
                <View key={result.id} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {result.email?.charAt(0).toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>
                        {result.email?.split('@')[0] || 'User'}
                      </Text>
                      <Text style={styles.userEmail}>{result.email}</Text>
                      <Text style={styles.userType}>{result.userType}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.connectButton}
                    onPress={() => sendRequestMutation.mutate(result.id)}
                    disabled={sendRequestMutation.isPending}
                  >
                    <Text style={styles.connectButtonText}>Connect</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noResults}>No users found</Text>
            )}
          </View>
        )}

        {/* My Connections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Connections ({connections?.length || 0})</Text>
          {connectionsLoading ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : connections && connections.length > 0 ? (
            connections.map((connection: any) => {
              const otherUser = connection.requesterId === user?.id 
                ? connection.receiver 
                : connection.requester;
              return (
                <View key={connection.id} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {otherUser?.email?.charAt(0).toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>
                        {otherUser?.email?.split('@')[0] || 'User'}
                      </Text>
                      <Text style={styles.userEmail}>{otherUser?.email}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.messageButton}
                    onPress={() => navigation.navigate('Chat', { userId: otherUser?.id })}
                  >
                    <Text style={styles.messageButtonText}>Message</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <Text style={styles.noResults}>No connections yet</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  userType: {
    fontSize: 12,
    color: '#9ca3af',
  },
  connectButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  messageButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  messageButtonText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  noResults: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 20,
  },
});

