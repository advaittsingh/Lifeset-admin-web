import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { FileText, ArrowLeft, Plus, Edit, Trash2, Search, Loader2, Tag } from 'lucide-react';
import { postsApi } from '../../services/api/posts';
import { useToast } from '../../contexts/ToastContext';

export default function WallCategoriesPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  // Mock data - replace with actual API call when endpoint is available
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['wall-categories', searchTerm],
    queryFn: async () => {
      // This would be an actual API call
      return {
        data: [
          { id: '1', name: 'General', description: 'General posts and updates', isActive: true, postCount: 1250 },
          { id: '2', name: 'Jobs', description: 'Job postings and opportunities', isActive: true, postCount: 450 },
          { id: '3', name: 'Events', description: 'College and community events', isActive: true, postCount: 320 },
          { id: '4', name: 'News', description: 'Latest news and updates', isActive: true, postCount: 890 },
        ],
      };
    },
  });

  const categories = categoriesData?.data || [];
  const filteredCategories = categories.filter((cat: any) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    showToast('Category created successfully', 'success');
    setIsCreateDialogOpen(false);
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    showToast('Category updated successfully', 'success');
    setIsEditDialogOpen(false);
    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleDelete = (category: any) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      showToast('Category deleted successfully', 'success');
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
                  <p className="text-3xl font-bold text-slate-900">{categories.length}</p>
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
                    {categories.filter((c: any) => c.isActive).length}
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
                    {categories.reduce((sum: number, c: any) => sum + (c.postCount || 0), 0)}
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
            ) : (
              <div className="space-y-3">
                {filteredCategories.map((category: any) => (
                  <div
                    key={category.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
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
                      <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                      <p className="text-xs text-slate-500 mt-1">{category.postCount || 0} posts</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(category)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Wall Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Category Name</label>
                <Input
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <Textarea
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-blue-600">Create Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Wall Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Category Name</label>
                <Input
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <Textarea
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} className="bg-blue-600">Update Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}














