import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { FileText, ArrowLeft, Plus, Search, Loader2, Tag, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { postsApi } from '../../services/api/posts';
import { useToast } from '../../contexts/ToastContext';

export default function WallCategoriesPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateSubCategoryDialogOpen, setIsCreateSubCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    categoryFor: '', 
    name: '', 
    description: '',
    status: 'active' 
  });
  const [subCategoryFormData, setSubCategoryFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  // Fetch parent categories from API (default - only parents)
  const { data: categoriesData, isLoading, error: categoriesError, refetch: refetchCategories } = useQuery({
    queryKey: ['wall-categories', 'parents', searchTerm],
    queryFn: async () => {
      try {
        // Default API call returns only parent categories (parentCategoryId is null)
        const data = await postsApi.getWallCategories();
        return Array.isArray(data) ? { data } : data;
      } catch (error: any) {
        console.error('Error fetching wall categories:', error);
        // Log detailed error information
        if (error?.response) {
          console.error('Error response:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers
          });
        }
        throw error; // Re-throw to let React Query handle it
      }
    },
    retry: 1, // Only retry once
  });

  // Fetch sub-categories for selected category
  const { data: subCategoriesData, isLoading: isLoadingSubCategories } = useQuery({
    queryKey: ['wall-categories', 'sub-categories', selectedCategory?.id],
    queryFn: async () => {
      if (!selectedCategory?.id) return { data: [] };
      try {
        // Fetch sub-categories using parentId query parameter
        const data = await postsApi.getWallCategories({ parentId: selectedCategory.id });
        return Array.isArray(data) ? { data } : data;
      } catch (error: any) {
        console.error('Error fetching sub-categories:', error);
        return { data: [] };
      }
    },
    enabled: !!selectedCategory?.id,
  });

  const topLevelCategories = categoriesData?.data || [];
  const subCategories = subCategoriesData?.data || [];
  
  const filteredCategories = useMemo(() => {
    return topLevelCategories.filter((cat: any) =>
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topLevelCategories, searchTerm]);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => postsApi.createWallCategory({
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
    onError: () => showToast('Failed to create category', 'error'),
  });

  const createSubCategoryMutation = useMutation({
    mutationFn: (data: typeof subCategoryFormData) => postsApi.createWallCategory({
      name: data.name,
      description: data.description || undefined,
      categoryFor: selectedCategory?.metadata?.categoryFor || selectedCategory?.categoryFor || undefined,
      parentCategoryId: selectedCategory?.id,
      isActive: data.status === 'active',
    }),
    onSuccess: async (response) => {
      showToast('Sub-category created successfully', 'success');
      setIsCreateSubCategoryDialogOpen(false);
      setSubCategoryFormData({ name: '', description: '', status: 'active' });
      
      // Invalidate and refetch to get the updated list
      await queryClient.invalidateQueries({ queryKey: ['wall-categories'] });
      // Refetch both parent categories and sub-categories
      await queryClient.refetchQueries({ queryKey: ['wall-categories', 'parents'] });
      if (selectedCategory?.id) {
        await queryClient.refetchQueries({ queryKey: ['wall-categories', 'sub-categories', selectedCategory.id] });
      }
    },
    onError: (error: any) => {
      console.error('Error creating sub-category:', error);
      showToast('Failed to create sub-category', 'error');
    },
  });

  const handleCreate = () => {
    if (!formData.name.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleCreateSubCategory = () => {
    if (!subCategoryFormData.name.trim()) {
      showToast('Please enter a sub-category name', 'error');
      return;
    }
    createSubCategoryMutation.mutate(subCategoryFormData);
  };

  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category);
  };

  const handleBackToList = () => {
    setSelectedCategory(null);
  };

  // If viewing a category detail, show the detail view
  if (selectedCategory) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBackToList}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{selectedCategory.name}</h1>
                <p className="text-slate-600 mt-1">Manage sub-categories for this category</p>
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
                  {selectedCategory.metadata?.categoryFor && (
                    <p className="text-xs text-slate-500 mb-1">
                      For: {selectedCategory.metadata.categoryFor}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    {selectedCategory.postCount || 0} posts
                  </p>
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
                  {subCategories.map((subCategory: any) => (
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
                        <p className="text-xs text-slate-500 mt-1">
                          {subCategory.postCount || 0} posts
                        </p>
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
        </div>
      </AdminLayout>
    );
  }

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
                {filteredCategories.map((category: any) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-blue-300 transition-colors cursor-pointer"
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
                      <p className="text-sm text-slate-600 mt-1">{category.description || 'No description'}</p>
                      {category.metadata?.categoryFor && (
                        <p className="text-xs text-slate-500 mt-1">For: {category.metadata.categoryFor}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-slate-500">{category.postCount || 0} posts</p>
                        {category.subCategoryCount !== undefined && (
                          <p className="text-xs text-slate-500">{category.subCategoryCount || 0} sub-categories</p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Wall Category</DialogTitle>
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
      </div>
    </AdminLayout>
  );
}
