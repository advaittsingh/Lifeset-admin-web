import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { ArrowLeft, Save, Loader2, BookOpen, GraduationCap, Award, Layers } from 'lucide-react';
import { institutesApi } from '../../services/api/institutes';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CreateCoursePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    awardedId: '',
    specialisationId: '',
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['course-categories'],
    queryFn: () => institutesApi.getCourseMasterData(),
  });

  // Fetch awarded based on selected category
  const { data: awardedData } = useQuery({
    queryKey: ['awarded', formData.categoryId],
    queryFn: () => institutesApi.getAwardedData(formData.categoryId || undefined),
    enabled: !!formData.categoryId,
  });

  // Fetch specialisations based on selected awarded
  const { data: specialisationData } = useQuery({
    queryKey: ['specialisations', formData.awardedId],
    queryFn: () => institutesApi.getSpecialisationData(formData.awardedId || undefined),
    enabled: !!formData.awardedId,
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);
  const awardedList = Array.isArray(awardedData) ? awardedData : (awardedData?.data || []);
  const specialisations = Array.isArray(specialisationData) ? specialisationData : (specialisationData?.data || []);

  // Reset awarded and specialisation when category changes
  useEffect(() => {
    if (formData.categoryId) {
      setFormData(prev => ({ ...prev, awardedId: '', specialisationId: '' }));
    }
  }, [formData.categoryId]);

  // Reset specialisation when awarded changes
  useEffect(() => {
    if (formData.awardedId) {
      setFormData(prev => ({ ...prev, specialisationId: '' }));
    }
  }, [formData.awardedId]);

  const createMutation = useMutation({
    mutationFn: (data: any) => institutesApi.createCourse(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institute-courses'] });
      showToast('Course created successfully', 'success');
      navigate(`/institutes/${id}/courses`);
    },
    onError: (error: any) => {
      console.error('Error creating course:', error);
      let errorMessage = 'Failed to create course';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.message) {
          errorMessage = String(errorData.message);
        } else if (errorData?.error) {
          errorMessage = String(errorData.error);
        }
      }
      
      showToast(String(errorMessage), 'error');
    },
  });

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      showToast('Please enter course name', 'error');
      return;
    }
    if (!formData.categoryId) {
      showToast('Please select a category', 'error');
      return;
    }

    // Prepare data for API
    const apiData: any = {
      name: formData.name.trim(),
      categoryId: formData.categoryId,
    };

    if (formData.description?.trim()) {
      apiData.description = formData.description.trim();
    }
    if (formData.awardedId) {
      apiData.awardedId = formData.awardedId;
    }
    if (formData.specialisationId) {
      apiData.specialisationId = formData.specialisationId;
    }

    createMutation.mutate(apiData);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/institutes/${id}/courses`)}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Create Course</h1>
              <p className="text-slate-600 mt-1">Add a new course to this institute</p>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Course
              </>
            )}
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Side - Form */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Course Details</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Course Name */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Course Name *
                </label>
                <Input
                  placeholder="e.g., Bachelor of Computer Science"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Description</label>
                <Textarea
                  placeholder="Enter course description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 min-h-[120px]"
                  rows={6}
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Category *
                </label>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="mt-1"
                >
                  <option value="">Select Category</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                {categories.length === 0 && (
                  <p className="text-xs text-slate-500 mt-1">No categories available. Create categories in Course Master first.</p>
                )}
              </div>

              {/* Awarded Selection */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Awarded
                </label>
                <Select
                  value={formData.awardedId}
                  onChange={(e) => setFormData({ ...formData, awardedId: e.target.value })}
                  className="mt-1"
                  disabled={!formData.categoryId}
                >
                  <option value="">Select Awarded (Optional)</option>
                  {awardedList.map((awarded: any) => (
                    <option key={awarded.id} value={awarded.id}>
                      {awarded.name}
                    </option>
                  ))}
                </Select>
                {!formData.categoryId && (
                  <p className="text-xs text-slate-500 mt-1">Please select a category first</p>
                )}
                {formData.categoryId && awardedList.length === 0 && (
                  <p className="text-xs text-slate-500 mt-1">No awarded available for this category. Create awarded in Awards page first.</p>
                )}
              </div>

              {/* Specialisation Selection */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Specialisation
                </label>
                <Select
                  value={formData.specialisationId}
                  onChange={(e) => setFormData({ ...formData, specialisationId: e.target.value })}
                  className="mt-1"
                  disabled={!formData.awardedId}
                >
                  <option value="">Select Specialisation (Optional)</option>
                  {specialisations.map((specialisation: any) => (
                    <option key={specialisation.id} value={specialisation.id}>
                      {specialisation.name}
                    </option>
                  ))}
                </Select>
                {!formData.awardedId && (
                  <p className="text-xs text-slate-500 mt-1">Please select an awarded first</p>
                )}
                {formData.awardedId && specialisations.length === 0 && (
                  <p className="text-xs text-slate-500 mt-1">No specialisations available for this awarded. Create specialisations in Specialisations page first.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Preview/Info */}
          <Card className="border-0 shadow-xl bg-white sticky top-6">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-emerald-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Course Information</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Course Name Preview */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Course Name</p>
                  <p className="text-lg font-bold text-slate-900">
                    {formData.name || <span className="text-slate-400 italic">Enter course name</span>}
                  </p>
                </div>

                {/* Category Preview */}
                {formData.categoryId && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Category</p>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-medium text-blue-900">
                        {categories.find((c: any) => c.id === formData.categoryId)?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Awarded Preview */}
                {formData.awardedId && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-2">Awarded</p>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      <p className="text-sm font-medium text-purple-900">
                        {awardedList.find((a: any) => a.id === formData.awardedId)?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Specialisation Preview */}
                {formData.specialisationId && (
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Specialisation</p>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-indigo-600" />
                      <p className="text-sm font-medium text-indigo-900">
                        {specialisations.find((s: any) => s.id === formData.specialisationId)?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description Preview */}
                {formData.description && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {formData.description}
                    </p>
                  </div>
                )}

                {/* Info Box */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Select Category (required), then optionally select Awarded and Specialisation to create a more specific course.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

