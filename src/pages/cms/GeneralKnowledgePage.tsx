import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Pagination } from '../../components/ui/pagination';
import { Plus, Edit, Trash2, Loader2, BookOpen, HelpCircle } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';
import { useToast } from '../../contexts/ToastContext';

// Helper function to strip HTML tags and get plain text
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  try {
    // Use DOMParser to safely parse HTML without executing scripts
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const plainText = doc.body.textContent || doc.body.innerText || '';
    return plainText.trim();
  } catch (error) {
    // Fallback: strip HTML tags using regex if DOMParser fails
    const plainText = html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
    return plainText.trim();
  }
};

export default function GeneralKnowledgePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['general-knowledge', searchTerm, page, limit],
    queryFn: async () => {
      const result = await cmsApi.getGeneralKnowledge({ 
        search: searchTerm || undefined,
        page,
        limit,
      });
      // Ensure consistent response structure
      if (Array.isArray(result)) {
        return { data: result, pagination: { page, limit, total: result.length, totalPages: 1 } };
      }
      return result;
    },
  });

  const items = Array.isArray(data) ? data : (data?.data || []);
  const pagination = data?.pagination || {
    page: page,
    limit: limit,
    total: items.length,
    totalPages: Math.ceil(items.length / limit),
  };

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setPage(1);
  }, [searchTerm]);


  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsApi.deleteGeneralKnowledge(id),
    onSuccess: async (_, deletedId) => {
      // Optimistically remove the item from cache
      queryClient.setQueryData(['general-knowledge', searchTerm], (oldData: any) => {
        if (!oldData) return oldData;
        // Handle both array and object with data property
        if (Array.isArray(oldData)) {
          return oldData.filter((item: any) => item.id !== deletedId);
        }
        if (oldData?.data && Array.isArray(oldData.data)) {
          return {
            ...oldData,
            data: oldData.data.filter((item: any) => item.id !== deletedId),
          };
        }
        return oldData;
      });
      
      // Invalidate and refetch all general-knowledge queries
      await queryClient.invalidateQueries({ queryKey: ['general-knowledge'] });
      await queryClient.refetchQueries({ queryKey: ['general-knowledge'] });
      
      showToast('Article deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    },
    onError: () => {
      showToast('Failed to delete article', 'error');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
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
                            <div 
                              className="text-slate-600 mb-2 line-clamp-2"
                              style={{ 
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                              dangerouslySetInnerHTML={{ __html: item.description || '' }}
                            />
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
                                  chapterId: item.metadata?.chapterId || '',
                                  articleId: item.id,
                                });
                                // Add article image if available
                                if (item.images && item.images.length > 0 && item.images[0]) {
                                  params.append('articleImageUrl', item.images[0]);
                                }
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
            {!isLoading && items.length > 0 && (
              <Pagination
                currentPage={pagination.page || page}
                totalPages={pagination.totalPages || 1}
                onPageChange={setPage}
                itemsPerPage={limit}
                totalItems={pagination.total || items.length}
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
              <DialogTitle>Delete Article</DialogTitle>
            </DialogHeader>
            <p className="text-slate-600">
              Are you sure you want to delete "{selectedItem?.title}"? This action cannot be undone.
            </p>
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

