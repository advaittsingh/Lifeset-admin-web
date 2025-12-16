import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Loader2, Tag, Trash2, Pencil, Newspaper, BookOpen, Edit, Eye } from 'lucide-react';
import { postsApi, WallCategory } from '../../services/api/posts';
import { cmsApi } from '../../services/api/cms';
import { useToast } from '../../contexts/ToastContext';

export default function SubCategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [articleTypeFilter, setArticleTypeFilter] = useState<'all' | 'current-affairs' | 'general-knowledge'>('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  // Fetch sub-category details
  const { data: subCategoryData, isLoading: isLoadingSubCategory } = useQuery<WallCategory>({
    queryKey: ['wall-category', id],
    queryFn: async () => {
      if (!id) throw new Error('No sub-category ID');
      // Get all categories and find the sub-category
      const allCategories = await postsApi.getWallCategories();
      const found = Array.isArray(allCategories) 
        ? allCategories.find((cat: WallCategory) => cat.id === id)
        : null;
      if (!found) throw new Error('Sub-category not found');
      return found;
    },
    enabled: !!id,
  });

  // Fetch parent category
  const { data: parentCategory } = useQuery<WallCategory | null>({
    queryKey: ['wall-category', subCategoryData?.parentCategoryId],
    queryFn: async (): Promise<WallCategory | null> => {
      if (!subCategoryData?.parentCategoryId) return null;
      const allCategories = await postsApi.getWallCategories();
      const found = Array.isArray(allCategories)
        ? allCategories.find((cat: WallCategory) => cat.id === subCategoryData.parentCategoryId)
        : undefined;
      return found || null;
    },
    enabled: !!subCategoryData?.parentCategoryId,
  });

  // Fetch Current Affairs articles
  const { data: caData, isLoading: isLoadingCA } = useQuery({
    queryKey: ['current-affairs', 'sub-category', id, searchTerm],
    queryFn: async () => {
      try {
        const result = await cmsApi.getCurrentAffairs({ 
          search: searchTerm || undefined,
        });
        const articles = Array.isArray(result) ? result : (result?.data || []);
        // Filter by subCategoryId in metadata (client-side filtering as backup)
        if (id) {
          return articles.filter((article: any) => {
            const metadata = article.metadata || {};
            return metadata.subCategoryId === id;
          });
        }
        return articles;
      } catch {
        return [];
      }
    },
    enabled: !!id,
  });

  // Fetch General Knowledge articles
  const { data: gkData, isLoading: isLoadingGK } = useQuery({
    queryKey: ['general-knowledge', 'sub-category', id, searchTerm],
    queryFn: async () => {
      try {
        const result = await cmsApi.getGeneralKnowledge({ 
          search: searchTerm || undefined,
        });
        const articles = Array.isArray(result) ? result : (result?.data || []);
        // Filter by subCategoryId in metadata (client-side filtering as backup)
        if (id) {
          return articles.filter((article: any) => {
            const metadata = article.metadata || {};
            return metadata.subCategoryId === id;
          });
        }
        return articles;
      } catch {
        return [];
      }
    },
    enabled: !!id,
  });

  const caArticles = Array.isArray(caData) ? caData : [];
  const gkArticles = Array.isArray(gkData) ? gkData : [];
  
  // Filter articles based on type filter
  let allArticles: any[] = [];
  if (articleTypeFilter === 'all') {
    allArticles = [
      ...caArticles.map((article: any) => ({ ...article, type: 'current-affairs' })),
      ...gkArticles.map((article: any) => ({ ...article, type: 'general-knowledge' })),
    ];
  } else if (articleTypeFilter === 'current-affairs') {
    allArticles = caArticles.map((article: any) => ({ ...article, type: 'current-affairs' }));
  } else if (articleTypeFilter === 'general-knowledge') {
    allArticles = gkArticles.map((article: any) => ({ ...article, type: 'general-knowledge' }));
  }

  const isLoading = isLoadingSubCategory || isLoadingCA || isLoadingGK;

  // Delete mutations
  const deleteCAMutation = useMutation({
    mutationFn: (articleId: string) => cmsApi.deleteCurrentAffair(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-affairs', 'sub-category', id] });
      showToast('Article deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
    },
    onError: () => showToast('Failed to delete article', 'error'),
  });

  const deleteGKMutation = useMutation({
    mutationFn: (articleId: string) => cmsApi.deleteGeneralKnowledge(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-knowledge', 'sub-category', id] });
      showToast('Article deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
    },
    onError: () => showToast('Failed to delete article', 'error'),
  });

  const handleDelete = (article: any) => {
    setSelectedArticle(article);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedArticle) return;
    
    if (selectedArticle.type === 'current-affairs') {
      deleteCAMutation.mutate(selectedArticle.id);
    } else {
      deleteGKMutation.mutate(selectedArticle.id);
    }
  };

  const handleEdit = (article: any) => {
    if (article.type === 'current-affairs') {
      navigate(`/cms/current-affairs/edit/${article.id}`);
    } else {
      navigate(`/cms/general-knowledge/edit/${article.id}`);
    }
  };

  const handleCreateArticle = (type: 'current-affairs' | 'general-knowledge') => {
    if (type === 'current-affairs') {
      navigate(`/cms/current-affairs/create?subCategoryId=${id}&categoryId=${subCategoryData?.parentCategoryId || ''}`);
    } else {
      navigate(`/cms/general-knowledge/create?subCategoryId=${id}&categoryId=${subCategoryData?.parentCategoryId || ''}`);
    }
  };

  if (isLoadingSubCategory) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!subCategoryData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">Sub-category not found</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/dashboard/wall-categories/${subCategoryData.parentCategoryId}`)}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {parentCategory?.name || 'Category'}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{subCategoryData.name}</h1>
              <p className="text-slate-600 mt-1">
                {parentCategory ? (
                  <span className="text-sm">
                    Parent: <span className="font-medium">{parentCategory.name}</span>
                  </span>
                ) : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleCreateArticle('current-affairs')}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
            >
              <Newspaper className="h-4 w-4 mr-2" />
              Create Current Affairs
            </Button>
            <Button
              variant="outline"
              onClick={() => handleCreateArticle('general-knowledge')}
              className="bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Create General Knowledge
            </Button>
          </div>
        </div>

        {/* Sub-Category Info Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                <Tag className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">{subCategoryData.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    subCategoryData.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {subCategoryData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  {subCategoryData.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-xs text-slate-500">
                    {subCategoryData.postCount || 0} posts
                  </p>
                  <p className="text-xs text-slate-500">
                    {caArticles.length + gkArticles.length} articles
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Articles</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <select
                  value={articleTypeFilter}
                  onChange={(e) => setArticleTypeFilter(e.target.value as any)}
                  className="px-3 py-2 border border-slate-200 rounded-md text-sm"
                >
                  <option value="all">All Articles</option>
                  <option value="current-affairs">Current Affairs</option>
                  <option value="general-knowledge">General Knowledge</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : allArticles.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Newspaper className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-sm">No articles found</p>
                <p className="text-xs mt-1">Create your first article to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allArticles.map((article: any) => (
                  <Card key={article.id} className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {article.type === 'current-affairs' ? (
                              <Newspaper className="h-4 w-4 text-blue-600" />
                            ) : (
                              <BookOpen className="h-4 w-4 text-emerald-600" />
                            )}
                            <h3 className="font-semibold text-lg">{article.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              article.type === 'current-affairs'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {article.type === 'current-affairs' ? 'Current Affairs' : 'General Knowledge'}
                            </span>
                            {article.isPublished !== undefined && (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                article.isPublished
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {article.isPublished ? 'Published' : 'Draft'}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 mb-2 line-clamp-2">{article.description}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(article)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(article)}
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

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Article</DialogTitle>
            </DialogHeader>
            <p className="text-slate-600">
              Are you sure you want to delete "{selectedArticle?.title}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteCAMutation.isPending || deleteGKMutation.isPending}
              >
                {(deleteCAMutation.isPending || deleteGKMutation.isPending) ? (
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

