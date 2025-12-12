import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Loader2, BookOpen } from 'lucide-react';
import { institutesApi } from '../../services/api/institutes';
import { useToast } from '../../contexts/ToastContext';

export default function CourseMasterPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['course-master'],
    queryFn: () => institutesApi.getCourseMasterData(),
  });

  const categories = Array.isArray(data) ? data : (data?.data || []);

  const createMutation = useMutation({
    mutationFn: (data: any) => institutesApi.createCourseCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-master'] });
      showToast('Category created successfully', 'success');
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => institutesApi.updateCourseCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-master'] });
      showToast('Category updated successfully', 'success');
      setIsEditDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => institutesApi.deleteCourseCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-master'] });
      showToast('Category deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Course Master Data</h1>
            <p className="text-slate-600 mt-1">Manage course categories</p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat: any) => (
                  <Card key={cat.id} className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <h3 className="font-semibold">{cat.name}</h3>
                          </div>
                          {cat.description && (
                            <p className="text-sm text-slate-600 mb-2">{cat.description}</p>
                          )}
                          <p className="text-xs text-slate-500">
                            {cat._count?.awardeds || 0} awardeds
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(cat);
                              setFormData({ name: cat.name, description: cat.description || '' });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(cat);
                              setIsDeleteDialogOpen(true);
                            }}
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

        {/* Create/Edit/Delete Dialogs - Similar pattern */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending || !formData.name}
              >
                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => updateMutation.mutate({ id: selectedItem?.id, data: formData })}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
            </DialogHeader>
            <p className="text-slate-600">Are you sure you want to delete "{selectedItem?.name}"?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(selectedItem?.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

