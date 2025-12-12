import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Save, Loader2, Award } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { institutesApi } from '../../services/api/institutes';

export default function CreateAwardPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    status: 'active',
  });

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['course-master-categories'],
    queryFn: () => institutesApi.getCourseMasterData(),
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);

  // Fetch existing item if editing
  const { data: existingItem, isLoading: isLoadingItem } = useQuery({
    queryKey: ['awarded', id],
    queryFn: async () => {
      const data = await institutesApi.getAwardedData();
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
        categoryId: existingItem.courseCategoryId || existingItem.courseCategory?.id || '',
        status: existingItem.isActive !== false ? 'active' : 'inactive',
      });
    }
  }, [existingItem, isEditMode]);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (!data.categoryId) {
        throw new Error('Course Category is required');
      }
      return institutesApi.createAwarded({
        name: data.name,
        courseCategoryId: data.categoryId,
        description: '',
        isActive: data.status === 'active',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awarded-list'] });
      queryClient.invalidateQueries({ queryKey: ['course-master-categories-for-awards'] });
      queryClient.invalidateQueries({ queryKey: ['awarded-for-specialisation-filter'] });
      showToast('Awarded created successfully', 'success');
      navigate('/dashboard/awards');
    },
    onError: (error: any) => showToast(error?.message || 'Failed to create awarded', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (!data.categoryId) {
        throw new Error('Course Category is required');
      }
      return institutesApi.updateAwarded(id!, {
        name: data.name,
        courseCategoryId: data.categoryId,
        description: '',
        isActive: data.status === 'active',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awarded-list'] });
      queryClient.invalidateQueries({ queryKey: ['awarded', id] });
      queryClient.invalidateQueries({ queryKey: ['awarded-for-specialisation-filter'] });
      showToast('Awarded updated successfully', 'success');
      navigate('/dashboard/awards');
    },
    onError: (error: any) => showToast(error?.message || 'Failed to update awarded', 'error'),
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      showToast('Please enter a name', 'error');
      return;
    }
    if (!formData.categoryId) {
      showToast('Please select a course category', 'error');
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
              onClick={() => navigate('/dashboard/awards')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Awarded
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditMode ? 'Edit Awarded' : 'Add Awarded'}
              </h1>
              <p className="text-slate-600 mt-1">
                {isEditMode ? 'Update awarded details' : 'Add a new awarded (e.g., BTech, MTech)'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl bg-white max-w-2xl">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-yellow-50/50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-md">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Awarded Details</CardTitle>
                <CardDescription className="text-slate-600">Enter awarded information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Course Category */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Course Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
              >
                <option value="">Select Course Category *</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Select the course category this awarded belongs to (e.g., Engineering)
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                Name *
              </label>
              <Input
                placeholder="Enter awarded name (e.g., BTech, MTech, Diploma)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Enter the name of the awarded (e.g., BTech, MTech)
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
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Set the status of this awarded
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold shadow-lg py-6 text-base"
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

