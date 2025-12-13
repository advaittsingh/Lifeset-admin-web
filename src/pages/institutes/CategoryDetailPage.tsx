import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, BookOpen, Award, Layers, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { institutesApi } from '../../services/api/institutes';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [isCreateAwardedOpen, setIsCreateAwardedOpen] = useState(false);
  const [isEditAwardedOpen, setIsEditAwardedOpen] = useState(false);
  const [isDeleteAwardedOpen, setIsDeleteAwardedOpen] = useState(false);
  const [selectedAwarded, setSelectedAwarded] = useState<any>(null);
  
  const [awardedFormData, setAwardedFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  // Fetch category details
  const { data: categoriesData } = useQuery({
    queryKey: ['course-master'],
    queryFn: () => institutesApi.getCourseMasterData(),
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);
  const category = categories.find((cat: any) => cat.id === id);

  // Fetch awarded for this category
  const { data: awardedData, isLoading: isLoadingAwarded } = useQuery({
    queryKey: ['awarded', id],
    queryFn: () => institutesApi.getAwardedData(id),
    enabled: !!id,
  });

  const awardedList = Array.isArray(awardedData) ? awardedData : (awardedData?.data || []);


  // Create Awarded Mutation
  const createAwardedMutation = useMutation({
    mutationFn: (data: any) => institutesApi.createAwarded({ ...data, courseCategoryId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awarded', id] });
      showToast('Awarded created successfully', 'success');
      setIsCreateAwardedOpen(false);
      setAwardedFormData({ name: '', description: '', isActive: true });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create awarded';
      showToast(String(errorMessage), 'error');
    },
  });

  // Update Awarded Mutation
  const updateAwardedMutation = useMutation({
    mutationFn: ({ id: awardedId, data }: { id: string; data: any }) => institutesApi.updateAwarded(awardedId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awarded', id] });
      showToast('Awarded updated successfully', 'success');
      setIsEditAwardedOpen(false);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update awarded';
      showToast(String(errorMessage), 'error');
    },
  });

  // Delete Awarded Mutation
  const deleteAwardedMutation = useMutation({
    mutationFn: (awardedId: string) => institutesApi.deleteAwarded(awardedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awarded', id] });
      showToast('Awarded deleted successfully', 'success');
      setIsDeleteAwardedOpen(false);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete awarded';
      showToast(String(errorMessage), 'error');
    },
  });


  if (!category) {
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
              onClick={() => navigate('/institutes/course-master')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course Master
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{category.name}</h1>
              <p className="text-slate-600 mt-1">
                {category.description || 'Manage awarded and specialisations for this category'}
              </p>
            </div>
          </div>
        </div>

        {/* Category Info Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">{category.name}</h2>
                {category.description && (
                  <p className="text-slate-600 mt-1">{category.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <span>{awardedList.length} Awarded</span>
                  <span>•</span>
                  <span>
                    {awardedList.reduce((sum: number, a: any) => 
                      sum + (a._count?.specialisations || 0), 0
                    )} Specialisations
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Awarded Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Awarded</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateAwardedOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Awarded
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingAwarded ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : awardedList.length === 0 ? (
              <div className="text-center py-12">
                <Award className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">No awarded found</p>
                <p className="text-sm text-slate-500">Create your first awarded to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Awarded</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Specialisations Count</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {awardedList.map((awarded: any) => {
                      const specialisationCount = awarded._count?.specialisations || 0;
                      return (
                        <tr key={awarded.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
                                <Award className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{awarded.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600 max-w-md">
                              {awarded.description || <span className="text-slate-400 italic">No description</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {awarded.isActive !== false ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                                <CheckCircle2 className="h-3 w-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                <XCircle className="h-3 w-3" />
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-600">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {specialisationCount} Specialisations
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/institutes/awarded/${awarded.id}`)}
                                className="hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAwarded(awarded);
                                  setAwardedFormData({
                                    name: awarded.name,
                                    description: awarded.description || '',
                                    isActive: awarded.isActive !== false,
                                  });
                                  setIsEditAwardedOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedAwarded(awarded);
                                  setIsDeleteAwardedOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Awarded Dialog */}
        <Dialog open={isCreateAwardedOpen} onOpenChange={setIsCreateAwardedOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Awarded</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name *</label>
                <Input
                  value={awardedFormData.name}
                  onChange={(e) => setAwardedFormData({ ...awardedFormData, name: e.target.value })}
                  placeholder="e.g., B-Tech, M-Tech"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Textarea
                  value={awardedFormData.description}
                  onChange={(e) => setAwardedFormData({ ...awardedFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                <Select
                  value={awardedFormData.isActive ? 'Active' : 'Inactive'}
                  onChange={(e) => setAwardedFormData({ ...awardedFormData, isActive: e.target.value === 'Active' })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateAwardedOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => createAwardedMutation.mutate(awardedFormData)}
                disabled={createAwardedMutation.isPending || !awardedFormData.name}
              >
                {createAwardedMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Awarded Dialog */}
        <Dialog open={isEditAwardedOpen} onOpenChange={setIsEditAwardedOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Awarded</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name *</label>
                <Input
                  value={awardedFormData.name}
                  onChange={(e) => setAwardedFormData({ ...awardedFormData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Textarea
                  value={awardedFormData.description}
                  onChange={(e) => setAwardedFormData({ ...awardedFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                <Select
                  value={awardedFormData.isActive ? 'Active' : 'Inactive'}
                  onChange={(e) => setAwardedFormData({ ...awardedFormData, isActive: e.target.value === 'Active' })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditAwardedOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => updateAwardedMutation.mutate({ id: selectedAwarded?.id, data: awardedFormData })}
                disabled={updateAwardedMutation.isPending || !awardedFormData.name}
              >
                {updateAwardedMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Awarded Dialog */}
        <Dialog open={isDeleteAwardedOpen} onOpenChange={setIsDeleteAwardedOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Awarded</DialogTitle>
            </DialogHeader>
            <p className="text-slate-600">
              Are you sure you want to delete "{selectedAwarded?.name}"? This will also delete all associated specialisations.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteAwardedOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => deleteAwardedMutation.mutate(selectedAwarded?.id)}
                disabled={deleteAwardedMutation.isPending}
              >
                {deleteAwardedMutation.isPending ? (
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

