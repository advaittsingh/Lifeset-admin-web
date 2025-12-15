import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { FileText, ArrowLeft, Plus, Search, Loader2, Tag, ChevronRight, AlertCircle, RefreshCw, Trash2, Pencil } from 'lucide-react';
import { postsApi, WallCategory } from '../../services/api/posts';
import { useToast } from '../../contexts/ToastContext';

export default function WallCategoriesPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WallCategory | null>(null);
  const [formData, setFormData] = useState({ 
    categoryFor: '', 
    name: '', 
    description: '',
    status: 'active' 
  });
  const [editFormData, setEditFormData] = useState({
    categoryFor: '',
    name: '',
    description: '',
    status: 'active',
  });

  // Fetch parent categories from API
  const { data: categoriesData, isLoading, error: categoriesError, refetch: refetchCategories } = useQuery<WallCategory[]>({
    queryKey: ['wall-categories', 'parents', searchTerm],
    queryFn: async () => {
      try {
        // Explicitly request only parent categories (onlyParents=true)
        const allCategories = await postsApi.getWallCategories({ onlyParents: true });
        // Client-side safety filter: ensure only categories with parentCategoryId === null
        const parentCategories = allCategories.filter(
          (cat) => cat.parentCategoryId === null || cat.parentCategoryId === undefined
        );
        return parentCategories;
      } catch (error: any) {
        console.error('Error fetching wall categories:', error);
        if (error?.response) {
          console.error('Error response:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          });
        }
        throw error;
      }
    },
    retry: 1,
  });

  const topLevelCategories: WallCategory[] = categoriesData || [];
  
  const filteredCategories = useMemo(() => {
    return topLevelCategories.filter((cat: WallCategory) =>
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topLevelCategories, searchTerm]);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      postsApi.createWallCategory({
        name: data.name,
        description: data.description || undefined,
        categoryFor: data.categoryFor || undefined,
        parentCategoryId: null, // Top-level categories have null parent
        isActive: data.status === 'active',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wall-categories'] });
      queryClient.refetchQueries({ queryKey: ['wall-categories', 'parents'] });
      showToast('Category created successfully', 'success');
      setIsCreateDialogOpen(false);
      setFormData({ categoryFor: '', name: '', description: '', status: 'active' });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to create category';
      showToast(message, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.deleteWallCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wall-categories'] });
      queryClient.refetchQueries({ queryKey: ['wall-categories', 'parents'] });
      showToast('Category deleted successfully', 'success');
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to delete category';
      showToast(message, 'error');
    },
  });

  const handleDelete = (category: WallCategory, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    const hasSubCategories = (category.subCategoryCount || 0) > 0;
    const hasPosts = (category.postCount || 0) > 0;
    
    let message = `Are you sure you want to delete "${category.name}"?`;
    if (hasSubCategories || hasPosts) {
      message += '\n\n';
      if (hasSubCategories) {
        message += `⚠️ This category has ${category.subCategoryCount} sub-categor${category.subCategoryCount === 1 ? 'y' : 'ies'}. `;
      }
      if (hasPosts) {
        message += `⚠️ This category has ${category.postCount} post${category.postCount === 1 ? '' : 's'}. `;
      }
      message +=
        '\n\nIf this category or any of its sub-categories have posts, the deletion will fail and nothing will be removed.';
    }
    
    if (window.confirm(message)) {
      deleteMutation.mutate(category.id);
    }
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }
    createMutation.mutate(formData);
  };

  const openEditDialog = (category: WallCategory) => {
    setEditingCategory(category);
    setEditFormData({
      name: category.name || '',
      description: category.description || '',
      categoryFor: category.categoryFor || category.metadata?.categoryFor || '',
      status: category.isActive ? 'active' : 'inactive',
    });
    setIsEditDialogOpen(true);
  };

  const editMutation = useMutation({
    mutationFn: async (payload: { id: string; updates: Partial<WallCategory> }) => {
      return postsApi.updateWallCategory(payload.id, payload.updates);
    },
    onSuccess: () => {
      showToast('Category updated successfully', 'success');
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      queryClient.refetchQueries({ queryKey: ['wall-categories', 'parents'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to update category';
      showToast(message, 'error');
    },
  });

  const handleEditSave = () => {
    if (!editingCategory) return;
    if (!editFormData.name.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }

    const updates: Partial<WallCategory> = {};
    if (editFormData.name !== editingCategory.name) updates.name = editFormData.name.trim();
    if ((editFormData.description || '') !== (editingCategory.description || '')) {
      updates.description = editFormData.description || '';
    }

    const effectiveCategoryFor = editingCategory.categoryFor || editingCategory.metadata?.categoryFor || '';
    if ((editFormData.categoryFor || '') !== (effectiveCategoryFor || '')) {
      updates.categoryFor = editFormData.categoryFor || undefined;
    }

    const newIsActive = editFormData.status === 'active';
    if (newIsActive !== editingCategory.isActive) {
      updates.isActive = newIsActive;
    }

    if (Object.keys(updates).length === 0) {
      showToast('No changes to save', 'info');
      return;
    }

    editMutation.mutate({ id: editingCategory.id, updates });
  };

  const handleCategoryClick = (category: WallCategory) => {
    navigate(`/dashboard/wall-categories/${category.id}`);
  };

  // Main categories list view
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Wall Categories</h1>
              <p className="text-slate-600 mt-1">Manage post categories for the community wall</p>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Category
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Categories</p>
                  <p className="text-3xl font-bold text-slate-900">{topLevelCategories.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500 shadow-md">
                  <Tag className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Active Categories</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {topLevelCategories.filter((c: any) => c.isActive).length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500 shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Posts</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {topLevelCategories.reduce((sum: number, c: any) => sum + (c.postCount || 0), 0)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500 shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Categories</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
              </div>
            ) : categoriesError ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="p-4 rounded-lg border border-red-200 bg-red-50">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-red-900 mb-1">Failed to load categories</p>
                        <p className="text-sm text-red-700 mb-3">
                          {(() => {
                            const error = categoriesError as any;
                            // Try to get error message from various locations
                            const message = error?.response?.data?.message || 
                                         error?.response?.data?.error?.message ||
                                         error?.message || 
                                         'The server returned an error. Please check the backend logs.';
                            return typeof message === 'string' ? message : 'The server returned an error. Please check the backend logs.';
                          })()}
                        </p>
                        {(categoriesError as any)?.response?.status === 500 && (
                          <div className="text-xs text-red-600 mb-3 space-y-1">
                            <p className="font-semibold">Status: 500 Internal Server Error</p>
                            {(categoriesError as any)?.response?.data && (
                              <details className="mt-2">
                                <summary className="cursor-pointer hover:text-red-800">View error details</summary>
                                <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto max-h-40">
                                  {JSON.stringify((categoriesError as any).response.data, null, 2)}
                                </pre>
                              </details>
                            )}
                            <p className="mt-2 text-red-700">
                              This is a backend error. Please check:
                            </p>
                            <ul className="list-disc list-inside mt-1 space-y-1 text-red-600">
                              <li>Backend server logs</li>
                              <li>Database connection</li>
                              <li>API endpoint implementation</li>
                              <li>Database schema (parentCategoryId column)</li>
                            </ul>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => refetchCategories()}
                          className="mt-2"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Retry
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Tag className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-sm">No categories found</p>
                <p className="text-xs mt-1">Click "Create Category" to add one</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCategories.map((category: WallCategory) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-blue-300 transition-colors"
                  >
                    <div
                      onClick={() => handleCategoryClick(category)}
                      className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <Tag className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-slate-900">{category.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            category.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {category.description || 'No description'}
                        </p>
                        {(category.categoryFor || category.metadata?.categoryFor) && (
                          <p className="text-xs text-slate-500 mt-1">
                            For: {category.categoryFor || category.metadata?.categoryFor}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-xs text-slate-500">{category.postCount || 0} posts</p>
                          {category.subCategoryCount !== undefined && (
                            <p className="text-xs text-slate-500">{category.subCategoryCount || 0} sub-categories</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                        <span>View sub-categories</span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        disabled={editMutation.isPending}
                        title="Edit category"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(category, e)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deleteMutation.isPending}
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Parent Category Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Parent Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Category For *</label>
                <Input
                  placeholder="e.g., Posts, Events, Jobs"
                  value={formData.categoryFor}
                  onChange={(e) => setFormData({ ...formData, categoryFor: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">What type of content this category is for</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name *</label>
                <Input
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Input
                  placeholder="Enter category description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreate} 
                className="bg-blue-600"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Category'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Category For</label>
                <Input
                  placeholder="e.g., Posts, Events, Jobs"
                  value={editFormData.categoryFor}
                  onChange={(e) => setEditFormData({ ...editFormData, categoryFor: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Optional: what type of content this category is for
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name *</label>
                <Input
                  placeholder="Enter category name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Input
                  placeholder="Enter category description (optional)"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status *</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingCategory(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                className="bg-blue-600"
                disabled={editMutation.isPending}
              >
                {editMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
