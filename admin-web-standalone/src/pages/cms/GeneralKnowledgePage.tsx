import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Loader2, BookOpen, HelpCircle } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';
import { useToast } from '../../contexts/ToastContext';

export default function GeneralKnowledgePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['general-knowledge', searchTerm],
    queryFn: () => cmsApi.getGeneralKnowledge({ search: searchTerm || undefined }),
  });

  const items = Array.isArray(data) ? data : (data?.data || []);


  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsApi.deleteGeneralKnowledge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-knowledge'] });
      showToast('Article deleted successfully', 'success');
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">General Knowledge</h1>
            <p className="text-slate-600 mt-1">Manage general knowledge articles</p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => navigate('/cms/general-knowledge/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Article
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Articles</CardTitle>
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No articles found</div>
                ) : (
                  items.map((item: any) => (
                    <Card key={item.id} className="border-0 shadow-lg">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                            </div>
                            <p className="text-slate-600 mb-2 line-clamp-2">{item.description}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Navigate to MCQ create with pre-filled data
                                const params = new URLSearchParams({
                                  categoryId: item.categoryId || '',
                                  subCategoryId: item.metadata?.subCategoryId || '',
                                  section: item.metadata?.section || '',
                                  country: item.metadata?.country || '',
                                  articleId: item.id,
                                });
                                navigate(`/cms/mcq/create?${params.toString()}`);
                              }}
                              title="Create MCQ from this article"
                            >
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigate(`/cms/general-knowledge/edit/${item.id}`);
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

