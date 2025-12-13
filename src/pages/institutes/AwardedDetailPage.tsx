import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Award, Layers, CheckCircle2, XCircle } from 'lucide-react';
import { institutesApi } from '../../services/api/institutes';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

export default function AwardedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [isCreateSpecialisationOpen, setIsCreateSpecialisationOpen] = useState(false);
  const [isEditSpecialisationOpen, setIsEditSpecialisationOpen] = useState(false);
  const [isDeleteSpecialisationOpen, setIsDeleteSpecialisationOpen] = useState(false);
  const [isEditAwardedOpen, setIsEditAwardedOpen] = useState(false);
  const [isDeleteAwardedOpen, setIsDeleteAwardedOpen] = useState(false);
  
  const [selectedSpecialisation, setSelectedSpecialisation] = useState<any>(null);
  
  const [specialisationFormData, setSpecialisationFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  const [awardedFormData, setAwardedFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  // Fetch awarded details - fetch all awarded and find the matching one
  const { data: awardedData, isLoading: isLoadingAwarded } = useQuery({
    queryKey: ['awarded-detail', id],
    queryFn: async () => {
      // Fetch all awarded (without category filter)
      const allAwarded = await institutesApi.getAwardedData();
      const awardeds = Array.isArray(allAwarded) ? allAwarded : (allAwarded?.data || []);
      return awardeds.find((a: any) => a.id === id) || null;
    },
    enabled: !!id,
  });

  const awarded = awardedData;

  // Fetch specialisations for this awarded
  const { data: specialisationData, isLoading: isLoadingSpecialisations } = useQuery({
    queryKey: ['specialisations-by-awarded', id],
    queryFn: () => institutesApi.getSpecialisationData(id!),
    enabled: !!id,
  });

  const specialisationList = Array.isArray(specialisationData) ? specialisationData : (specialisationData?.data || []);

  // Create Specialisation Mutation
  const createSpecialisationMutation = useMutation({
    mutationFn: (data: any) => institutesApi.createSpecialisation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialisations-by-awarded', id] });
      showToast('Specialisation created successfully', 'success');
      setIsCreateSpecialisationOpen(false);
      setSpecialisationFormData({ name: '', description: '', isActive: true });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create specialisation';
      showToast(String(errorMessage), 'error');
    },
  });

  // Update Specialisation Mutation
  const updateSpecialisationMutation = useMutation({
    mutationFn: ({ id: specId, data }: { id: string; data: any }) => institutesApi.updateSpecialisation(specId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialisations-by-awarded', id] });
      showToast('Specialisation updated successfully', 'success');
      setIsEditSpecialisationOpen(false);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update specialisation';
      showToast(String(errorMessage), 'error');
    },
  });

  // Delete Specialisation Mutation
  const deleteSpecialisationMutation = useMutation({
    mutationFn: (specId: string) => institutesApi.deleteSpecialisation(specId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialisations-by-awarded', id] });
      showToast('Specialisation deleted successfully', 'success');
      setIsDeleteSpecialisationOpen(false);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete specialisation';
      showToast(String(errorMessage), 'error');
    },
  });

  // Update Awarded Mutation
  const updateAwardedMutation = useMutation({
    mutationFn: ({ id: awardedId, data }: { id: string; data: any }) => institutesApi.updateAwarded(awardedId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awarded-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['awarded'] });
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
      // Navigate back to category detail page
      if (awarded?.courseCategoryId) {
        navigate(`/institutes/course-master/${awarded.courseCategoryId}`);
      } else {
        navigate('/institutes/course-master');
      }
      showToast('Awarded deleted successfully', 'success');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete awarded';
      showToast(String(errorMessage), 'error');
    },
  });

  if (isLoadingAwarded) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (!awarded) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96 text-slate-600">
          <Award className="h-12 w-12 mb-4" />
          <p className="text-xl font-semibold">Awarded not found</p>
          <Button onClick={() => navigate('/institutes/course-master')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Course Master
          </Button>
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
              onClick={() => {
                if (awarded.courseCategoryId) {
                  navigate(`/institutes/course-master/${awarded.courseCategoryId}`);
                } else {
                  navigate('/institutes/course-master');
                }
              }}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{awarded.name}</h1>
              <p className="text-slate-600 mt-1">{awarded.description || 'Manage specialisations for this awarded'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAwardedFormData({
                  name: awarded.name,
                  description: awarded.description || '',
                  isActive: awarded.isActive !== false,
                });
                setIsEditAwardedOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Awarded
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-indigo-600"
              onClick={() => setIsCreateSpecialisationOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Specialisation
            </Button>
          </div>
        </div>

        {/* Awarded Info Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">{awarded.name}</h2>
                {awarded.description && (
                  <p className="text-slate-600 mt-1">{awarded.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <span>{specialisationList.length} Specialisations</span>
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specialisations Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Specialisations</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateSpecialisationOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Specialisation
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingSpecialisations ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : specialisationList.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">No specialisations found</p>
                <p className="text-sm text-slate-500">Create your first specialisation to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Specialisation</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {specialisationList.map((spec: any) => (
                      <tr key={spec.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                              <Layers className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{spec.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-600 max-w-md">
                            {spec.description || <span className="text-slate-400 italic">No description</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {spec.isActive !== false ? (
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
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSpecialisation(spec);
                                setSpecialisationFormData({
                                  name: spec.name,
                                  description: spec.description || '',
                                  isActive: spec.isActive !== false,
                                });
                                setIsEditSpecialisationOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedSpecialisation(spec);
                                setIsDeleteSpecialisationOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Specialisation Dialog */}
        <Dialog open={isCreateSpecialisationOpen} onOpenChange={setIsCreateSpecialisationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Specialisation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name *</label>
                <Input
                  value={specialisationFormData.name}
                  onChange={(e) => setSpecialisationFormData({ ...specialisationFormData, name: e.target.value })}
                  placeholder="e.g., Artificial Intelligence"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Textarea
                  value={specialisationFormData.description}
                  onChange={(e) => setSpecialisationFormData({ ...specialisationFormData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                <Select
                  value={specialisationFormData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setSpecialisationFormData({ ...specialisationFormData, isActive: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateSpecialisationOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
                onClick={() => createSpecialisationMutation.mutate({
                  name: specialisationFormData.name,
                  description: specialisationFormData.description,
                  awardedId: id,
                  isActive: specialisationFormData.isActive,
                })}
                disabled={createSpecialisationMutation.isPending || !specialisationFormData.name}
              >
                {createSpecialisationMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Specialisation Dialog */}
        <Dialog open={isEditSpecialisationOpen} onOpenChange={setIsEditSpecialisationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Specialisation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name *</label>
                <Input
                  value={specialisationFormData.name}
                  onChange={(e) => setSpecialisationFormData({ ...specialisationFormData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Textarea
                  value={specialisationFormData.description}
                  onChange={(e) => setSpecialisationFormData({ ...specialisationFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                <Select
                  value={specialisationFormData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setSpecialisationFormData({ ...specialisationFormData, isActive: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditSpecialisationOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
                onClick={() => updateSpecialisationMutation.mutate({
                  id: selectedSpecialisation?.id,
                  data: {
                    name: specialisationFormData.name,
                    description: specialisationFormData.description,
                    awardedId: id,
                    isActive: specialisationFormData.isActive,
                  },
                })}
                disabled={updateSpecialisationMutation.isPending || !specialisationFormData.name}
              >
                {updateSpecialisationMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Specialisation Dialog */}
        <Dialog open={isDeleteSpecialisationOpen} onOpenChange={setIsDeleteSpecialisationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Specialisation</DialogTitle>
            </DialogHeader>
            <p className="text-slate-600">Are you sure you want to delete "{selectedSpecialisation?.name}"?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteSpecialisationOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => deleteSpecialisationMutation.mutate(selectedSpecialisation?.id)}
                disabled={deleteSpecialisationMutation.isPending}
              >
                {deleteSpecialisationMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Awarded Dialog */}
        <Dialog open={isEditAwardedOpen} onOpenChange={setIsEditAwardedOpen}>
          <DialogContent>
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
                  value={awardedFormData.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setAwardedFormData({ ...awardedFormData, isActive: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditAwardedOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
                onClick={() => updateAwardedMutation.mutate({
                  id: id!,
                  data: {
                    name: awardedFormData.name,
                    description: awardedFormData.description,
                    isActive: awardedFormData.isActive,
                  },
                })}
                disabled={updateAwardedMutation.isPending || !awardedFormData.name}
              >
                {updateAwardedMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update'}
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
            <p className="text-slate-600">Are you sure you want to delete "{awarded.name}"?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteAwardedOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => deleteAwardedMutation.mutate(id!)}
                disabled={deleteAwardedMutation.isPending}
              >
                {deleteAwardedMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

