import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { ArrowLeft, Save, Eye, Briefcase, Loader2, Image as ImageIcon, Calendar, Send, Cloud, CloudOff } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsApi } from '../../services/api/cms';
import { institutesApi } from '../../services/api/institutes';
import { useAutoSave } from '../../hooks/useAutoSave';

const EXAM_LEVELS = ['8th Pass', '10th', '12th', 'Diploma', 'UG', 'PG', 'Others'];
const LANGUAGES = ['English', 'Hindi'];

export default function CreateGovtVacancyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    contentLanguage: 'English',
    mainCourseCategoryId: '',
    awardCategoryId: '',
    specialisationCategoryId: '',
    examLevel: '',
    examName: '',
    organisationImageUrl: '',
    organisationImageFile: null as File | null,
    organisationImagePreview: null as string | null,
    nameOfPost: '',
    firstAnnouncementDate: '',
    applicationSubmissionLastDate: '',
    examDate: '',
    examFees: '',
    vacanciesSeat: '',
    evaluationExamPattern: '',
    cutoff: '',
    eligibility: '',
    ageLimit: '',
    description: '',
    isPublished: false,
  });

  // Fetch course categories (Main Course Category)
  const { data: categoriesData } = useQuery({
    queryKey: ['course-categories'],
    queryFn: () => institutesApi.getCourseMasterData(),
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);

  // Fetch awarded (Award Category) based on selected course category
  const { data: awardedData } = useQuery({
    queryKey: ['awarded', formData.mainCourseCategoryId],
    queryFn: () => institutesApi.getAwardedData(formData.mainCourseCategoryId || undefined),
    enabled: !!formData.mainCourseCategoryId,
  });

  const awardedList = Array.isArray(awardedData) ? awardedData : (awardedData?.data || []);

  // Fetch specialisations (Specialization Category) based on selected course category
  const { data: specialisationData } = useQuery({
    queryKey: ['specialisations', formData.mainCourseCategoryId],
    queryFn: () => institutesApi.getSpecialisationData(formData.mainCourseCategoryId || undefined),
    enabled: !!formData.mainCourseCategoryId,
  });

  const specialisations = Array.isArray(specialisationData) ? specialisationData : (specialisationData?.data || []);

  // Reset dependent fields when course category changes
  useEffect(() => {
    if (formData.mainCourseCategoryId) {
      setFormData(prev => ({
        ...prev,
        awardCategoryId: '',
        specialisationCategoryId: '',
      }));
    }
  }, [formData.mainCourseCategoryId]);

  // Auto-save functionality (only in create mode)
  const autoSaveKey = `cms-draft-govt-vacancy-${id || 'new'}`;
  const { isSaving, lastSaved, hasDraft, restoreDraft, clearDraft } = useAutoSave({
    key: autoSaveKey,
    data: formData,
    enabled: !isEditMode,
    debounceMs: 2000,
    onRestore: (restoredData) => {
      if (!isEditMode && !formData.nameOfPost && !formData.description) {
        if (restoredData.organisationImagePreview && restoredData.organisationImagePreview.startsWith('data:')) {
          setFormData(restoredData);
        } else {
          setFormData({ ...restoredData, organisationImageFile: null, organisationImagePreview: null });
        }
        showToast('Draft restored from auto-save', 'info');
      }
    },
  });

  // Restore draft on mount if in create mode
  useEffect(() => {
    if (!isEditMode && hasDraft) {
      const restored = restoreDraft();
      if (restored && !formData.nameOfPost && !formData.description) {
        if (window.confirm('A draft was found. Would you like to restore it?')) {
          if (restored.organisationImagePreview && restored.organisationImagePreview.startsWith('data:')) {
            setFormData(restored);
          } else {
            setFormData({ ...restored, organisationImageFile: null, organisationImagePreview: null });
          }
          showToast('Draft restored', 'success');
        } else {
          clearDraft();
        }
      }
    }
  }, []); // Only run on mount

  // Track if data has been loaded to prevent reset after load
  const [dataLoadedKey, setDataLoadedKey] = useState<string>('initial');

  // Fetch existing item if editing
  const { data: existingItem, isLoading: isLoadingItem, error: existingItemError } = useQuery({
    queryKey: ['govt-vacancy', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const item = await cmsApi.getGovtVacancyById(id);
        return item || null;
      } catch (error) {
        console.error('Error fetching govt vacancy:', error);
        return null;
      }
    },
    enabled: isEditMode && !!id,
    staleTime: 0,
  });

  const prevIdRef = useRef<string | undefined>(undefined);

  // Reset form when ID changes
  useEffect(() => {
    if (isEditMode && id && id !== prevIdRef.current) {
      prevIdRef.current = id;
      setDataLoadedKey('initial');
      setFormData({
        contentLanguage: 'English',
        mainCourseCategoryId: '',
        awardCategoryId: '',
        specialisationCategoryId: '',
        examLevel: '',
        examName: '',
        organisationImageUrl: '',
        organisationImageFile: null,
        organisationImagePreview: null,
        nameOfPost: '',
        firstAnnouncementDate: '',
        applicationSubmissionLastDate: '',
        examDate: '',
        examFees: '',
        vacanciesSeat: '',
        evaluationExamPattern: '',
        cutoff: '',
        eligibility: '',
        ageLimit: '',
        description: '',
        isPublished: false,
      });
    } else if (!isEditMode) {
      prevIdRef.current = undefined;
      setDataLoadedKey('initial');
    }
  }, [id, isEditMode]);

  // Update form when existing item loads
  useEffect(() => {
    if (existingItem && isEditMode && !isLoadingItem && typeof existingItem === 'object' && dataLoadedKey === 'initial') {
      console.log('Loading existing item for edit:', existingItem);
      const item = existingItem as any;

      const formDataToSet = {
        contentLanguage: item.contentLanguage || item.language || 'English',
        mainCourseCategoryId: item.mainCourseCategoryId || item.courseCategoryId || '',
        awardCategoryId: item.awardCategoryId || item.awardedId || '',
        specialisationCategoryId: item.specialisationCategoryId || item.specialisationId || '',
        examLevel: item.examLevel || '',
        examName: item.examName || '',
        organisationImageUrl: item.organisationImageUrl || item.organisationImage || item.images?.[0] || '',
        organisationImageFile: null,
        organisationImagePreview: item.organisationImageUrl || item.organisationImage || item.images?.[0] || null,
        nameOfPost: item.nameOfPost || item.postName || item.title || '',
        firstAnnouncementDate: item.firstAnnouncementDate || item.announcementDate || '',
        applicationSubmissionLastDate: item.applicationSubmissionLastDate || item.lastDate || item.applicationLastDate || '',
        examDate: item.examDate || '',
        examFees: item.examFees || '',
        vacanciesSeat: item.vacanciesSeat || item.vacancies || item.seats || '',
        evaluationExamPattern: item.evaluationExamPattern || item.examPattern || '',
        cutoff: item.cutoff || '',
        eligibility: item.eligibility || '',
        ageLimit: item.ageLimit || '',
        description: item.description || '',
        isPublished: item.isPublished || false,
      };

      console.log('Setting form data:', formDataToSet);
      setFormData(formDataToSet);
      setDataLoadedKey(item.id || 'loaded');
    }
  }, [existingItem, isEditMode, isLoadingItem, dataLoadedKey]);

  // Handle image file selection
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          organisationImageFile: file,
          organisationImagePreview: reader.result as string,
          organisationImageUrl: '',
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      organisationImageFile: null,
      organisationImagePreview: null,
      organisationImageUrl: '',
    }));
  };

  // Calculate word count for description
  const getWordCount = (text: string) => {
    if (!text) return 0;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const plainText = doc.body.textContent || doc.body.innerText || '';
      return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
    } catch (error) {
      const plainText = text.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
      return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
  };

  const descriptionWordCount = getWordCount(formData.description);
  const isDescriptionValid = descriptionWordCount > 0;

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const imageUrl = data.organisationImagePreview || data.organisationImageUrl;

      const cleanValue = (value: any) => {
        if (value === '' || value === null) return undefined;
        return value;
      };

      const payload: any = {
        contentLanguage: data.contentLanguage,
        mainCourseCategoryId: cleanValue(data.mainCourseCategoryId),
        awardCategoryId: cleanValue(data.awardCategoryId),
        specialisationCategoryId: cleanValue(data.specialisationCategoryId),
        examLevel: data.examLevel,
        examName: data.examName,
        organisationImage: imageUrl || undefined,
        images: imageUrl ? [imageUrl] : [],
        nameOfPost: data.nameOfPost,
        firstAnnouncementDate: cleanValue(data.firstAnnouncementDate),
        applicationSubmissionLastDate: data.applicationSubmissionLastDate,
        examDate: cleanValue(data.examDate),
        examFees: cleanValue(data.examFees),
        vacanciesSeat: cleanValue(data.vacanciesSeat),
        evaluationExamPattern: cleanValue(data.evaluationExamPattern),
        cutoff: cleanValue(data.cutoff),
        eligibility: cleanValue(data.eligibility),
        ageLimit: cleanValue(data.ageLimit),
        description: data.description,
        isPublished: data.isPublished,
      };

      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      console.log('Creating govt vacancy with payload:', JSON.stringify(payload, null, 2));
      return cmsApi.createGovtVacancy(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['govt-vacancies'] });
      clearDraft();
      showToast('Government vacancy created successfully', 'success');
      navigate('/cms/govt-vacancies');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to create government vacancy';
      showToast(String(errorMessage), 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const imageUrl = data.organisationImagePreview || data.organisationImageUrl;

      const cleanValue = (value: any) => {
        if (value === '' || value === null) return undefined;
        return value;
      };

      const payload: any = {
        contentLanguage: data.contentLanguage,
        mainCourseCategoryId: cleanValue(data.mainCourseCategoryId),
        awardCategoryId: cleanValue(data.awardCategoryId),
        specialisationCategoryId: cleanValue(data.specialisationCategoryId),
        examLevel: data.examLevel,
        examName: data.examName,
        organisationImage: imageUrl || undefined,
        images: imageUrl ? [imageUrl] : [],
        nameOfPost: data.nameOfPost,
        firstAnnouncementDate: cleanValue(data.firstAnnouncementDate),
        applicationSubmissionLastDate: data.applicationSubmissionLastDate,
        examDate: cleanValue(data.examDate),
        examFees: cleanValue(data.examFees),
        vacanciesSeat: cleanValue(data.vacanciesSeat),
        evaluationExamPattern: cleanValue(data.evaluationExamPattern),
        cutoff: cleanValue(data.cutoff),
        eligibility: cleanValue(data.eligibility),
        ageLimit: cleanValue(data.ageLimit),
        description: data.description,
        isPublished: data.isPublished,
      };

      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      return cmsApi.updateGovtVacancy(id!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['govt-vacancies'] });
      queryClient.invalidateQueries({ queryKey: ['govt-vacancy', id] });
      showToast('Government vacancy updated successfully', 'success');
      navigate('/cms/govt-vacancies');
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to update government vacancy';
      showToast(String(errorMessage), 'error');
    },
  });

  const handlePublish = () => {
    if (!formData.nameOfPost.trim()) {
      showToast('Please enter name of post', 'error');
      return;
    }
    if (!formData.description.trim()) {
      showToast('Please enter description', 'error');
      return;
    }
    if (!formData.examLevel) {
      showToast('Please select exam level', 'error');
      return;
    }
    if (!formData.examName.trim()) {
      showToast('Please enter exam name', 'error');
      return;
    }
    if (!formData.applicationSubmissionLastDate) {
      showToast('Please enter application submission last date', 'error');
      return;
    }

    const publishData = { ...formData, isPublished: true };
    if (isEditMode) {
      updateMutation.mutate(publishData);
    } else {
      createMutation.mutate(publishData);
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
    <>
      <style>{`
        .description-editor .ql-editor {
          padding: 0.5rem !important;
          min-height: 60px !important;
        }
        .description-editor .ql-container {
          min-height: 60px !important;
        }
      `}</style>
      <AdminLayout>
        <div className="space-y-6">
          {/* Auto-save indicator */}
          {!isEditMode && (
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving draft...</span>
                  </>
                ) : hasDraft && lastSaved ? (
                  <>
                    <Cloud className="h-4 w-4 text-green-600" />
                    <span>Draft saved {lastSaved.toLocaleTimeString()}</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-4 w-4 text-slate-400" />
                    <span>Auto-save enabled</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/cms/govt-vacancies')}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Government Vacancies
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {isEditMode ? 'Edit Government Vacancy' : 'Create Government Vacancy'}
                </h1>
                <p className="text-slate-600 mt-1">
                  {isEditMode ? 'Update government vacancy details' : 'Add a new government job vacancy'}
                </p>
              </div>
            </div>
            <Button
              onClick={handlePublish}
              disabled={createMutation.isPending || updateMutation.isPending || !isDescriptionValid}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publish Vacancy
                </>
              )}
            </Button>
          </div>

          {/* Main Content - Full Width Form */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Vacancy Details</CardTitle>
                  <CardDescription className="text-slate-600">Enter government vacancy information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              {/* Section 1: Basic Information */}
              <div className="space-y-4 pb-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Content Language *
                    </label>
                    <select
                      value={formData.contentLanguage}
                      onChange={(e) => setFormData({ ...formData, contentLanguage: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Name of Post *</label>
                    <Input
                      placeholder="Enter name of post"
                      value={formData.nameOfPost}
                      onChange={(e) => setFormData({ ...formData, nameOfPost: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Category Dropdowns */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Main Course Category</label>
                    <select
                      value={formData.mainCourseCategoryId}
                      onChange={(e) => setFormData({ ...formData, mainCourseCategoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Award Category</label>
                    <select
                      value={formData.awardCategoryId}
                      onChange={(e) => setFormData({ ...formData, awardCategoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      disabled={!formData.mainCourseCategoryId || awardedList.length === 0}
                    >
                      <option value="">Select Award Category</option>
                      {awardedList.map((awarded: any) => (
                        <option key={awarded.id} value={awarded.id}>
                          {awarded.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Specialization Category</label>
                    <select
                      value={formData.specialisationCategoryId}
                      onChange={(e) => setFormData({ ...formData, specialisationCategoryId: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      disabled={!formData.mainCourseCategoryId || specialisations.length === 0}
                    >
                      <option value="">Select Specialization</option>
                      {specialisations.map((spec: any) => (
                        <option key={spec.id} value={spec.id}>
                          {spec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Exam Level and Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Exam Level *</label>
                    <select
                      value={formData.examLevel}
                      onChange={(e) => setFormData({ ...formData, examLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select Exam Level</option>
                      {EXAM_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Exam Name *</label>
                    <Input
                      placeholder="Enter exam name"
                      value={formData.examName}
                      onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Dates */}
              <div className="space-y-4 pb-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Important Dates
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">1st Announcement Date</label>
                    <Input
                      type="date"
                      value={formData.firstAnnouncementDate}
                      onChange={(e) => setFormData({ ...formData, firstAnnouncementDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Application Submission Last Date *
                    </label>
                    <Input
                      type="date"
                      value={formData.applicationSubmissionLastDate}
                      onChange={(e) => setFormData({ ...formData, applicationSubmissionLastDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Exam Details */}
              <div className="space-y-4 pb-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Exam Details
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Exam Date</label>
                    <Input
                      placeholder="Enter exam date"
                      value={formData.examDate}
                      onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Exam Fees</label>
                    <Input
                      placeholder="Enter exam fees"
                      value={formData.examFees}
                      onChange={(e) => setFormData({ ...formData, examFees: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Vacancies / Seat</label>
                    <Input
                      placeholder="Enter number of vacancies or seats"
                      value={formData.vacanciesSeat}
                      onChange={(e) => setFormData({ ...formData, vacanciesSeat: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Evaluation/Exam Pattern</label>
                    <Input
                      placeholder="Enter evaluation/exam pattern"
                      value={formData.evaluationExamPattern}
                      onChange={(e) => setFormData({ ...formData, evaluationExamPattern: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Cutoff</label>
                  <Input
                    placeholder="Enter cutoff marks/percentage"
                    value={formData.cutoff}
                    onChange={(e) => setFormData({ ...formData, cutoff: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Section 4: Eligibility */}
              <div className="space-y-4 pb-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Eligibility Criteria
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Eligibility</label>
                    <Textarea
                      placeholder="Enter eligibility criteria"
                      value={formData.eligibility}
                      onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Age Limit</label>
                    <Textarea
                      placeholder="Enter age limit criteria"
                      value={formData.ageLimit}
                      onChange={(e) => setFormData({ ...formData, ageLimit: e.target.value })}
                      className="mt-1"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Image and Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  Image and Description
                </h3>

                {/* Image Upload */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Upload Image of the Organisation
                  </label>

                  {formData.organisationImagePreview || formData.organisationImageUrl ? (
                    <div className="mt-2 space-y-3">
                      <div className="relative">
                        <img
                          src={formData.organisationImagePreview || formData.organisationImageUrl}
                          alt="Organisation preview"
                          className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-slate-200 bg-slate-50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('organisation-image-upload')?.click()}
                        className="flex-1"
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <input
                        type="file"
                        id="organisation-image-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label htmlFor="organisation-image-upload">
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50 hover:bg-blue-50/50">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-3 rounded-full bg-blue-100">
                              <ImageIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 mb-1">Click to upload image</p>
                              <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Alternative: Image URL */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <details className="group">
                      <summary className="text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900">
                        Or use image URL instead
                      </summary>
                      <div className="mt-2">
                        <Input
                          placeholder="https://example.com/image.jpg"
                          value={formData.organisationImageUrl}
                          onChange={(e) => {
                            if (e.target.value) {
                              setFormData({
                                ...formData,
                                organisationImageUrl: e.target.value,
                                organisationImageFile: null,
                                organisationImagePreview: null,
                              });
                            }
                          }}
                          className="mt-1"
                          disabled={!!formData.organisationImagePreview}
                        />
                      </div>
                    </details>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Description *</label>
                  <RichTextEditor
                    key={`description-${dataLoadedKey}`}
                    value={formData.description}
                    onChange={(value) => {
                      setFormData({ ...formData, description: value });
                    }}
                    placeholder="Write a detailed description with full formatting options..."
                    minHeight="200px"
                    className="mt-1 description-editor"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className={`text-xs ${isDescriptionValid ? 'text-emerald-600' : 'text-slate-600'}`}>
                      {descriptionWordCount} words
                    </p>
                    {isDescriptionValid && (
                      <span className="text-xs text-emerald-600 font-semibold">✓ Valid</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}
