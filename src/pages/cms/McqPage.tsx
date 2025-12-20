import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Pagination } from '../../components/ui/pagination';
import { Plus, Edit, Trash2, Loader2, AlertCircle, HelpCircle } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';
import { postsApi } from '../../services/api/posts';
import { useToast } from '../../contexts/ToastContext';

export default function McqPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['mcq-questions', searchTerm, categoryFilter, page, limit],
    queryFn: () => cmsApi.getMcqQuestions({ 
      search: searchTerm || undefined, 
      categoryId: categoryFilter || undefined,
      page,
      limit,
    }),
  });

  // Fetch Wall Categories (parent categories) for filtering
  const { data: categoriesData } = useQuery({
    queryKey: ['wall-categories'],
    queryFn: () => postsApi.getWallCategories(),
  });

  // Handle paginated response structure
  const questions = Array.isArray(questionsData) 
    ? questionsData 
    : (questionsData?.data || []);
  const pagination = questionsData?.pagination || {
    page: 1,
    limit: limit,
    total: questions.length,
    totalPages: Math.ceil(questions.length / limit),
  };
  const categories = categoriesData || [];

  // Reset to page 1 when search or filter changes
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter]);


  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsApi.deleteMcqQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcq-questions'] });
      showToast('MCQ question deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
    },
    onError: () => showToast('Failed to delete MCQ question', 'error'),
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
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
              onClick={() => navigate('/cms/mcq/create')}
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
                              {item.options?.map((opt: any, idx: number) => {
                                // Handle both string and object formats
                                let optionText = '';
                                if (typeof opt === 'string') {
                                  optionText = opt;
                                } else if (typeof opt === 'object' && opt !== null) {
                                  optionText = opt.text || opt.label || opt.value || JSON.stringify(opt);
                                } else {
                                  optionText = String(opt);
                                }
                                
                                const isCorrect = typeof opt === 'object' && opt !== null && opt?.isCorrect !== undefined 
                                  ? opt.isCorrect 
                                  : idx === item.correctAnswer;
                                
                                return (
                                  <div
                                    key={idx}
                                    className={`text-sm ${
                                      isCorrect ? 'text-green-600 font-semibold' : 'text-slate-600'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + idx)}. {optionText}
                                    {isCorrect && ' ✓'}
                                  </div>
                                );
                              })}
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
                                navigate(`/cms/mcq/edit/${item.id}`);
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
            
            {/* Pagination */}
            {!isLoading && questions.length > 0 && (
              <Pagination
                currentPage={pagination.page || page}
                totalPages={pagination.totalPages || 1}
                onPageChange={setPage}
                itemsPerPage={limit}
                totalItems={pagination.total || questions.length}
                onItemsPerPageChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
              />
            )}
          </CardContent>
        </Card>

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

