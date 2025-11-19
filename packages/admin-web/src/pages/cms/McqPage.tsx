import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Loader2, AlertCircle, HelpCircle, BookOpen } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';
import { useToast } from '../../contexts/ToastContext';

export default function McqPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    categoryId: '',
    explanation: '',
  });
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['mcq-questions', searchTerm, categoryFilter],
    queryFn: () => cmsApi.getMcqQuestions({ search: searchTerm || undefined, categoryId: categoryFilter || undefined }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['mcq-categories'],
    queryFn: () => cmsApi.getMcqCategories(),
  });

  const questions = Array.isArray(questionsData) ? questionsData : (questionsData?.data || []);
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);

  const createMutation = useMutation({
    mutationFn: (data: any) => cmsApi.createMcqQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcq-questions'] });
      showToast('MCQ question created successfully', 'success');
      setIsCreateDialogOpen(false);
      setFormData({ question: '', options: ['', '', '', ''], correctAnswer: 0, categoryId: '', explanation: '' });
    },
    onError: () => showToast('Failed to create MCQ question', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => cmsApi.updateMcqQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcq-questions'] });
      showToast('MCQ question updated successfully', 'success');
      setIsEditDialogOpen(false);
    },
    onError: () => showToast('Failed to update MCQ question', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsApi.deleteMcqQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcq-questions'] });
      showToast('MCQ question deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
    },
    onError: () => showToast('Failed to delete MCQ question', 'error'),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => cmsApi.createMcqCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcq-categories'] });
      showToast('Category created successfully', 'success');
      setIsCategoryDialogOpen(false);
      setCategoryFormData({ name: '', description: '' });
    },
    onError: () => showToast('Failed to create category', 'error'),
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">MCQ Management</h1>
            <p className="text-slate-600 mt-1">Manage MCQ questions and categories</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
              <BookOpen className="mr-2 h-4 w-4" />
              Add Category
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Question
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>MCQ Questions</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-md text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No questions found</div>
                ) : (
                  questions.map((item: any) => (
                    <Card key={item.id} className="border-0 shadow-lg">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <HelpCircle className="h-4 w-4 text-blue-600" />
                              <h3 className="font-semibold">{item.question}</h3>
                            </div>
                            <div className="ml-6 space-y-1 mb-2">
                              {item.options?.map((opt: string, idx: number) => (
                                <div
                                  key={idx}
                                  className={`text-sm ${
                                    idx === item.correctAnswer ? 'text-green-600 font-semibold' : 'text-slate-600'
                                  }`}
                                >
                                  {String.fromCharCode(65 + idx)}. {opt}
                                  {idx === item.correctAnswer && ' ✓'}
                                </div>
                              ))}
                            </div>
                            {item.explanation && (
                              <p className="text-xs text-slate-500 ml-6 mt-2">Explanation: {item.explanation}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setFormData({
                                  question: item.question,
                                  options: item.options || ['', '', '', ''],
                                  correctAnswer: item.correctAnswer || 0,
                                  categoryId: item.categoryId || '',
                                  explanation: item.explanation || '',
                                });
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsDeleteDialogOpen(true);
                              }}
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

        {/* Create Question Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create MCQ Question</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Question</label>
                <Textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter question"
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
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Correct Answer</label>
                <select
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                >
                  {formData.options.map((_, idx) => (
                    <option key={idx} value={idx}>
                      Option {String.fromCharCode(65 + idx)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Explanation (Optional)</label>
                <Textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Enter explanation"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending || !formData.question || !formData.categoryId}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog - Similar structure */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit MCQ Question</DialogTitle>
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
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Correct Answer</label>
                <select
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                >
                  {formData.options.map((_, idx) => (
                    <option key={idx} value={idx}>
                      Option {String.fromCharCode(65 + idx)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => updateMutation.mutate({ id: selectedItem?.id, data: formData })}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Dialog */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name</label>
                <Input
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => createCategoryMutation.mutate(categoryFormData)}
                disabled={createCategoryMutation.isPending || !categoryFormData.name}
              >
                {createCategoryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Question</DialogTitle>
            </DialogHeader>
            <p className="text-slate-600">Are you sure you want to delete this question?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(selectedItem?.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

