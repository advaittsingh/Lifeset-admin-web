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

export default function CollegeEventsScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['college-events'],
    queryFn: async () => {
      const response = await apiClient.get('/feeds', {
        params: { type: 'EVENT' },
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
      {events && events.length > 0 ? (
        events.map((event: any) => {
          const eventDate = event.metadata?.eventDate 
            ? new Date(event.metadata.eventDate) 
            : new Date(event.createdAt);
          
          return (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
            >
              <View style={styles.eventHeader}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateDay}>{eventDate.getDate()}</Text>
                  <Text style={styles.dateMonth}>
                    {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>
                    {eventDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  {event.metadata?.location && (
                    <Text style={styles.eventLocation}>📍 {event.metadata.location}</Text>
                  )}
                </View>
              </View>
              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>
              <TouchableOpacity style={styles.registerButton}>
                <Text style={styles.registerButtonText}>Register</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No college events available</Text>
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
  eventCard: {
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
  eventHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dateBox: {
    width: 60,
    height: 60,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dateMonth: {
    fontSize: 12,
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  eventDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
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

