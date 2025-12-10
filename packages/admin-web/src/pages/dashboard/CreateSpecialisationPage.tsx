import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Save, Loader2, BookOpen } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { institutesApi } from '../../services/api/institutes';

export default function CreateSpecialisationPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    awardedId: '',
    status: 'active',
  });

  // Fetch awarded for dropdown
  const { data: awardedData } = useQuery({
    queryKey: ['awarded-for-specialisation-filter'],
    queryFn: () => institutesApi.getAwardedData(),
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent auto-refresh
  });

  const awardedList = Array.isArray(awardedData) ? awardedData : (awardedData?.data || []);

  // Fetch existing item if editing
  const { data: existingItem, isLoading: isLoadingItem } = useQuery({
    queryKey: ['specialisation', id],
    queryFn: async () => {
      const data = await institutesApi.getSpecialisationData();
      const allItems = Array.isArray(data) ? data : (data?.data || []);
      return allItems.find((item: any) => item.id === id);
    },
    enabled: isEditMode && !!id,
  });

  // Update form when existing item loads
  useEffect(() => {
    if (existingItem && isEditMode) {
      setFormData({
        name: existingItem.name || '',
        awardedId: existingItem.awardedId || existingItem.awarded?.id || '',
        status: existingItem.isActive !== false ? 'active' : 'inactive',
      });
    }
  }, [existingItem, isEditMode]);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (!data.awardedId) {
        throw new Error('Awarded is required');
      }
      return institutesApi.createSpecialisation({
        name: data.name,
        awardedId: data.awardedId,
        description: '',
        isActive: data.status === 'active',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialisations-list'] });
      queryClient.invalidateQueries({ queryKey: ['awarded-for-specialisation-filter'] });
      showToast('Specialisation created successfully', 'success');
      navigate('/dashboard/specialisations');
    },
    onError: (error: any) => showToast(error?.message || 'Failed to create specialisation', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (!data.awardedId) {
        throw new Error('Awarded is required');
      }
      return institutesApi.updateSpecialisation(id!, {
        name: data.name,
        awardedId: data.awardedId,
        description: '',
        isActive: data.status === 'active',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialisations-list'] });
      queryClient.invalidateQueries({ queryKey: ['specialisation', id] });
      showToast('Specialisation updated successfully', 'success');
      navigate('/dashboard/specialisations');
    },
    onError: (error: any) => showToast(error?.message || 'Failed to update specialisation', 'error'),
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      showToast('Please enter a name', 'error');
      return;
    }
    if (!formData.awardedId) {
      showToast('Please select an awarded', 'error');
      return;
    }

    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoadingItem && isEditMode) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
              onClick={() => navigate('/dashboard/specialisations')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Specialisations
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditMode ? 'Edit Specialisation' : 'Add Specialisation'}
              </h1>
              <p className="text-slate-600 mt-1">
                {isEditMode ? 'Update specialisation details' : 'Add a new specialisation (e.g., CSE, Electronics)'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl bg-white max-w-2xl">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-purple-50/50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Specialisation Details</CardTitle>
                <CardDescription className="text-slate-600">Enter specialisation information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Awarded */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Awarded *
              </label>
              <select
                value={formData.awardedId}
                onChange={(e) => setFormData({ ...formData, awardedId: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              >
                <option value="">Select Awarded *</option>
                {awardedList.map((awarded: any) => (
                  <option key={awarded.id} value={awarded.id}>
                    {awarded.name} ({awarded.courseCategory?.name || 'N/A'})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Select the awarded this specialisation belongs to (e.g., BTech, MTech)
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Name *
              </label>
              <Input
                placeholder="Enter specialisation name (e.g., CSE, Electronics, Mechanical)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter the name of the specialisation (e.g., CSE, Electronics)
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Set the status of this specialisation
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-lg py-6 text-base"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
