import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/client';
import { useAuthStore } from '../../store/authStore';

export default function ReferralScreen({ navigation }: any) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: referralData } = useQuery({
    queryKey: ['my-referral-code'],
    queryFn: async () => {
      const response = await apiClient.get('/referral/my-code');
      return response.data.data || response.data;
    },
  });

  const { data: myReferrals } = useQuery({
    queryKey: ['my-referrals'],
    queryFn: async () => {
      const response = await apiClient.get('/referral/my-referrals');
      return response.data.data || response.data;
    },
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['referral-leaderboard'],
    queryFn: async () => {
      const response = await apiClient.get('/referral/leaderboard');
      return response.data.data || response.data;
    },
  });

  useEffect(() => {
    requestContactsPermission();
  }, []);

  const requestContactsPermission = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      setHasPermission(true);
      loadContacts();
    } else {
      Alert.alert('Permission Required', 'Please grant contacts permission to invite friends');
    }
  };

  const loadContacts = async () => {
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const sendWhatsAppInvite = async () => {
    if (selectedContacts.length === 0) {
      Alert.alert('Error', 'Please select at least one contact');
      return;
    }

    const referralCode = referralData?.referralCode || 'LIFESET2024';
    const message = `Join me on LifeSet! Use my referral code: ${referralCode}\n\nDownload the app and start your journey!`;

    const selectedContactNumbers = contacts
      .filter((c) => selectedContacts.includes(c.id))
      .map((c) => c.phoneNumbers?.[0]?.number?.replace(/\D/g, '') || '')
      .filter(Boolean);

    for (const phoneNumber of selectedContactNumbers) {
      const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      try {
        const canOpen = await Linking.canOpenURL(whatsappUrl);
        if (canOpen) {
          await Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed');
        }
      } catch (error) {
        console.error('Error opening WhatsApp:', error);
      }
    }

    setSelectedContacts([]);
    Alert.alert('Success', 'Invites sent via WhatsApp!');
  };

  return (
    <ScrollView style={styles.container}>
      {/* My Referral Code */}
      <View style={styles.codeSection}>
        <Text style={styles.sectionTitle}>My Referral Code</Text>
        <View style={styles.codeCard}>
          <Text style={styles.codeText}>{referralData?.referralCode || 'Loading...'}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => {
              // Copy to clipboard
              Alert.alert('Copied!', 'Referral code copied to clipboard');
            }}
          >
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.codeDescription}>
          Share this code with friends to earn rewards!
        </Text>
      </View>

      {/* Invite Contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invite from Contacts</Text>
        {!hasPermission ? (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestContactsPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Contacts Permission</Text>
          </TouchableOpacity>
        ) : (
          <>
            <ScrollView style={styles.contactsList} nestedScrollEnabled>
              {contacts.slice(0, 50).map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={[
                    styles.contactItem,
                    selectedContacts.includes(contact.id) && styles.contactItemSelected,
                  ]}
                  onPress={() => toggleContactSelection(contact.id)}
                >
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>
                      {contact.name || 'Unknown'}
                    </Text>
                    {contact.phoneNumbers && contact.phoneNumbers[0] && (
                      <Text style={styles.contactPhone}>
                        {contact.phoneNumbers[0].number}
                      </Text>
                    )}
                  </View>
                  {selectedContacts.includes(contact.id) && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[
                styles.inviteButton,
                selectedContacts.length === 0 && styles.inviteButtonDisabled,
              ]}
              onPress={sendWhatsAppInvite}
              disabled={selectedContacts.length === 0}
            >
              <Text style={styles.inviteButtonText}>
                Invite {selectedContacts.length > 0 ? `${selectedContacts.length} ` : ''}via WhatsApp
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* My Referrals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Referrals ({myReferrals?.length || 0})</Text>
        {myReferrals && myReferrals.length > 0 ? (
          myReferrals.map((referral: any) => (
            <View key={referral.id} style={styles.referralCard}>
              <Text style={styles.referralName}>
                {referral.referred?.email?.split('@')[0] || 'User'}
              </Text>
              <Text style={styles.referralStatus}>
                Status: {referral.status}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No referrals yet</Text>
        )}
      </View>

      {/* Leaderboard */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Referrers</Text>
        {leaderboard && leaderboard.length > 0 ? (
          leaderboard.slice(0, 10).map((item: any, index: number) => (
            <View key={item.user?.id || index} style={styles.leaderboardItem}>
              <Text style={styles.leaderboardRank}>#{index + 1}</Text>
              <View style={styles.leaderboardInfo}>
                <Text style={styles.leaderboardName}>
                  {item.user?.email?.split('@')[0] || 'User'}
                </Text>
                <Text style={styles.leaderboardCount}>
                  {item.referralCount} referrals
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No leaderboard data</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  codeSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  codeCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    letterSpacing: 4,
    marginBottom: 12,
  },
  copyButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  codeDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  contactsList: {
    maxHeight: 300,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  contactItemSelected: {
    backgroundColor: '#eff6ff',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inviteButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  inviteButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  inviteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  referralCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  referralStatus: {
    fontSize: 14,
    color: '#6b7280',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  leaderboardRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    width: 40,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  leaderboardCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
  },
});

