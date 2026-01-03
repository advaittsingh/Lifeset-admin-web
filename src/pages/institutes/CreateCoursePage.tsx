import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { ArrowLeft, Save, Loader2, BookOpen, GraduationCap, Award, Layers, Check, Search, Building2, Clock, Calendar, Users } from 'lucide-react';
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
    affiliationId: '', // Optional - Institute ID
    affiliationName: '', // Display name for selected institute
    duration: '', // Mandatory - Number of years
    section: '', // Optional - Section (ABCD or 1234)
    courseMode: '', // Full Time, Part Time
    level: '', // UG/PG/Diploma/Vocational
  });

  // State for institute search
  const [instituteSearchTerm, setInstituteSearchTerm] = useState('');
  const [showInstituteDropdown, setShowInstituteDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.institute-search-container')) {
        setShowInstituteDropdown(false);
      }
    };

    if (showInstituteDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showInstituteDropdown]);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['course-categories'],
    queryFn: () => institutesApi.getCourseMasterData(),
  });

  // Fetch institutes for affiliation search
  const { data: institutesData } = useQuery({
    queryKey: ['institutes-search', instituteSearchTerm],
    queryFn: () => institutesApi.getInstitutes({ search: instituteSearchTerm || undefined }),
    enabled: showInstituteDropdown && instituteSearchTerm.length > 0,
  });

  const institutes = Array.isArray(institutesData) ? institutesData : (institutesData?.data || []);

  // Fetch awarded based on selected category
  const { data: awardedData } = useQuery({
    queryKey: ['awarded', formData.categoryId],
    queryFn: () => institutesApi.getAwardedData(formData.categoryId || undefined),
    enabled: !!formData.categoryId,
  });

  // Fetch specialisations based on selected course category (changed from awardedId)
  const { data: specialisationData } = useQuery({
    queryKey: ['specialisations', formData.categoryId],
    queryFn: () => institutesApi.getSpecialisationData(formData.categoryId || undefined),
    enabled: !!formData.categoryId,
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

  // Reset specialisation when category changes (changed from awardedId)
  useEffect(() => {
    if (formData.categoryId) {
      setFormData(prev => ({ ...prev, specialisationId: '' }));
    }
  }, [formData.categoryId]);

  // Auto-generate course name based on Award + Specialisation (Category is not included in name)
  useEffect(() => {
    if (formData.awardedId) {
      const awarded = awardedList.find((a: any) => a.id === formData.awardedId);
      
      if (awarded) {
        let generatedName = awarded.name; // Start with award name (e.g., "BA")
        
        // If specialisation exists, append " in " + specialisation name
        if (formData.specialisationId) {
          const specialisation = specialisations.find((s: any) => s.id === formData.specialisationId);
          if (specialisation) {
            generatedName = `${awarded.name} in ${specialisation.name}`;
          }
        }
        
        setFormData(prev => ({ ...prev, name: generatedName }));
      }
    } else {
      // Clear name if award is not selected
      setFormData(prev => ({ ...prev, name: '' }));
    }
  }, [formData.awardedId, formData.specialisationId, awardedList, specialisations]);

  const createMutation = useMutation({
    mutationFn: (data: any) => institutesApi.createCourse(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institute-courses'] });
      showToast('Course created successfully', 'success');
      navigate(`/institutes/${id}/courses`);
    },
    onError: (error: any) => {
      console.error('Error creating course:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error response (full):', JSON.stringify(error?.response?.data, null, 2));
      console.error('Error status:', error?.response?.status);
      console.error('Request URL:', error?.config?.url);
      console.error('Request data sent:', error?.config?.data);
      console.error('Full error object:', JSON.stringify(error?.response, null, 2));
      
      let errorMessage = 'Failed to create course';
      
      try {
        if (error?.response?.data) {
          const errorData = error.response.data;
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData?.message) {
            errorMessage = String(errorData.message);
          } else if (errorData?.error) {
            errorMessage = String(errorData.error);
          } else if (errorData?.code && errorData?.message) {
            errorMessage = `${String(errorData.code)}: ${String(errorData.message)}`;
          } else {
            errorMessage = 'Server error occurred. Please check console for details.';
          }
        } else if (error?.message) {
          errorMessage = String(error.message);
        }
      } catch (e) {
        errorMessage = 'An unexpected error occurred';
      }
      
      showToast(String(errorMessage), 'error');
    },
  });

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      showToast('Please select Category and Award to generate course name', 'error');
      return;
    }
    if (!formData.categoryId) {
      showToast('Please select a category', 'error');
      return;
    }
    if (!formData.awardedId) {
      showToast('Please select an award', 'error');
      return;
    }
    if (!formData.duration) {
      showToast('Please select duration', 'error');
      return;
    }

    // Prepare data for API
    const apiData: any = {
      name: formData.name.trim(),
      categoryId: formData.categoryId,
      awardedId: formData.awardedId,
      duration: parseInt(formData.duration),
    };

    // Add optional fields only if they have values
    if (formData.description?.trim()) {
      apiData.description = formData.description.trim();
    }
    // Only include specialisationId if it's selected (not empty string)
    if (formData.specialisationId && formData.specialisationId.trim()) {
      apiData.specialisationId = formData.specialisationId;
    }
    // Affiliation (optional)
    if (formData.affiliationId && formData.affiliationId.trim()) {
      apiData.affiliationId = formData.affiliationId;
    }
    // Section (optional)
    if (formData.section && formData.section.trim()) {
      apiData.section = formData.section.trim();
    }
    // Course Mode
    if (formData.courseMode) {
      apiData.courseMode = formData.courseMode;
    }
    // Level
    if (formData.level) {
      apiData.level = formData.level;
    }

    console.log('Sending course data:', JSON.stringify(apiData, null, 2));
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
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                <span>Create Course</span>
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
              {/* Course Name - Auto-generated */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Course Name * (Auto-generated)
                </label>
                <Input
                  placeholder="Select Category and Award to generate course name"
                  value={formData.name}
                  readOnly
                  className="mt-1 bg-slate-50 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Course name is automatically generated from Category + Award + Specialisation
                </p>
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
                  disabled={!formData.categoryId}
                >
                  <option value="">Select Specialisation (Optional)</option>
                  {specialisations.map((specialisation: any) => (
                    <option key={specialisation.id} value={specialisation.id}>
                      {specialisation.name}
                    </option>
                  ))}
                </Select>
                {!formData.categoryId && (
                  <p className="text-xs text-slate-500 mt-1">Please select a course category first</p>
                )}
                {formData.categoryId && specialisations.length === 0 && (
                  <p className="text-xs text-slate-500 mt-1">No specialisations available for this course category. Create specialisations in Specialisations page first.</p>
                )}
              </div>

              {/* Affiliation (Optional) */}
              <div className="institute-search-container">
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Affiliation (Optional)
                </label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search and select university/institute..."
                    value={formData.affiliationName || instituteSearchTerm}
                    onChange={(e) => {
                      setInstituteSearchTerm(e.target.value);
                      setShowInstituteDropdown(true);
                      if (!e.target.value) {
                        setFormData(prev => ({ ...prev, affiliationId: '', affiliationName: '' }));
                      }
                    }}
                    onFocus={() => setShowInstituteDropdown(true)}
                    className="pl-10"
                  />
                  {showInstituteDropdown && instituteSearchTerm && institutes.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {institutes.map((institute: any) => (
                        <div
                          key={institute.id}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              affiliationId: institute.id,
                              affiliationName: institute.name,
                            }));
                            setInstituteSearchTerm('');
                            setShowInstituteDropdown(false);
                          }}
                          className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                        >
                          <div className="font-medium text-slate-900">{institute.name}</div>
                          {institute.city && institute.state && (
                            <div className="text-xs text-slate-500">{institute.city}, {institute.state}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {formData.affiliationName && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-900">{formData.affiliationName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, affiliationId: '', affiliationName: '' }));
                          setInstituteSearchTerm('');
                        }}
                        className="ml-auto h-6 px-2 text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Duration (Mandatory) */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Duration (Years) *
                </label>
                <Select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="mt-1"
                >
                  <option value="">Select Duration</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Year' : 'Years'}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Section (Optional) */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Section (Optional)
                </label>
                <Input
                  placeholder="e.g., A, B, C, D or 1, 2, 3, 4"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Some colleges use sections like ABCD or 1234</p>
              </div>

              {/* Course Mode */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Course Mode
                </label>
                <Select
                  value={formData.courseMode}
                  onChange={(e) => setFormData({ ...formData, courseMode: e.target.value })}
                  className="mt-1"
                >
                  <option value="">Select Course Mode</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                </Select>
              </div>

              {/* Level */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Level
                </label>
                <Select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="mt-1"
                >
                  <option value="">Select Level</option>
                  <option value="UG">UG (Undergraduate)</option>
                  <option value="PG">PG (Postgraduate)</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="VOCATIONAL">Vocational</option>
                </Select>
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

