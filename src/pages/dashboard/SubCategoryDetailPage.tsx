import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Loader2, BookOpen, Edit, Trash2, Newspaper, HelpCircle } from 'lucide-react';
import { postsApi, WallCategory } from '../../services/api/posts';
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

export default function SubCategoryDetailPage() {
  const { categoryId, subCategoryId } = useParams<{ categoryId: string; subCategoryId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [articleType, setArticleType] = useState<'current-affairs' | 'general-knowledge'>('current-affairs');

  // Fetch parent category
  const { data: categoriesData } = useQuery<WallCategory[]>({
    queryKey: ['wall-categories', 'parents'],
    queryFn: async () => {
      return postsApi.getWallCategories({ onlyParents: true });
    },
  });

  const allCategories: WallCategory[] = categoriesData || [];
  const parentCategory = allCategories.find((cat: WallCategory) => cat.id === categoryId);

  // Fetch sub-category details
  const { data: subCategoriesData } = useQuery<WallCategory[]>({
    queryKey: ['wall-categories', 'sub-categories', categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      try {
        const allSubCategories = await postsApi.getWallSubCategories(categoryId);
        return allSubCategories.filter((cat) => cat.parentCategoryId === categoryId);
      } catch (error: any) {
        console.error('Error fetching sub-categories:', error);
        return [];
      }
    },
    enabled: !!categoryId,
  });

  const subCategories: WallCategory[] = subCategoriesData || [];
  const subCategory = subCategories.find((cat) => cat.id === subCategoryId);

  // Fetch current affairs articles for this sub-category
  const { data: currentAffairsData, isLoading: isLoadingCurrentAffairs } = useQuery({
    queryKey: ['current-affairs', subCategoryId, searchTerm],
    queryFn: async () => {
      try {
        const result = await cmsApi.getCurrentAffairs({ 
          search: searchTerm || undefined,
          subCategoryId: subCategoryId 
        });
        if (Array.isArray(result)) {
          return result.filter((item: any) => item.metadata?.subCategoryId === subCategoryId);
        }
        if (result?.data && Array.isArray(result.data)) {
          return result.data.filter((item: any) => item.metadata?.subCategoryId === subCategoryId);
        }
        return [];
      } catch (err: any) {
        console.error('Error fetching current affairs:', err);
        return [];
      }
    },
    enabled: !!subCategoryId && articleType === 'current-affairs',
  });

  // Fetch general knowledge articles for this sub-category
  const { data: generalKnowledgeData, isLoading: isLoadingGeneralKnowledge } = useQuery({
    queryKey: ['general-knowledge', subCategoryId, searchTerm],
    queryFn: async () => {
      try {
        const result = await cmsApi.getGeneralKnowledge({ 
          search: searchTerm || undefined 
        });
        const items = Array.isArray(result) ? result : (result?.data || []);
        return items.filter((item: any) => item.metadata?.subCategoryId === subCategoryId);
      } catch (err: any) {
        console.error('Error fetching general knowledge:', err);
        return [];
      }
    },
    enabled: !!subCategoryId && articleType === 'general-knowledge',
  });

  const currentAffairsItems = Array.isArray(currentAffairsData) ? currentAffairsData : [];
  const generalKnowledgeItems = Array.isArray(generalKnowledgeData) ? generalKnowledgeData : [];
  const items = articleType === 'current-affairs' ? currentAffairsItems : generalKnowledgeItems;
  const isLoading = articleType === 'current-affairs' ? isLoadingCurrentAffairs : isLoadingGeneralKnowledge;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (articleType === 'current-affairs') {
        return cmsApi.deleteCurrentAffair(id);
      } else {
        return cmsApi.deleteGeneralKnowledge(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-affairs'] });
      queryClient.invalidateQueries({ queryKey: ['general-knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['current-affairs', subCategoryId] });
      queryClient.invalidateQueries({ queryKey: ['general-knowledge', subCategoryId] });
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

  if (!subCategory || !parentCategory) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading sub-category...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleCreateArticle = () => {
    if (articleType === 'current-affairs') {
      const params = new URLSearchParams({
        categoryId: categoryId || '',
        subCategoryId: subCategoryId || '',
      });
      navigate(`/cms/current-affairs/create?${params.toString()}`);
    } else {
      const params = new URLSearchParams({
        categoryId: categoryId || '',
        subCategoryId: subCategoryId || '',
      });
      navigate(`/cms/general-knowledge/create?${params.toString()}`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/dashboard/wall-categories/${categoryId}`)}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Category
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {parentCategory.name} &gt; {subCategory.name}
              </h1>
              <p className="text-slate-600 mt-1">
                Manage articles for this sub-category
              </p>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={handleCreateArticle}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create {articleType === 'current-affairs' ? 'Current Affair' : 'Article'}
          </Button>
        </div>

        {/* Sub-Category Info Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">{subCategory.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    subCategory.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {subCategory.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  {subCategory.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-xs text-slate-500">
                    {subCategory.postCount || 0} posts
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Article Type Tabs */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Articles</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={articleType === 'current-affairs' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setArticleType('current-affairs')}
                >
                  <Newspaper className="h-4 w-4 mr-2" />
                  Current Affairs
                </Button>
                <Button
                  variant={articleType === 'general-knowledge' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setArticleType('general-knowledge')}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  General Knowledge
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No {articleType === 'current-affairs' ? 'current affairs' : 'articles'} found
                  </div>
                ) : (
                  items.map((item: any) => (
                    <Card key={item.id} className="border-0 shadow-lg">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {articleType === 'current-affairs' ? (
                                <Newspaper className="h-4 w-4 text-blue-600" />
                              ) : (
                                <BookOpen className="h-4 w-4 text-blue-600" />
                              )}
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                            </div>
                            <p className="text-slate-600 mb-2 line-clamp-2">{stripHtmlTags(item.description || '')}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
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
                                if (articleType === 'current-affairs') {
                                  navigate(`/cms/current-affairs/edit/${item.id}`);
                                } else {
                                  navigate(`/cms/general-knowledge/edit/${item.id}`);
                                }
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

