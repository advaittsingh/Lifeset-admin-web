import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Loader2, Tag, Trash2, Pencil } from 'lucide-react';
import { postsApi, WallCategory } from '../../services/api/posts';
import { useToast } from '../../contexts/ToastContext';

export default function WallCategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateSubCategoryDialogOpen, setIsCreateSubCategoryDialogOpen] = useState(false);
  const [isEditSubCategoryDialogOpen, setIsEditSubCategoryDialogOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<WallCategory | null>(null);
  const [subCategoryFormData, setSubCategoryFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [editSubCategoryFormData, setEditSubCategoryFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });

  // Fetch parent category details (only parents to find the selected one)
  const { data: categoriesData } = useQuery<WallCategory[]>({
    queryKey: ['wall-categories', 'parents'],
    queryFn: async () => {
      return postsApi.getWallCategories({ onlyParents: true });
    },
  });

  const allCategories: WallCategory[] = categoriesData || [];
  const selectedCategory = allCategories.find((cat: WallCategory) => cat.id === id);

  // Fetch sub-categories for this category
  const { data: subCategoriesData, isLoading: isLoadingSubCategories } = useQuery<WallCategory[]>({
    queryKey: ['wall-categories', 'sub-categories', id],
    queryFn: async () => {
      if (!id) return [];
      try {
        // Backend returns only sub-categories for this parent
        const allSubCategories = await postsApi.getWallSubCategories(id);
        // Client-side safety filter: ensure only sub-categories with parentCategoryId === id
        const filteredSubCategories = allSubCategories.filter(
          (cat) => cat.parentCategoryId === id
        );
        return filteredSubCategories;
      } catch (error: any) {
        console.error('Error fetching sub-categories:', error);
        return [];
      }
    },
    enabled: !!id,
  });

  const subCategories: WallCategory[] = subCategoriesData || [];

  const createSubCategoryMutation = useMutation({
    mutationFn: (data: typeof subCategoryFormData) => {
      if (!id) {
        throw new Error('Parent category ID is required');
      }
      // Validate that selectedCategory is actually a parent (not a sub-category)
      if (selectedCategory && selectedCategory.parentCategoryId !== null && selectedCategory.parentCategoryId !== undefined) {
        throw new Error('Cannot create sub-categories under a sub-category. Maximum depth is 2 levels: parent → sub-category.');
      }
      return postsApi.createWallCategory({
        name: data.name,
        description: data.description || undefined,
        categoryFor: selectedCategory?.categoryFor || selectedCategory?.metadata?.categoryFor || undefined,
        parentCategoryId: id, // Ensure parentCategoryId is set to the parent's ID
        isActive: data.status === 'active',
      });
    },
    onSuccess: async () => {
      showToast('Sub-category created successfully', 'success');
      setIsCreateSubCategoryDialogOpen(false);
      setSubCategoryFormData({ name: '', description: '', status: 'active' });
      
      // Refetch sub-categories
      await queryClient.refetchQueries({ queryKey: ['wall-categories', 'sub-categories', id] });
      // Also refetch parents to update subCategoryCount
      await queryClient.refetchQueries({ queryKey: ['wall-categories', 'parents'] });
    },
    onError: (error: any) => {
      console.error('Error creating sub-category:', error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to create sub-category';
      showToast(message, 'error');
    },
  });

  const deleteSubCategoryMutation = useMutation({
    mutationFn: (subCategoryId: string) => postsApi.deleteWallCategory(subCategoryId),
    onSuccess: async () => {
      showToast('Sub-category deleted successfully', 'success');
      
      // Refetch sub-categories
      await queryClient.refetchQueries({ queryKey: ['wall-categories', 'sub-categories', id] });
      // Also refetch parents to update subCategoryCount
      await queryClient.refetchQueries({ queryKey: ['wall-categories', 'parents'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to delete sub-category';
      showToast(message, 'error');
    },
  });

  const handleDeleteSubCategory = (subCategory: WallCategory) => {
    const hasPosts = (subCategory.postCount || 0) > 0;
    
    let message = `Are you sure you want to delete "${subCategory.name}"?`;
    if (hasPosts) {
      message += `\n\n⚠️ This sub-category has ${subCategory.postCount} post${subCategory.postCount === 1 ? '' : 's'}. `;
      message += '\n\nIf this sub-category has posts, the deletion will fail and nothing will be removed.';
    }
    
    if (window.confirm(message)) {
      deleteSubCategoryMutation.mutate(subCategory.id);
    }
  };

  const handleCreateSubCategory = () => {
    if (!subCategoryFormData.name.trim()) {
      showToast('Please enter a sub-category name', 'error');
      return;
    }
    createSubCategoryMutation.mutate(subCategoryFormData);
  };

  const editSubCategoryMutation = useMutation({
    mutationFn: async (payload: { id: string; updates: Partial<WallCategory> }) => {
      return postsApi.updateWallCategory(payload.id, payload.updates);
    },
    onSuccess: async () => {
      showToast('Sub-category updated successfully', 'success');
      setIsEditSubCategoryDialogOpen(false);
      setEditingSubCategory(null);
      // Refetch sub-categories and parent counts
      await queryClient.refetchQueries({ queryKey: ['wall-categories', 'sub-categories', id] });
      await queryClient.refetchQueries({ queryKey: ['wall-categories', 'parents'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to update sub-category';
      showToast(message, 'error');
    },
  });

  const openEditSubCategoryDialog = (subCategory: WallCategory) => {
    setEditingSubCategory(subCategory);
    setEditSubCategoryFormData({
      name: subCategory.name || '',
      description: subCategory.description || '',
      status: subCategory.isActive ? 'active' : 'inactive',
    });
    setIsEditSubCategoryDialogOpen(true);
  };

  const handleEditSubCategorySave = () => {
    if (!editingSubCategory) return;
    if (!editSubCategoryFormData.name.trim()) {
      showToast('Please enter a sub-category name', 'error');
      return;
    }

    const updates: Partial<WallCategory> = {};
    if (editSubCategoryFormData.name !== editingSubCategory.name) {
      updates.name = editSubCategoryFormData.name.trim();
    }
    if ((editSubCategoryFormData.description || '') !== (editingSubCategory.description || '')) {
      updates.description = editSubCategoryFormData.description || '';
    }
    const newIsActive = editSubCategoryFormData.status === 'active';
    if (newIsActive !== editingSubCategory.isActive) {
      updates.isActive = newIsActive;
    }

    if (Object.keys(updates).length === 0) {
      showToast('No changes to save', 'info');
      return;
    }

    editSubCategoryMutation.mutate({ id: editingSubCategory.id, updates });
  };

  if (!selectedCategory) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading category...</p>
          </div>
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
              onClick={() => navigate('/dashboard/wall-categories')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {selectedCategory.name} &gt; Sub-categories
              </h1>
              <p className="text-slate-600 mt-1">
                Manage sub-categories for this parent category
              </p>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => setIsCreateSubCategoryDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Sub-Category
          </Button>
        </div>

        {/* Category Info Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Tag className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedCategory.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedCategory.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedCategory.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  {selectedCategory.description || 'No description'}
                </p>
                {(selectedCategory.categoryFor || selectedCategory.metadata?.categoryFor) && (
                  <p className="text-xs text-slate-500 mb-1">
                    For: {selectedCategory.categoryFor || selectedCategory.metadata?.categoryFor}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-xs text-slate-500">
                    {selectedCategory.postCount || 0} posts
                  </p>
                  {selectedCategory.subCategoryCount !== undefined && (
                    <p className="text-xs text-slate-500">
                      {selectedCategory.subCategoryCount || 0} sub-categories
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sub-Categories List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Sub-Categories</CardTitle>
            <CardDescription>
              {isLoadingSubCategories 
                ? 'Loading sub-categories...'
                : subCategories.length === 0 
                  ? 'No sub-categories yet. Create one to get started.'
                  : `${subCategories.length} sub-categor${subCategories.length === 1 ? 'y' : 'ies'}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSubCategories ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
              </div>
            ) : subCategories.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Tag className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-sm">No sub-categories found</p>
                <p className="text-xs mt-1">Click "Create Sub-Category" to add one</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subCategories.map((subCategory: WallCategory) => (
                  <div
                    key={subCategory.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md">
                      <Tag className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-900">{subCategory.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          subCategory.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {subCategory.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {subCategory.description || 'No description'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{subCategory.postCount || 0} posts</span>
                        <span>Created: {new Date(subCategory.createdAt).toLocaleString()}</span>
                        <span>Updated: {new Date(subCategory.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditSubCategoryDialog(subCategory)}
                        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        disabled={editSubCategoryMutation.isPending}
                        title="Edit sub-category"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubCategory(subCategory)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deleteSubCategoryMutation.isPending}
                        title="Delete sub-category"
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

        {/* Create Sub-Category Dialog */}
        <Dialog open={isCreateSubCategoryDialogOpen} onOpenChange={setIsCreateSubCategoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Sub-Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Parent Category</label>
                <Input
                  value={selectedCategory.name}
                  disabled
                  className="mt-1 bg-slate-50"
                />
                <p className="text-xs text-slate-500 mt-1">This sub-category will be created under "{selectedCategory.name}"</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name *</label>
                <Input
                  placeholder="Enter sub-category name"
                  value={subCategoryFormData.name}
                  onChange={(e) => setSubCategoryFormData({ ...subCategoryFormData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Input
                  placeholder="Enter sub-category description (optional)"
                  value={subCategoryFormData.description}
                  onChange={(e) => setSubCategoryFormData({ ...subCategoryFormData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status *</label>
                <select
                  value={subCategoryFormData.status}
                  onChange={(e) => setSubCategoryFormData({ ...subCategoryFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateSubCategoryDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateSubCategory} 
                className="bg-blue-600"
                disabled={createSubCategoryMutation.isPending}
              >
                {createSubCategoryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Sub-Category'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Sub-Category Dialog */}
        <Dialog open={isEditSubCategoryDialogOpen} onOpenChange={setIsEditSubCategoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Sub-Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Parent Category</label>
                <Input
                  value={selectedCategory.name}
                  disabled
                  className="mt-1 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name *</label>
                <Input
                  placeholder="Enter sub-category name"
                  value={editSubCategoryFormData.name}
                  onChange={(e) =>
                    setEditSubCategoryFormData({ ...editSubCategoryFormData, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Input
                  placeholder="Enter sub-category description (optional)"
                  value={editSubCategoryFormData.description}
                  onChange={(e) =>
                    setEditSubCategoryFormData({
                      ...editSubCategoryFormData,
                      description: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status *</label>
                <select
                  value={editSubCategoryFormData.status}
                  onChange={(e) =>
                    setEditSubCategoryFormData({
                      ...editSubCategoryFormData,
                      status: e.target.value,
                    })
                  }
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
                  setIsEditSubCategoryDialogOpen(false);
                  setEditingSubCategory(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubCategorySave}
                className="bg-blue-600"
                disabled={editSubCategoryMutation.isPending}
              >
                {editSubCategoryMutation.isPending ? (
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
