import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../../services/api/client';
import { useAuthStore } from '../../store/authStore';

export default function KnowYourselfScreen({ navigation }: any) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const { user } = useAuthStore();

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['personality-quiz'],
    queryFn: async () => {
      const response = await apiClient.get('/personality/quiz');
      return response.data.data || response.data;
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: (answers: Record<string, number>) =>
      apiClient.post('/personality/submit', { answers }),
    onSuccess: (data) => {
      const result = data.data.data || data.data;
      navigation.navigate('PersonalityResult', { result });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit quiz. Please try again.');
    },
  });

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers({ ...answers, [questionId]: answerIndex });
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length < (quiz?.questions?.length || 0)) {
      Alert.alert('Incomplete', 'Please answer all questions');
      return;
    }
    submitQuizMutation.mutate(answers);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No quiz available</Text>
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isAnswered = answers[currentQuestion.id] !== undefined;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
            },
          ]}
        />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </Text>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  answers[currentQuestion.id] === index && styles.optionSelected,
                ]}
                onPress={() => handleAnswerSelect(currentQuestion.id, index)}
              >
                <View style={styles.optionRadio}>
                  {answers[currentQuestion.id] === index && (
                    <View style={styles.optionRadioSelected} />
                  )}
                </View>
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        {isLastQuestion ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isAnswered && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isAnswered || submitQuizMutation.isPending}
          >
            {submitQuizMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Get Results</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.navButtonPrimary,
              !isAnswered && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!isAnswered}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
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
  progressContainer: {
    height: 4,
    backgroundColor: '#e5e7eb',
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  content: {
    flex: 1,
  },
  questionCard: {
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
  questionNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9ca3af',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  navButtonPrimary: {
    backgroundColor: '#3b82f6',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  submitButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10b981',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

