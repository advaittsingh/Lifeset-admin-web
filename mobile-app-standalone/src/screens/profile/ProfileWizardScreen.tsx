import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/client';
import { useAuthStore } from '../../store/authStore';

const STEPS = [
  { id: 1, title: 'Basic Info', key: 'basic' },
  { id: 2, title: 'Education', key: 'education' },
  { id: 3, title: 'Skills', key: 'skills' },
  { id: 4, title: 'Complete', key: 'complete' },
];

export default function ProfileWizardScreen({ navigation }: any) {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Form data
  const [basicInfo, setBasicInfo] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [education, setEducation] = useState({
    education10th: { institution: '', year: '', percentage: '' },
    education12th: { institution: '', year: '', percentage: '' },
    graduation: { degree: '', institution: '', year: '', percentage: '' },
  });

  const [skills, setSkills] = useState({
    technicalSkills: [] as string[],
    softSkills: [] as string[],
  });

  const [currentSkill, setCurrentSkill] = useState('');

  // Fetch existing profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const response = await apiClient.get('/profiles/me');
      return response.data.data || response.data;
    },
    enabled: !!user?.id,
    onSuccess: (data) => {
      if (data?.studentProfile) {
        const sp = data.studentProfile;
        setBasicInfo({
          firstName: sp.firstName || '',
          lastName: sp.lastName || '',
          dateOfBirth: sp.dateOfBirth ? new Date(sp.dateOfBirth).toISOString().split('T')[0] : '',
          gender: sp.gender || '',
          address: sp.address || '',
          city: sp.city || '',
          state: sp.state || '',
          pincode: sp.pincode || '',
        });
        if (sp.education10th) setEducation(prev => ({ ...prev, education10th: sp.education10th }));
        if (sp.education12th) setEducation(prev => ({ ...prev, education12th: sp.education12th }));
        if (sp.graduation) setEducation(prev => ({ ...prev, graduation: sp.graduation }));
        setSkills({
          technicalSkills: sp.technicalSkills || [],
          softSkills: sp.softSkills || [],
        });
      }
    },
  });

  const updateBasicInfoMutation = useMutation({
    mutationFn: (data: any) => apiClient.put('/profiles/student', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setCurrentStep(2);
    },
    onError: () => Alert.alert('Error', 'Failed to save basic info'),
  });

  const updateEducationMutation = useMutation({
    mutationFn: (data: any) => apiClient.put('/profiles/student/education', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setCurrentStep(3);
    },
    onError: () => Alert.alert('Error', 'Failed to save education'),
  });

  const updateSkillsMutation = useMutation({
    mutationFn: (data: any) => apiClient.put('/profiles/student/skills', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setCurrentStep(4);
    },
    onError: () => Alert.alert('Error', 'Failed to save skills'),
  });

  const handleNext = () => {
    if (currentStep === 1) {
      if (!basicInfo.firstName || !basicInfo.lastName) {
        Alert.alert('Required', 'Please fill in first name and last name');
        return;
      }
      updateBasicInfoMutation.mutate(basicInfo);
    } else if (currentStep === 2) {
      updateEducationMutation.mutate(education);
    } else if (currentStep === 3) {
      updateSkillsMutation.mutate(skills);
    } else {
      navigation.goBack();
    }
  };

  const handleAddSkill = (type: 'technical' | 'soft') => {
    if (!currentSkill.trim()) return;
    setSkills(prev => ({
      ...prev,
      [type === 'technical' ? 'technicalSkills' : 'softSkills']: [
        ...prev[type === 'technical' ? 'technicalSkills' : 'softSkills'],
        currentSkill.trim(),
      ],
    }));
    setCurrentSkill('');
  };

  const handleRemoveSkill = (type: 'technical' | 'soft', index: number) => {
    setSkills(prev => ({
      ...prev,
      [type === 'technical' ? 'technicalSkills' : 'softSkills']: prev[
        type === 'technical' ? 'technicalSkills' : 'softSkills'
      ].filter((_, i) => i !== index),
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            <TextInput
              style={styles.input}
              placeholder="First Name *"
              value={basicInfo.firstName}
              onChangeText={(text) => setBasicInfo({ ...basicInfo, firstName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name *"
              value={basicInfo.lastName}
              onChangeText={(text) => setBasicInfo({ ...basicInfo, lastName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (YYYY-MM-DD)"
              value={basicInfo.dateOfBirth}
              onChangeText={(text) => setBasicInfo({ ...basicInfo, dateOfBirth: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Gender"
              value={basicInfo.gender}
              onChangeText={(text) => setBasicInfo({ ...basicInfo, gender: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={basicInfo.address}
              onChangeText={(text) => setBasicInfo({ ...basicInfo, address: text })}
              multiline
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="City"
                value={basicInfo.city}
                onChangeText={(text) => setBasicInfo({ ...basicInfo, city: text })}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="State"
                value={basicInfo.state}
                onChangeText={(text) => setBasicInfo({ ...basicInfo, state: text })}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Pincode"
              value={basicInfo.pincode}
              onChangeText={(text) => setBasicInfo({ ...basicInfo, pincode: text })}
              keyboardType="numeric"
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Education Details</Text>
            
            <Text style={styles.sectionLabel}>10th Standard</Text>
            <TextInput
              style={styles.input}
              placeholder="Institution"
              value={education.education10th.institution}
              onChangeText={(text) => setEducation({
                ...education,
                education10th: { ...education.education10th, institution: text },
              })}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Year"
                value={education.education10th.year}
                onChangeText={(text) => setEducation({
                  ...education,
                  education10th: { ...education.education10th, year: text },
                })}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Percentage"
                value={education.education10th.percentage}
                onChangeText={(text) => setEducation({
                  ...education,
                  education10th: { ...education.education10th, percentage: text },
                })}
              />
            </View>

            <Text style={styles.sectionLabel}>12th Standard</Text>
            <TextInput
              style={styles.input}
              placeholder="Institution"
              value={education.education12th.institution}
              onChangeText={(text) => setEducation({
                ...education,
                education12th: { ...education.education12th, institution: text },
              })}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Year"
                value={education.education12th.year}
                onChangeText={(text) => setEducation({
                  ...education,
                  education12th: { ...education.education12th, year: text },
                })}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Percentage"
                value={education.education12th.percentage}
                onChangeText={(text) => setEducation({
                  ...education,
                  education12th: { ...education.education12th, percentage: text },
                })}
              />
            </View>

            <Text style={styles.sectionLabel}>Graduation</Text>
            <TextInput
              style={styles.input}
              placeholder="Degree"
              value={education.graduation.degree}
              onChangeText={(text) => setEducation({
                ...education,
                graduation: { ...education.graduation, degree: text },
              })}
            />
            <TextInput
              style={styles.input}
              placeholder="Institution"
              value={education.graduation.institution}
              onChangeText={(text) => setEducation({
                ...education,
                graduation: { ...education.graduation, institution: text },
              })}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Year"
                value={education.graduation.year}
                onChangeText={(text) => setEducation({
                  ...education,
                  graduation: { ...education.graduation, year: text },
                })}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Percentage"
                value={education.graduation.percentage}
                onChangeText={(text) => setEducation({
                  ...education,
                  graduation: { ...education.graduation, percentage: text },
                })}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Skills</Text>
            
            <Text style={styles.sectionLabel}>Technical Skills</Text>
            <View style={styles.skillInputContainer}>
              <TextInput
                style={[styles.input, styles.skillInput]}
                placeholder="Add technical skill"
                value={currentSkill}
                onChangeText={setCurrentSkill}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddSkill('technical')}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.skillsContainer}>
              {skills.technicalSkills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSkill('technical', index)}>
                    <Text style={styles.removeSkill}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Soft Skills</Text>
            <View style={styles.skillInputContainer}>
              <TextInput
                style={[styles.input, styles.skillInput]}
                placeholder="Add soft skill"
                value={currentSkill}
                onChangeText={setCurrentSkill}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddSkill('soft')}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.skillsContainer}>
              {skills.softSkills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                  <TouchableOpacity onPress={() => handleRemoveSkill('soft', index)}>
                    <Text style={styles.removeSkill}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Profile Complete! 🎉</Text>
            <Text style={styles.completeText}>
              Your profile has been set up successfully. You can continue to update it anytime from your profile page.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {STEPS.map((step) => (
          <View key={step.id} style={styles.progressStep}>
            <View
              style={[
                styles.progressCircle,
                currentStep >= step.id && styles.progressCircleActive,
              ]}
            >
              <Text
                style={[
                  styles.progressNumber,
                  currentStep >= step.id && styles.progressNumberActive,
                ]}
              >
                {step.id}
              </Text>
            </View>
            <Text
              style={[
                styles.progressLabel,
                currentStep >= step.id && styles.progressLabelActive,
              ]}
            >
              {step.title}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={
            updateBasicInfoMutation.isPending ||
            updateEducationMutation.isPending ||
            updateSkillsMutation.isPending
          }
        >
          {updateBasicInfoMutation.isPending ||
          updateEducationMutation.isPending ||
          updateSkillsMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === 4 ? 'Done' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCircleActive: {
    backgroundColor: '#3b82f6',
  },
  progressNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  progressNumberActive: {
    color: '#ffffff',
  },
  progressLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  progressLabelActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  skillInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  skillInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  skillText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  removeSkill: {
    color: '#3b82f6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  backButtonText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

