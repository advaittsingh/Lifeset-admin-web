import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Save, Eye, Briefcase, Loader2, Image as ImageIcon, Calendar, Send, Cloud, CloudOff, Trash2, Copy } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsApi } from '../../services/api/cms';
import { institutesApi } from '../../services/api/institutes';
import { notificationsApi } from '../../services/api/notifications';
import { notificationJobsApi } from '../../services/api/notification-jobs';
import { useAutoSave } from '../../hooks/useAutoSave';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const EXAM_LEVELS = ['8th Pass', '10th', '12th', 'Diploma', 'UG', 'PG', 'Others'];
const LANGUAGES = ['English', 'Hindi'];

export default function CreateGovtVacancyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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
    applicationLink: '',
    isPublished: false,
    sendNotification: false,
    notificationTime: '', // Clock time for notification
    clonedFromId: null as string | null,
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

  // Fetch specialisations (Specialization Category) based on selected award category
  const { data: specialisationData } = useQuery({
    queryKey: ['specialisations', formData.awardCategoryId],
    queryFn: () => institutesApi.getSpecialisationData(formData.awardCategoryId || undefined),
    enabled: !!formData.awardCategoryId,
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

  // Reset specialisation when award category changes
  useEffect(() => {
    if (formData.awardCategoryId) {
      setFormData(prev => ({
        ...prev,
        specialisationCategoryId: '',
      }));
    }
  }, [formData.awardCategoryId]);

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
    if (!isEditMode) {
      // Check for cloned data first
      const cloneKeys = Object.keys(localStorage).filter(key => key.startsWith('govt-vacancy-clone-'));
      if (cloneKeys.length > 0) {
        const latestCloneKey = cloneKeys.sort().reverse()[0];
        const clonedData = JSON.parse(localStorage.getItem(latestCloneKey) || '{}');
        if (clonedData && clonedData.nameOfPost) {
          localStorage.removeItem(latestCloneKey);
          setFormData({
            ...clonedData,
            clonedFromId: null, // Clear clone tracking
            isPublished: false, // Reset published status
            organisationImageFile: null, // Clear file objects
            organisationImagePreview: clonedData.organisationImagePreview || null,
          });
          showToast('Vacancy data loaded. Review and create a new vacancy.', 'info');
          return;
        }
      }
      
      // Check for regular draft
      if (hasDraft) {
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
        applicationLink: '',
        clonedFromId: null,
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
        sendNotification: false,
        notificationTime: '',
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
        applicationLink: item.applicationLink || '',
        isPublished: item.isPublished || false,
        sendNotification: false,
        notificationTime: '',
        clonedFromId: null,
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
        applicationLink: cleanValue(data.applicationLink),
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
        applicationLink: cleanValue(data.applicationLink),
        isPublished: data.isPublished,
      };

      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      return cmsApi.updateGovtVacancy(id!, payload);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['govt-vacancies'] });
      queryClient.invalidateQueries({ queryKey: ['govt-vacancy', id] });
      showToast('Government vacancy updated successfully', 'success');
      
      // Send notification if requested
      if (formData.sendNotification && id) {
        try {
          const imageUrl = formData.organisationImagePreview || formData.organisationImageUrl;
          
          // Strip HTML tags and truncate description for notification body
          const stripHtml = (html: string) => {
            if (!html) return '';
            const tmp = document.createElement('DIV');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
          };
          const plainTextDescription = stripHtml(formData.description || 'Check out updated government vacancy opportunities!');
          const notificationBody = plainTextDescription.length > 200 
            ? plainTextDescription.substring(0, 200) + '...' 
            : plainTextDescription;
          
          // Check if notificationTime is provided for scheduled notification
          if (formData.notificationTime && formData.notificationTime.trim()) {
            // Create scheduled notification job
            const [hours, minutes] = formData.notificationTime.split(':');
            const scheduledDate = new Date();
            scheduledDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
            
            // If the time has passed today, schedule for tomorrow
            if (scheduledDate < new Date()) {
              scheduledDate.setDate(scheduledDate.getDate() + 1);
            }
            
            await notificationJobsApi.create({
              messageType: 'VACANCY',
              title: formData.nameOfPost || 'Updated Government Vacancy',
              content: notificationBody || 'Check out updated government vacancy opportunities!',
              image: imageUrl || undefined,
              redirectionLink: `https://lifeset.app/govt-vacancies/${id}`,
              scheduledAt: scheduledDate.toISOString(),
              language: 'ALL',
              frequency: 'ONCE',
            });
            showToast(`Notification scheduled for ${formData.notificationTime}`, 'success');
          } else {
            // Send immediate notification
            await notificationsApi.send({
              userIds: null, // Broadcast to all users
              notification: {
                title: formData.nameOfPost || 'Updated Government Vacancy',
                body: notificationBody || 'Check out updated government vacancy opportunities!',
              },
              redirectUrl: `https://lifeset.app/govt-vacancies/${id}`,
              imageUrl: imageUrl || undefined,
              data: {
                vacancyId: id,
                type: 'govt-vacancy',
              },
            });
            showToast('Notification sent successfully', 'success');
          }
        } catch (error: any) {
          console.error('Failed to send notification:', error);
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to send notification';
          // Check if it's a "no tokens" error - this is expected if users haven't registered tokens yet
          if (errorMessage.includes('No tokens found') || errorMessage.includes('no tokens')) {
            showToast('Vacancy updated. Note: No users have registered push tokens yet.', 'warning');
          } else {
            showToast(`Vacancy updated but notification failed: ${errorMessage}`, 'error');
          }
        }
      }
      
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

  const deleteMutation = useMutation({
    mutationFn: (vacancyId: string) => cmsApi.deleteGovtVacancy(vacancyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['govt-vacancies'] });
      showToast('Government vacancy deleted successfully', 'success');
      navigate('/cms/govt-vacancies');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete vacancy';
      showToast(String(errorMessage), 'error');
    },
  });

  const handleSave = (publish: boolean = false) => {
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

    const saveData = { ...formData, isPublished: publish };
    if (isEditMode) {
      updateMutation.mutate(saveData);
    } else {
      createMutation.mutate(saveData);
    }
  };

  const handlePublish = () => {
    handleSave(true);
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
            <div className="flex items-center gap-2">
              {isEditMode && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this vacancy? This action cannot be undone.')) {
                        deleteMutation.mutate(id!);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Clone: navigate to create page with cloned data
                      const clonedData = { ...formData, clonedFromId: id };
                      localStorage.setItem(`govt-vacancy-clone-${Date.now()}`, JSON.stringify(clonedData));
                      navigate('/cms/govt-vacancies/create');
                      showToast('Vacancy data copied. Fill in the form to create a new vacancy.', 'info');
                    }}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Clone
                  </Button>
                </>
              )}
              <Button
                onClick={() => {
                  // Save without publishing
                  handleSave(false);
                }}
                disabled={createMutation.isPending || updateMutation.isPending || !isDescriptionValid}
                variant="outline"
                className="border-slate-300"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  // Save and publish
                  handlePublish();
                }}
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
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Main Content - Side by Side */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Side - Form */}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, specialisationCategoryId: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      disabled={!formData.awardCategoryId || specialisations.length === 0}
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
                  <Textarea
                    placeholder="Write a detailed description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 min-h-[200px]"
                    rows={10}
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

                {/* Application Link */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Application Link *</label>
                  <Input
                    type="url"
                    placeholder="https://example.com/apply"
                    value={formData.applicationLink}
                    onChange={(e) => setFormData({ ...formData, applicationLink: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    This link will be used when users click the "Apply" button. Must be a valid URL.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Live Preview */}
          <Card className="border-0 shadow-xl bg-white sticky top-6">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-emerald-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Preview</CardTitle>
                  <CardDescription className="text-slate-600">See how your vacancy will appear</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Preview Container */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-dashed border-slate-300 min-h-[400px] max-h-[80vh] overflow-y-auto">
                  {formData.nameOfPost || formData.description ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 p-6 space-y-4">
                      {/* Organisation Image */}
                      {(formData.organisationImagePreview || formData.organisationImageUrl) && (
                        <div className="w-full">
                          <img
                            src={formData.organisationImagePreview || formData.organisationImageUrl}
                            alt="Organisation"
                            className="w-full h-48 object-cover rounded-lg border-2 border-slate-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Name of Post */}
                      {formData.nameOfPost && (
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-2">{formData.nameOfPost}</h3>
                        </div>
                      )}

                      {/* Basic Information */}
                      <div className="grid grid-cols-2 gap-3">
                        {formData.examLevel && (
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <p className="text-xs text-slate-600 mb-1">Exam Level</p>
                            <p className="text-sm font-semibold text-slate-900">{formData.examLevel}</p>
                          </div>
                        )}
                        {formData.examName && (
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <p className="text-xs text-slate-600 mb-1">Exam Name</p>
                            <p className="text-sm font-semibold text-slate-900">{formData.examName}</p>
                          </div>
                        )}
                        {formData.contentLanguage && (
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <p className="text-xs text-slate-600 mb-1">Language</p>
                            <p className="text-sm font-semibold text-slate-900">{formData.contentLanguage}</p>
                          </div>
                        )}
                        {formData.vacanciesSeat && (
                          <div className="bg-slate-50 p-2 rounded-lg">
                            <p className="text-xs text-slate-600 mb-1">Vacancies / Seats</p>
                            <p className="text-sm font-semibold text-slate-900">{formData.vacanciesSeat}</p>
                          </div>
                        )}
                      </div>

                      {/* Important Dates */}
                      {(formData.firstAnnouncementDate || formData.applicationSubmissionLastDate || formData.examDate) && (
                        <div className="pt-3 border-t border-slate-200">
                          <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Important Dates
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {formData.firstAnnouncementDate && (
                              <div className="bg-blue-50 p-2 rounded-lg">
                                <p className="text-xs text-slate-600 mb-1">1st Announcement Date</p>
                                <p className="text-xs font-semibold text-slate-900">
                                  {new Date(formData.firstAnnouncementDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                            )}
                            {formData.applicationSubmissionLastDate && (
                              <div className="bg-red-50 p-2 rounded-lg">
                                <p className="text-xs text-slate-600 mb-1">Application Submission Last Date</p>
                                <p className="text-xs font-semibold text-slate-900">
                                  {new Date(formData.applicationSubmissionLastDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                            )}
                            {formData.examDate && (
                              <div className="bg-green-50 p-2 rounded-lg">
                                <p className="text-xs text-slate-600 mb-1">Exam Date</p>
                                <p className="text-xs font-semibold text-slate-900">{formData.examDate}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Exam Details */}
                      {(formData.examFees || formData.evaluationExamPattern || formData.cutoff) && (
                        <div className="pt-3 border-t border-slate-200">
                          <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                            Exam Details
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {formData.examFees && (
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <p className="text-xs text-slate-600 mb-1">Exam Fees</p>
                                <p className="text-xs font-semibold text-slate-900">{formData.examFees}</p>
                              </div>
                            )}
                            {formData.evaluationExamPattern && (
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <p className="text-xs text-slate-600 mb-1">Evaluation/Exam Pattern</p>
                                <p className="text-xs font-semibold text-slate-900">{formData.evaluationExamPattern}</p>
                              </div>
                            )}
                            {formData.cutoff && (
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <p className="text-xs text-slate-600 mb-1">Cutoff</p>
                                <p className="text-xs font-semibold text-slate-900">{formData.cutoff}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Eligibility Criteria */}
                      {(formData.eligibility || formData.ageLimit) && (
                        <div className="pt-3 border-t border-slate-200">
                          <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-blue-600" />
                            Eligibility Criteria
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {formData.eligibility && (
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <p className="text-xs text-slate-600 mb-1">Eligibility</p>
                                <p className="text-xs text-slate-900 whitespace-pre-wrap line-clamp-3">{formData.eligibility}</p>
                              </div>
                            )}
                            {formData.ageLimit && (
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <p className="text-xs text-slate-600 mb-1">Age Limit</p>
                                <p className="text-xs text-slate-900 whitespace-pre-wrap line-clamp-3">{formData.ageLimit}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Categories */}
                      {(formData.mainCourseCategoryId || formData.awardCategoryId || formData.specialisationCategoryId) && (
                        <div className="pt-3 border-t border-slate-200">
                          <h4 className="text-sm font-bold text-slate-900 mb-2">Categories</h4>
                          <div className="flex flex-wrap gap-2">
                            {formData.mainCourseCategoryId && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                {categories.find((cat: any) => cat.id === formData.mainCourseCategoryId)?.name || 'Main Category'}
                              </span>
                            )}
                            {formData.awardCategoryId && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                {awardedList.find((award: any) => award.id === formData.awardCategoryId)?.name || 'Award Category'}
                              </span>
                            )}
                            {formData.specialisationCategoryId && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                {specialisations.find((spec: any) => spec.id === formData.specialisationCategoryId)?.name || 'Specialization'}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Description - Limited to 2-3 lines */}
                      {formData.description && (
                        <div className="pt-3 border-t border-slate-200">
                          <h4 className="text-sm font-bold text-slate-900 mb-2">Description</h4>
                          <p className="text-xs text-slate-600 line-clamp-3 whitespace-pre-wrap">
                            {formData.description}
                          </p>
                        </div>
                      )}
                      
                      {/* Application Link */}
                      {formData.applicationLink && (
                        <div className="pt-3 border-t border-slate-200">
                          <h4 className="text-sm font-bold text-slate-900 mb-2">Application Link</h4>
                          <a
                            href={formData.applicationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 underline truncate block"
                          >
                            {formData.applicationLink}
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 font-medium">No vacancy details entered</p>
                        <p className="text-xs text-slate-400 mt-1">Fill in the form to see preview</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Publish Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handlePublish}
                    disabled={createMutation.isPending || updateMutation.isPending || !isDescriptionValid}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Government Vacancy Preview
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Organisation Image */}
              {(formData.organisationImagePreview || formData.organisationImageUrl) && (
                <div className="w-full">
                  <img
                    src={formData.organisationImagePreview || formData.organisationImageUrl}
                    alt="Organisation"
                    className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-slate-200 mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Name of Post */}
              {formData.nameOfPost && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{formData.nameOfPost}</h2>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                {formData.examLevel && (
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Exam Level</p>
                    <p className="text-sm font-semibold text-slate-900">{formData.examLevel}</p>
                  </div>
                )}
                {formData.examName && (
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Exam Name</p>
                    <p className="text-sm font-semibold text-slate-900">{formData.examName}</p>
                  </div>
                )}
                {formData.contentLanguage && (
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Language</p>
                    <p className="text-sm font-semibold text-slate-900">{formData.contentLanguage}</p>
                  </div>
                )}
                {formData.vacanciesSeat && (
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Vacancies / Seats</p>
                    <p className="text-sm font-semibold text-slate-900">{formData.vacanciesSeat}</p>
                  </div>
                )}
              </div>

              {/* Important Dates */}
              {(formData.firstAnnouncementDate || formData.applicationSubmissionLastDate || formData.examDate) && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Important Dates
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.firstAnnouncementDate && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">1st Announcement Date</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {new Date(formData.firstAnnouncementDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                    {formData.applicationSubmissionLastDate && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Application Submission Last Date</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {new Date(formData.applicationSubmissionLastDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    )}
                    {formData.examDate && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Exam Date</p>
                        <p className="text-sm font-semibold text-slate-900">{formData.examDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Exam Details */}
              {(formData.examFees || formData.evaluationExamPattern || formData.cutoff) && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Exam Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.examFees && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Exam Fees</p>
                        <p className="text-sm font-semibold text-slate-900">{formData.examFees}</p>
                      </div>
                    )}
                    {formData.evaluationExamPattern && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Evaluation/Exam Pattern</p>
                        <p className="text-sm font-semibold text-slate-900">{formData.evaluationExamPattern}</p>
                      </div>
                    )}
                    {formData.cutoff && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Cutoff</p>
                        <p className="text-sm font-semibold text-slate-900">{formData.cutoff}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Eligibility Criteria */}
              {(formData.eligibility || formData.ageLimit) && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Eligibility Criteria
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.eligibility && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Eligibility</p>
                        <p className="text-sm text-slate-900 whitespace-pre-wrap">{formData.eligibility}</p>
                      </div>
                    )}
                    {formData.ageLimit && (
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-600 mb-1">Age Limit</p>
                        <p className="text-sm text-slate-900 whitespace-pre-wrap">{formData.ageLimit}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Categories */}
              {(formData.mainCourseCategoryId || formData.awardCategoryId || formData.specialisationCategoryId) && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.mainCourseCategoryId && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {categories.find((cat: any) => cat.id === formData.mainCourseCategoryId)?.name || 'Main Category'}
                      </span>
                    )}
                    {formData.awardCategoryId && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        {awardedList.find((award: any) => award.id === formData.awardCategoryId)?.name || 'Award Category'}
                      </span>
                    )}
                    {formData.specialisationCategoryId && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                        {specialisations.find((spec: any) => spec.id === formData.specialisationCategoryId)?.name || 'Specialization'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {formData.description && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Description</h3>
                  <div
                    className="prose prose-sm max-w-none bg-slate-50 p-4 rounded-lg"
                    dangerouslySetInnerHTML={{ __html: formData.description }}
                  />
                </div>
              )}

              {/* Empty State */}
              {!formData.nameOfPost && !formData.description && (
                <div className="text-center py-8 text-slate-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                  <p>No content to preview. Please fill in the form fields.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </AdminLayout>
    </>
  );
}
