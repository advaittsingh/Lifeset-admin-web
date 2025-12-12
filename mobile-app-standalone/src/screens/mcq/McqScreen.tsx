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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api/client';
import { useAuthStore } from '../../store/authStore';

export default function McqScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['mcq-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/mcq/categories');
      return response.data.data || response.data;
    },
  });

  const { data: questions, isLoading } = useQuery({
    queryKey: ['mcq-questions', selectedCategory],
    queryFn: async () => {
      const response = await apiClient.get('/mcq/questions', {
        params: { categoryId: selectedCategory },
      });
      return response.data.data || response.data;
    },
    enabled: !!selectedCategory,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: number }) =>
      apiClient.post(`/mcq/questions/${questionId}/answer`, {
        selectedAnswer: answer,
        timeSpent,
      }),
    onSuccess: () => {
      if (questions && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setTimeSpent(0);
      } else {
        Alert.alert('Complete!', 'You have finished all questions in this category.');
        setSelectedCategory(null);
        setCurrentQuestionIndex(0);
      }
      queryClient.invalidateQueries({ queryKey: ['mcq-questions'] });
    },
  });

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) {
      Alert.alert('Error', 'Please select an answer');
      return;
    }

    const currentQuestion = questions?.[currentQuestionIndex];
    if (currentQuestion) {
      submitAnswerMutation.mutate({
        questionId: currentQuestion.id,
        answer: selectedAnswer,
      });
    }
  };

  if (!selectedCategory) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>MCQ Categories</Text>
        <ScrollView style={styles.categoriesList}>
          {categories && categories.length > 0 ? (
            categories.map((category: any) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No categories available</Text>
          )}
        </ScrollView>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const currentQuestion = questions?.[currentQuestionIndex];
  if (!currentQuestion) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No questions available</Text>
      </View>
    );
  }

  const options = currentQuestion.options as string[];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          setSelectedCategory(null);
          setCurrentQuestionIndex(0);
        }}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.progress}>
          Question {currentQuestionIndex + 1} of {questions?.length || 0}
        </Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.difficulty}>
          {currentQuestion.difficulty?.toUpperCase() || 'MEDIUM'}
        </Text>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {options.map((option: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                selectedAnswer === index && styles.optionSelected,
              ]}
              onPress={() => handleAnswerSelect(index)}
            >
              <View style={styles.optionRadio}>
                {selectedAnswer === index && <View style={styles.optionRadioSelected} />}
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            selectedAnswer === null && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={selectedAnswer === null || submitAnswerMutation.isPending}
        >
          {submitAnswerMutation.isPending ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Submit'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    padding: 16,
  },
  categoriesList: {
    flex: 1,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  progress: {
    fontSize: 14,
    color: '#6b7280',
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
  difficulty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    marginBottom: 12,
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
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

