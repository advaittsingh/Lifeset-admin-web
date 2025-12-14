import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { FileText, ArrowLeft, Plus, Search, Loader2, Tag, ChevronRight } from 'lucide-react';
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
    status: 'active' 
  });
  const [subCategoryFormData, setSubCategoryFormData] = useState({
    name: '',
    status: 'active'
  });

  // Fetch categories from API
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['wall-categories', searchTerm],
    queryFn: async () => {
      try {
        const data = await postsApi.getWallCategories();
        return Array.isArray(data) ? { data } : data;
      } catch (error) {
        console.error('Error fetching wall categories:', error);
        return { data: [] };
      }
    },
  });

  const allCategories = categoriesData?.data || [];
  
  // Filter to show only top-level categories (no parentCategoryId)
  const topLevelCategories = useMemo(() => {
    return allCategories.filter((cat: any) => {
      const hasParent = cat.metadata?.parentCategoryId || 
                       cat.parentCategoryId || 
                       cat.parentCategory?.id ||
                       (cat.metadata?.parentCategory && typeof cat.metadata.parentCategory === 'string' ? cat.metadata.parentCategory : cat.metadata?.parentCategory?.id);
      return !hasParent;
    });
  }, [allCategories]);
  
  const filteredCategories = useMemo(() => {
    return topLevelCategories.filter((cat: any) =>
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [topLevelCategories, searchTerm]);

  // Get sub-categories for selected category
  // Check multiple possible locations for parentCategoryId
  const subCategories = useMemo(() => {
    if (!selectedCategory) return [];
    
    return allCategories.filter((cat: any) => {
      const parentId = cat.metadata?.parentCategoryId || 
                      cat.parentCategoryId || 
                      cat.parentCategory?.id ||
                      (cat.metadata?.parentCategory && typeof cat.metadata.parentCategory === 'string' ? cat.metadata.parentCategory : cat.metadata?.parentCategory?.id);
      return parentId === selectedCategory.id;
    });
  }, [allCategories, selectedCategory]);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => postsApi.createWallCategory({
      name: data.name,
      categoryFor: data.categoryFor || undefined,
      parentCategoryId: undefined, // Top-level categories have no parent
      isActive: data.status === 'active',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wall-categories'] });
      queryClient.refetchQueries({ queryKey: ['wall-categories'] });
      showToast('Category created successfully', 'success');
      setIsCreateDialogOpen(false);
      setFormData({ categoryFor: '', name: '', status: 'active' });
    },
    onError: () => showToast('Failed to create category', 'error'),
  });

  const createSubCategoryMutation = useMutation({
    mutationFn: (data: typeof subCategoryFormData) => postsApi.createWallCategory({
      name: data.name,
      categoryFor: selectedCategory?.metadata?.categoryFor || undefined,
      parentCategoryId: selectedCategory?.id,
      isActive: data.status === 'active',
    }),
    onSuccess: async (response) => {
      showToast('Sub-category created successfully', 'success');
      setIsCreateSubCategoryDialogOpen(false);
      setSubCategoryFormData({ name: '', status: 'active' });
      
      // Invalidate and refetch to get the updated list
      await queryClient.invalidateQueries({ queryKey: ['wall-categories'] });
      await queryClient.refetchQueries({ queryKey: ['wall-categories'] });
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
                {subCategories.length === 0 
                  ? 'No sub-categories yet. Create one to get started.'
                  : `${subCategories.length} sub-categor${subCategories.length === 1 ? 'y' : 'ies'}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subCategories.length === 0 ? (
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
                      <p className="text-xs text-slate-500 mt-1">{category.postCount || 0} posts</p>
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
