import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Loader2, Brain } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';
import { useToast } from '../../contexts/ToastContext';

export default function KnowYourselfPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({ question: '', options: ['', '', '', '', ''], order: 0 });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['personality-questions'],
    queryFn: () => cmsApi.getPersonalityQuestions(),
  });

  const questions = Array.isArray(data) ? data : (data?.data || []);

  const createMutation = useMutation({
    mutationFn: (data: any) => cmsApi.createPersonalityQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personality-questions'] });
      showToast('Question created successfully', 'success');
      setIsCreateDialogOpen(false);
      setFormData({ question: '', options: ['', '', '', '', ''], order: 0 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => cmsApi.updatePersonalityQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personality-questions'] });
      showToast('Question updated successfully', 'success');
      setIsEditDialogOpen(false);
    },
  });

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
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Question
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personality Quiz Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((item: any, idx: number) => (
                  <Card key={item.id} className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-slate-500">Question {item.order || idx + 1}</span>
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
                            onClick={() => {
                              setSelectedItem(item);
                              setFormData({
                                question: item.question,
                                options: Array.isArray(item.options) ? item.options : ['', '', '', '', ''],
                                order: item.order || 0,
                              });
                              setIsEditDialogOpen(true);
                            }}
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialogs - Similar to MCQ page */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Personality Question</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Question</label>
                <Textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Options</label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="mb-2">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[idx] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      placeholder={`Option ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Order</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending || !formData.question}
              >
                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Personality Question</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Question</label>
                <Textarea value={formData.question} onChange={(e) => setFormData({ ...formData, question: e.target.value })} rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Options</label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="mb-2">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[idx] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => updateMutation.mutate({ id: selectedItem?.id, data: formData })}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

