import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, Edit, Trash2, Loader2, Brain, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';
import { useToast } from '../../contexts/ToastContext';

export default function KnowYourselfPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [includeInactive, setIncludeInactive] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['personality-questions', includeInactive],
    queryFn: async () => {
      try {
        const result = await cmsApi.getPersonalityQuestions({ includeInactive });
        console.log('Personality questions API response:', result);
        return result;
      } catch (err) {
        console.error('Error fetching personality questions:', err);
        throw err;
      }
    },
  });

  // Handle different response structures
  const questions = Array.isArray(data) 
    ? data 
    : (data?.data || (data && typeof data === 'object' && !Array.isArray(data) ? [] : []));
  
  console.log('Processed questions:', questions, 'Count:', questions.length);


  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsApi.deletePersonalityQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personality-questions'] });
      showToast('Question deleted successfully', 'success');
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Know Yourself Quiz</h1>
            <p className="text-slate-600 mt-1">Manage personality quiz questions</p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => navigate('/cms/know-yourself/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Question
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Personality Quiz Questions</CardTitle>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeInactive}
                    onChange={(e) => setIncludeInactive(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">Show inactive questions</span>
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-semibold">Error loading questions</p>
                    <p className="text-sm text-red-600 mt-1">
                      {error instanceof Error ? error.message : 'Failed to fetch personality quiz questions'}
                    </p>
                    <p className="text-xs text-red-500 mt-1">Check browser console for details</p>
                  </div>
                </div>
              </div>
            )}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    {includeInactive ? 'No questions found (including inactive)' : 'No active questions found'}
                  </div>
                ) : (
                  questions.map((item: any, idx: number) => (
                    <Card key={item.id} className={`border-0 shadow-lg ${!item.isActive ? 'opacity-75 bg-slate-50' : ''}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Brain className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium text-slate-500">Question {item.order || idx + 1}</span>
                              {item.isActive ? (
                                <span className="flex items-center gap-1 text-xs text-emerald-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Active
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-red-600">
                                  <XCircle className="h-3 w-3" />
                                  Inactive
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold mb-2">{item.question}</h3>
                          <div className="ml-6 space-y-1">
                            {Array.isArray(item.options) && item.options.map((opt: string, optIdx: number) => (
                              <div key={optIdx} className="text-sm text-slate-600">
                                {optIdx + 1}. {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/cms/know-yourself/edit/${item.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

