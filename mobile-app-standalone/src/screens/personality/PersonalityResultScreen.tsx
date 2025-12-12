import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function PersonalityResultScreen({ navigation }: any) {
  const route = useRoute();
  const result = route.params?.result || {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Personality Profile</Text>
        <Text style={styles.headerSubtitle}>Know Yourself Better</Text>
      </View>

      <View style={styles.resultCard}>
        <Text style={styles.resultType}>{result.personalityType || 'Analyst'}</Text>
        <Text style={styles.resultDescription}>
          {result.description || 'You are a logical and analytical thinker who enjoys solving complex problems.'}
        </Text>
      </View>

      {result.traits && result.traits.length > 0 && (
        <View style={styles.traitsSection}>
          <Text style={styles.sectionTitle}>Your Traits</Text>
          {result.traits.map((trait: any, index: number) => (
            <View key={index} style={styles.traitCard}>
              <Text style={styles.traitName}>{trait.name}</Text>
              <View style={styles.traitBar}>
                <View
                  style={[
                    styles.traitFill,
                    { width: `${trait.score || 0}%` },
                  ]}
                />
              </View>
              <Text style={styles.traitScore}>{trait.score || 0}%</Text>
            </View>
          ))}
        </View>
      )}

      {result.recommendations && (
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Career Recommendations</Text>
          {result.recommendations.map((rec: string, index: number) => (
            <View key={index} style={styles.recommendationCard}>
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => {
          // Share functionality
        }}
      >
        <Text style={styles.shareButtonText}>Share Results</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  resultCard: {
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
  resultType: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    textAlign: 'center',
  },
  traitsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  traitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  traitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  traitBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  traitFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  traitScore: {
    fontSize: 14,
    color: '#6b7280',
  },
  recommendationsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
  shareButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

