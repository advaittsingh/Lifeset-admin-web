import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Save, Eye, Briefcase, MapPin, DollarSign, Calendar, Users, Loader2, Building2, Clock, CheckCircle2, Cloud, CloudOff, FileText, Award, Trash2, Copy, Send } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { freelancerApi } from '../../services/api/freelancer';
import { jobsApi } from '../../services/api/jobs';
import { institutesApi } from '../../services/api/institutes';
import { postsApi } from '../../services/api/posts';
import { useAutoSave } from '../../hooks/useAutoSave';

// Utility function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  try {
    // Use DOMParser to safely parse HTML without executing scripts
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const plainText = doc.body.textContent || doc.body.innerText || '';
    return plainText.trim();
  } catch (error) {
    // Fallback: strip HTML tags using regex if DOMParser fails
    return html.replace(/<[^>]*>/g, '').trim();
  }
};

// Candidate Qualities options
const candidateQualities = [
  { id: 'outgoing', label: 'Outgoing', description: 'Energized by people, Expressive, Practical' },
  { id: 'realistic', label: 'Realistic', description: 'Focus on facts and details, Trust experience over theories, Organized' },
  { id: 'structured', label: 'Structured', description: 'Makes plans, Decisions, Deadlines, Logical, Objective' },
  { id: 'prioritizes_fairness', label: 'Prioritizes fairness', description: 'Relies on analysis, Reflective, Energized by solitude' },
  { id: 'reserved', label: 'Reserved', description: 'Future-oriented, Creative, Imaginative' },
  { id: 'conceptual', label: 'Focus on concepts, patterns, possibilities', description: 'Flexible, Spontaneous, Adaptive' },
  { id: 'open_ended', label: 'Open-ended', description: 'Empathetic, Values harmony, Considers emotions' },
  { id: 'people_impact', label: 'People impact', description: 'Values relationships, Collaborative' },
];

export default function CreateFreelancerPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    // Basic Job Details
    jobTitle: '',
    companyName: '',
    industry: '',
    location: '',
    clientToManage: '',
    workingDays: '',
    yearlySalary: '',
    skills: '',
    function: '',
    experience: '',
    jobType: 'Freelance', // Default to Freelance, but allow Contractual
    capacity: '',
    workTime: '',
    perksAndBenefits: '',
    
    // Description
    jobDescription: '',
    
    // Candidate Qualities (for backend only)
    candidateQualities: [] as string[],
    
    // Publishing
    isPublished: false,
    isPublic: true,
    isPrivate: false,
    // Clone tracking
    clonedFromId: null as string | null,
    privateFilters: {
      selectCollege: '',
      selectCourse: '',
      selectCourseCategory: '',
      selectYear: '',
    },
  });

  // Fetch course categories and colleges for private filters
  const { data: courseCategoriesData } = useQuery({
    queryKey: ['course-categories'],
    queryFn: () => institutesApi.getCourseMasterData(),
  });

  const { data: collegesData } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => institutesApi.getInstitutes(),
  });

  const courseCategoriesList = Array.isArray(courseCategoriesData) ? courseCategoriesData : (courseCategoriesData?.data || []);
  const colleges = Array.isArray(collegesData) ? collegesData : (collegesData?.data || []);

  // Get unique course category names
  const courseCategories: string[] = Array.from(new Set(
    courseCategoriesList.map((cat: any) => cat.name).filter((name: any): name is string => Boolean(name))
  ));

  // Fetch existing job if editing
  // Try posts API first since jobs are stored as posts, fallback to jobs API
  const { data: existingJob, isLoading: isLoadingJob } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      try {
        // First try posts API since jobs are stored as posts
        const postData = await postsApi.getById(id!);
        console.log('Fetched from posts API:', postData);
        return postData;
      } catch (error) {
        console.log('Posts API failed, trying jobs API:', error);
        // Fallback to jobs API
        const jobData = await jobsApi.getById(id!);
        console.log('Fetched from jobs API:', jobData);
        return jobData;
      }
    },
    enabled: isEditMode && !!id,
  });

  // Auto-save functionality (only in create mode, not edit mode)
  const autoSaveKey = `cms-draft-freelancer-${id || 'new'}`;
  const { isSaving, lastSaved, hasDraft, restoreDraft, clearDraft } = useAutoSave({
    key: autoSaveKey,
    data: formData,
    enabled: !isEditMode, // Only auto-save in create mode
    debounceMs: 2000,
    onRestore: (restoredData) => {
      setFormData(restoredData);
    },
  });

  // Update form when existing job loads
  useEffect(() => {
    if (existingJob && isEditMode) {
      console.log('Loading job data for edit:', existingJob);
      
      const job = existingJob.data || existingJob;
      const post = job.post || job; // Post might be the job itself or nested
      const metadata = post.metadata || job.metadata || {};
      
      console.log('Job object:', job);
      console.log('Post object:', post);
      console.log('Metadata object:', metadata);
      
      // Get description from multiple possible sources
      const description = job.jobDescription || job.description || post.description || '';
      
      // Get location from multiple possible sources (backend stores as jobLocation at top level or in metadata)
      const location = post.jobLocation || job.location || metadata.jobLocation || metadata.location || post.location || '';
      
      // Get skills - handle both array and string formats, check top level first
      let skillsValue = '';
      if (Array.isArray(post.skills)) {
        skillsValue = post.skills.join(', ');
      } else if (Array.isArray(job.skills)) {
        skillsValue = job.skills.join(', ');
      } else if (Array.isArray(metadata.skills)) {
        skillsValue = metadata.skills.join(', ');
      } else if (typeof metadata.skills === 'string') {
        skillsValue = metadata.skills;
      } else if (typeof post.skills === 'string') {
        skillsValue = post.skills;
      } else if (typeof job.skills === 'string') {
        skillsValue = job.skills;
      }
      
        // Get jobType - check if it's an enum value and convert back to display format
        // Default to Freelance, but allow Contractual
        let jobTypeValue = 'Freelance';
        const storedJobType = post.jobType || job.jobType || metadata.jobType || '';
        if (storedJobType) {
          // Convert enum back to display format
          const enumToDisplay: Record<string, string> = {
            'FULL_TIME': 'Full-time',
            'PART_TIME': 'Part-time',
            'CONTRACT': 'Contractual', // Map CONTRACT to Contractual for UI
            'INTERNSHIP': 'Internship',
            'FREELANCE': 'Freelance',
          };
          const converted = enumToDisplay[storedJobType] || storedJobType;
          // Use if it's Freelance or Contractual
          if (converted === 'Freelance' || storedJobType === 'FREELANCE') {
            jobTypeValue = 'Freelance';
          } else if (converted === 'Contractual' || storedJobType === 'CONTRACT') {
            jobTypeValue = 'Contractual';
          }
        }
      
      // Helper function to get value from multiple sources
      const getValue = (sources: any[], defaultValue: any = '') => {
        for (const source of sources) {
          if (source !== undefined && source !== null && source !== '') {
            return source;
          }
        }
        return defaultValue;
      };
      
      // Helper function specifically for boolean values
      const getBooleanValue = (sources: any[], defaultValue: boolean = false) => {
        for (const source of sources) {
          if (source !== undefined && source !== null) {
            return Boolean(source);
          }
        }
        return defaultValue;
      };
      
      // Build form data with comprehensive field checking
      const formDataToSet = {
        jobTitle: getValue([job.jobTitle, job.title, post.title, metadata.title], ''),
        companyName: getValue([post.companyName, job.companyName, metadata.companyName], ''),
        industry: getValue([post.industry, job.industry, metadata.industry], ''),
        location: location,
        clientToManage: getValue([post.clientToManage, job.clientToManage, metadata.clientToManage], ''),
        workingDays: getValue([post.workingDays, job.workingDays, metadata.workingDays], ''),
        yearlySalary: getValue([
          post.yearlySalary,
          metadata.yearlySalary,
          (post.salaryMin && post.salaryMax ? `${post.salaryMin}-${post.salaryMax}` : ''),
          (job.salaryMin && job.salaryMax ? `${job.salaryMin}-${job.salaryMax}` : ''),
          (metadata.salaryMin && metadata.salaryMax ? `${metadata.salaryMin}-${metadata.salaryMax}` : ''),
        ], ''),
        skills: skillsValue,
        function: getValue([post.jobFunction, job.jobFunction, metadata.jobFunction, metadata.function, post.function], ''),
        experience: getValue([post.experience, job.experience, metadata.experience], ''),
        jobType: jobTypeValue,
        capacity: getValue([post.capacity, job.capacity, metadata.capacity], ''),
        workTime: getValue([post.workTime, job.workTime, metadata.workTime], ''),
        perksAndBenefits: getValue([post.perksAndBenefits, job.perksAndBenefits, metadata.perksAndBenefits], ''),
        jobDescription: description,
        candidateQualities: Array.isArray(post.candidateQualities) 
          ? post.candidateQualities 
          : (Array.isArray(job.candidateQualities) 
            ? job.candidateQualities 
            : (Array.isArray(metadata.candidateQualities) ? metadata.candidateQualities : [])),
        isPublished: job.isPublished || post.isPublished || false,
        isPublic: getBooleanValue([post.isPublic, job.isPublic, metadata.isPublic], true),
        isPrivate: getBooleanValue([post.isPrivate, job.isPrivate, metadata.isPrivate], false),
        privateFilters: {
          selectCollege: getValue([
            post.privateFiltersCollege,
            job.privateFiltersCollege,
            metadata.privateFiltersCollege,
            metadata.privateFilters?.selectCollege,
            post.privateFilters?.selectCollege,
          ], ''),
          selectCourse: getValue([
            post.privateFiltersCourse,
            job.privateFiltersCourse,
            metadata.privateFiltersCourse,
            metadata.privateFilters?.selectCourse,
            post.privateFilters?.selectCourse,
          ], ''),
          selectCourseCategory: getValue([
            post.privateFiltersCourseCategory,
            job.privateFiltersCourseCategory,
            metadata.privateFiltersCourseCategory,
            metadata.privateFilters?.selectCourseCategory,
            post.privateFilters?.selectCourseCategory,
          ], ''),
          selectYear: getValue([
            post.privateFiltersYear,
            job.privateFiltersYear,
            metadata.privateFiltersYear,
            metadata.privateFilters?.selectYear,
            post.privateFilters?.selectYear,
          ], ''),
        },
        clonedFromId: null,
      };
      
      console.log('Form data to set:', formDataToSet);
      setFormData(formDataToSet);
    }
  }, [existingJob, isEditMode]);

  // Restore draft on mount if in create mode
  useEffect(() => {
    if (!isEditMode) {
      // Check for cloned data first
      const cloneKeys = Object.keys(localStorage).filter(key => key.startsWith('freelancer-clone-'));
      if (cloneKeys.length > 0) {
        const latestCloneKey = cloneKeys.sort().reverse()[0];
        const clonedData = JSON.parse(localStorage.getItem(latestCloneKey) || '{}');
        if (clonedData && clonedData.jobTitle) {
          localStorage.removeItem(latestCloneKey);
          setFormData({
            ...clonedData,
            clonedFromId: null, // Clear clone tracking
            isPublished: false, // Reset published status
          });
          showToast('Freelancer opportunity data loaded. Review and create a new opportunity.', 'info');
          return;
        }
      }
      
      // Check for regular draft
      if (hasDraft) {
        const restored = restoreDraft();
        if (restored && !formData.jobTitle && !formData.jobDescription) {
          // Show restore prompt
          if (window.confirm('A draft was found. Would you like to restore it?')) {
            setFormData(restored);
            showToast('Draft restored', 'success');
          } else {
            clearDraft();
          }
        }
      }
    }
  }, []); // Only run on mount

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      // Parse yearly salary if it's a range
      let salaryMin: number | undefined;
      let salaryMax: number | undefined;
      if (data.yearlySalary) {
        if (data.yearlySalary.includes('-')) {
          const [min, max] = data.yearlySalary.split('-').map(s => parseFloat(s.trim()));
          salaryMin = isNaN(min) ? undefined : min;
          salaryMax = isNaN(max) ? undefined : max;
        } else {
          const salary = parseFloat(data.yearlySalary);
          if (!isNaN(salary)) {
            salaryMin = salary;
            salaryMax = salary;
          }
        }
      }

      return freelancerApi.create({
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
        location: data.location || undefined,
        salaryMin,
        salaryMax,
        experience: data.experience || undefined,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
        applicationDeadline: undefined,
        companyName: data.companyName || undefined,
        industry: data.industry || undefined,
        clientToManage: data.clientToManage || undefined,
        workingDays: data.workingDays || undefined,
        yearlySalary: data.yearlySalary || undefined,
        function: data.function || undefined,
        jobType: data.jobType || undefined,
        capacity: data.capacity || undefined,
        workTime: data.workTime || undefined,
        perksAndBenefits: data.perksAndBenefits || undefined,
        candidateQualities: data.candidateQualities.length > 0 ? data.candidateQualities : undefined,
        isPublic: data.isPublic,
        isPrivate: data.isPrivate,
        privateFilters: data.isPrivate ? data.privateFilters : undefined,
        isPublished: data.isPublished || false,
      });
    },
    onSuccess: () => {
      // Clear draft on successful save
      clearDraft();
      // Invalidate both jobs and posts queries since jobs are stored as posts
      queryClient.invalidateQueries({ queryKey: ['freelancer'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Force refetch to ensure fresh data
      queryClient.refetchQueries({ queryKey: ['freelancer'] });
      showToast('Freelancer opportunity posted successfully', 'success');
      navigate('/freelancer');
    },
    onError: (error: any) => {
      console.error('Create job error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Failed to create job. Please check the console for details.';
      showToast(errorMessage, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Parse yearly salary if it's a range
      let salaryMin: number | undefined;
      let salaryMax: number | undefined;
      if (data.yearlySalary) {
        if (data.yearlySalary.includes('-')) {
          const [min, max] = data.yearlySalary.split('-').map(s => parseFloat(s.trim()));
          salaryMin = isNaN(min) ? undefined : min;
          salaryMax = isNaN(max) ? undefined : max;
        } else {
          const salary = parseFloat(data.yearlySalary);
          if (!isNaN(salary)) {
            salaryMin = salary;
            salaryMax = salary;
          }
        }
      }

      // Jobs are stored as posts, so we need to update the post
      // Get the post ID - it could be the job ID if it's a post ID, or we need to get it from the job
      const job = existingJob?.data || existingJob;
      const postId = job?.postId || job?.post?.id || id!;

      // Build metadata object with all job fields
      // First, get existing metadata to merge with
      const existingMetadata = (job?.post?.metadata || job?.metadata || {}) as any;
      
      // Helper to only include non-empty values
      const addIfNotEmpty = (obj: any, key: string, value: any) => {
        if (value !== undefined && value !== null && value !== '') {
          obj[key] = value;
        }
      };

      // Convert jobType display value to enum format (Freelance or Contractual)
      const mapJobTypeToEnum = (jobType?: string): string => {
        if (!jobType) return 'FREELANCE'; // Default to FREELANCE
        const mapping: Record<string, string> = {
          'Freelance': 'FREELANCE',
          'Contractual': 'CONTRACT', // Map Contractual to CONTRACT enum
        };
        return mapping[jobType] || 'FREELANCE';
      };

      const metadata: any = {
        ...existingMetadata, // Preserve existing metadata fields
      };
      
      // Update metadata fields (only if they have values)
      addIfNotEmpty(metadata, 'companyName', data.companyName);
      addIfNotEmpty(metadata, 'industry', data.industry);
      if (data.location) {
        metadata.jobLocation = data.location; // Use location field, store as jobLocation in metadata
      }
      addIfNotEmpty(metadata, 'clientToManage', data.clientToManage);
      addIfNotEmpty(metadata, 'workingDays', data.workingDays);
      addIfNotEmpty(metadata, 'yearlySalary', data.yearlySalary);
      if (salaryMin !== undefined) metadata.salaryMin = salaryMin;
      if (salaryMax !== undefined) metadata.salaryMax = salaryMax;
      if (data.skills && data.skills.trim()) {
        metadata.skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
      }
      addIfNotEmpty(metadata, 'jobFunction', data.function);
      addIfNotEmpty(metadata, 'experience', data.experience);
      // Convert jobType to enum format before storing
      const jobTypeEnum = mapJobTypeToEnum(data.jobType);
      if (jobTypeEnum) {
        metadata.jobType = jobTypeEnum;
      } else if (data.jobType) {
        // If mapping fails, try to use the value as-is (might already be enum)
        metadata.jobType = data.jobType;
      }
      addIfNotEmpty(metadata, 'capacity', data.capacity);
      addIfNotEmpty(metadata, 'workTime', data.workTime);
      addIfNotEmpty(metadata, 'perksAndBenefits', data.perksAndBenefits);
      if (data.candidateQualities && data.candidateQualities.length > 0) {
        metadata.candidateQualities = data.candidateQualities;
      }
      metadata.isPublic = data.isPublic !== false;
      metadata.isPrivate = data.isPrivate || false;
      metadata.isPublished = data.isPublished || false;
      // Also add isPublished at top level for backend compatibility
      if (data.isPrivate && data.privateFilters) {
        if (data.privateFilters.selectCollege) metadata.privateFiltersCollege = data.privateFilters.selectCollege;
        if (data.privateFilters.selectCourse) metadata.privateFiltersCourse = data.privateFilters.selectCourse;
        if (data.privateFilters.selectCourseCategory) metadata.privateFiltersCourseCategory = data.privateFilters.selectCourseCategory;
        if (data.privateFilters.selectYear) metadata.privateFiltersYear = data.privateFilters.selectYear;
      }

      // Update the post with title, description, metadata, and jobType at top level
      // Send jobType at both top level (for mobile app) and in metadata (for consistency)
      const updatePayload: any = {
        title: data.jobTitle,
        description: data.jobDescription,
        metadata,
      };
      
      // Send jobType at top level (FREELANCE or CONTRACT) - reuse the jobTypeEnum variable
      updatePayload.jobType = jobTypeEnum;
      
      return postsApi.update(postId, updatePayload);
    },
    onSuccess: () => {
      // Clear draft on successful save
      clearDraft();
      // Invalidate both jobs and posts queries since jobs are stored as posts
      queryClient.invalidateQueries({ queryKey: ['freelancer'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['freelancer', id] });
      // Force refetch to ensure fresh data
      queryClient.refetchQueries({ queryKey: ['freelancer'] });
      showToast('Freelancer opportunity updated successfully', 'success');
      navigate('/freelancer');
    },
    onError: (error: any) => {
      console.error('Update job error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Failed to update job. Please check the console for details.';
      showToast(errorMessage, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => jobsApi.delete(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showToast('Job deleted successfully', 'success');
      navigate('/jobs');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete job';
      showToast(errorMessage, 'error');
    },
  });

  const handleSubmit = (publish: boolean = false) => {
    if (!formData.jobTitle.trim()) {
      showToast('Please enter a job title', 'error');
      return;
    }
    if (!formData.jobDescription.trim()) {
      showToast('Please enter a job description', 'error');
      return;
    }

    const dataToSubmit = { ...formData, isPublished: publish };

    if (isEditMode) {
      updateMutation.mutate(dataToSubmit);
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const toggleCandidateQuality = (qualityId: string) => {
    setFormData(prev => ({
      ...prev,
      candidateQualities: prev.candidateQualities.includes(qualityId)
        ? prev.candidateQualities.filter(id => id !== qualityId)
        : [...prev.candidateQualities, qualityId]
    }));
  };

  if (isLoadingJob && isEditMode) {
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
              onClick={() => navigate('/freelancer')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditMode ? 'Edit Freelancer Opportunity' : 'Create Freelancer Opportunity'}
              </h1>
              <p className="text-slate-600 mt-1">
                {isEditMode ? 'Update freelancer opportunity details' : 'Add a new freelancer opportunity posting'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditMode && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this freelancer opportunity? This action cannot be undone.')) {
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
                    localStorage.setItem(`freelancer-clone-${Date.now()}`, JSON.stringify(clonedData));
                    navigate('/freelancer/create');
                    showToast('Freelancer opportunity data copied. Fill in the form to create a new opportunity.', 'info');
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
                handleSubmit(false);
              }}
              disabled={createMutation.isPending || updateMutation.isPending}
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
                handleSubmit(true);
              }}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
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
            {hasDraft && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const restored = restoreDraft();
                    if (restored) {
                      setFormData(restored);
                      showToast('Draft restored successfully', 'success');
                    }
                  }}
                  className="text-xs"
                >
                  <Cloud className="h-3 w-3 mr-1" />
                  Restore Draft
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
                      clearDraft();
                      showToast('Draft deleted', 'info');
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete Draft
                </Button>
              </div>
            )}
          </div>
        )}

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
                  <CardTitle className="text-lg font-bold text-slate-900">Job Details</CardTitle>
                  <CardDescription className="text-slate-600">Enter job posting information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Job Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Job Title *</label>
                  <Input
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Company Name</label>
                  <Input
                    placeholder="Enter company name"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Industry</label>
                  <Input
                    placeholder="e.g., Technology, Finance"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <Input
                    placeholder="e.g., Remote, Mumbai, Bangalore"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Client to Manage</label>
                  <Input
                    placeholder="Enter client name"
                    value={formData.clientToManage}
                    onChange={(e) => setFormData({ ...formData, clientToManage: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Working Days
                  </label>
                  <Input
                    placeholder="e.g., Monday-Friday"
                    value={formData.workingDays}
                    onChange={(e) => setFormData({ ...formData, workingDays: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Yearly Salary
                  </label>
                  <Input
                    placeholder="e.g., 500000 or 500000-800000"
                    value={formData.yearlySalary}
                    onChange={(e) => setFormData({ ...formData, yearlySalary: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Skills</label>
                  <Input
                    placeholder="e.g., React, Node.js, TypeScript"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">Separate multiple skills with commas</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Function</label>
                  <Input
                    placeholder="e.g., Engineering, Sales, Marketing"
                    value={formData.function}
                    onChange={(e) => setFormData({ ...formData, function: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Experience</label>
                  <Input
                    placeholder="e.g., 2-5 years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Job Type</label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white mt-1"
                  >
                    <option value="Freelance">Freelance</option>
                    <option value="Contractual">Contractual</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Select Freelance or Contractual</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Capacity</label>
                  <Input
                    placeholder="e.g., 5 positions"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Work Time
                  </label>
                  <Input
                    placeholder="e.g., 9 AM - 6 PM"
                    value={formData.workTime}
                    onChange={(e) => setFormData({ ...formData, workTime: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Perks & Benefits</label>
                  <Textarea
                    placeholder="e.g., Health insurance, Flexible hours, Remote work"
                    value={formData.perksAndBenefits}
                    onChange={(e) => setFormData({ ...formData, perksAndBenefits: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>

              {/* Candidate Qualities Section */}
              <div className="pt-4 border-t border-slate-200">
                <label className="text-sm font-semibold text-slate-700 mb-3 block">
                  Select Qualities looking in candidates (For Backend only)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {candidateQualities.map((quality) => (
                    <div
                      key={quality.id}
                      onClick={() => toggleCandidateQuality(quality.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.candidateQualities.includes(quality.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                          formData.candidateQualities.includes(quality.id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-slate-300'
                        }`}>
                          {formData.candidateQualities.includes(quality.id) && (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{quality.label}</p>
                          <p className="text-xs text-slate-500 mt-1">{quality.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Selected: {formData.candidateQualities.length} quality/qualities
                </p>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-slate-200">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Description *</label>
                <Textarea
                  placeholder="Describe the job role, responsibilities, and requirements..."
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="mt-1 min-h-[200px]"
                  rows={10}
                />
              </div>

              {/* Publishing Controls */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={(e) => {
                        const isPublic = e.target.checked;
                        setFormData(prev => ({
                          ...prev,
                          isPublic,
                          isPrivate: !isPublic && prev.isPrivate ? false : prev.isPrivate,
                        }));
                      }}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="isPublic" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Public
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={formData.isPrivate}
                      onChange={(e) => {
                        const isPrivate = e.target.checked;
                        setFormData(prev => ({
                          ...prev,
                          isPrivate,
                          isPublic: isPrivate ? false : prev.isPublic,
                        }));
                      }}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor="isPrivate" className="text-sm font-medium text-slate-700 cursor-pointer">
                      Private
                    </label>
                  </div>
                </div>

                {/* Private Filters */}
                {formData.isPrivate && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Filter for Private</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Select College</label>
                        <select
                          value={formData.privateFilters.selectCollege}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            privateFilters: { ...prev.privateFilters, selectCollege: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select College</option>
                          {colleges.map((college: any) => (
                            <option key={college.id} value={college.id}>
                              {college.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Select Course</label>
                        <Input
                          placeholder="Enter course name or ID"
                          value={formData.privateFilters.selectCourse}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            privateFilters: { ...prev.privateFilters, selectCourse: e.target.value }
                          }))}
                          className="w-full"
                        />
                        <p className="text-xs text-slate-500 mt-1">Enter course name or ID</p>
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Select Courses Main Category</label>
                        <select
                          value={formData.privateFilters.selectCourseCategory}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            privateFilters: { ...prev.privateFilters, selectCourseCategory: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select Category</option>
                          {courseCategories.map((category: string) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Select Year</label>
                        <select
                          value={formData.privateFilters.selectYear}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            privateFilters: { ...prev.privateFilters, selectYear: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select Year</option>
                          <option value="1">Year 1</option>
                          <option value="2">Year 2</option>
                          <option value="3">Year 3</option>
                          <option value="4">Year 4</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
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
                  <CardDescription className="text-slate-600">See how your job posting will appear</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Preview Container */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-dashed border-slate-300 min-h-[400px]">
                  {formData.jobTitle ? (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 p-6 space-y-4">
                      {/* Job Title */}
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">{formData.jobTitle}</h3>
                        
                        {/* Company Name */}
                        {formData.companyName && (
                          <div className="flex items-center gap-2 text-slate-600 mb-2">
                            <Building2 className="h-4 w-4" />
                            <span className="text-sm font-medium">{formData.companyName}</span>
                          </div>
                        )}
                        
                        {/* Location */}
                        {formData.location && (
                          <div className="flex items-center gap-2 text-slate-600 mb-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{formData.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Job Details Grid */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                        {/* Industry */}
                        {formData.industry && (
                          <div className="flex items-start gap-2">
                            <Briefcase className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-slate-500">Industry</p>
                              <p className="text-sm text-slate-700">{formData.industry}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Job Type */}
                        {formData.jobType && (
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-slate-500">Job Type</p>
                              <p className="text-sm text-slate-700">{formData.jobType}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Function */}
                        {formData.function && (
                          <div className="flex items-start gap-2">
                            <Briefcase className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-slate-500">Function</p>
                              <p className="text-sm text-slate-700">{formData.function}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Experience */}
                        {formData.experience && (
                          <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-slate-500">Experience</p>
                              <p className="text-sm text-slate-700">{formData.experience}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Yearly Salary */}
                        {formData.yearlySalary && (
                          <div className="flex items-start gap-2">
                            <DollarSign className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-slate-500">Salary</p>
                              <p className="text-sm text-slate-700">₹{formData.yearlySalary}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Capacity */}
                        {formData.capacity && (
                          <div className="flex items-start gap-2">
                            <Users className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-slate-500">Capacity</p>
                              <p className="text-sm text-slate-700">{formData.capacity}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Working Days */}
                        {formData.workingDays && (
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-slate-500">Working Days</p>
                              <p className="text-sm text-slate-700">{formData.workingDays}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Work Time */}
                        {formData.workTime && (
                          <div className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-slate-500">Work Time</p>
                              <p className="text-sm text-slate-700">{formData.workTime}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Client to Manage */}
                        {formData.clientToManage && (
                          <div className="flex items-start gap-2 col-span-2">
                            <Users className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-slate-500">Client to Manage</p>
                              <p className="text-sm text-slate-700">{formData.clientToManage}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      {formData.skills && (
                        <div className="pt-3 border-t border-slate-200">
                          <p className="text-xs font-semibold text-slate-500 mb-2">Required Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.skills.split(',').map((skill, idx) => (
                              skill.trim() && (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                                >
                                  {skill.trim()}
                                </span>
                              )
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Perks & Benefits */}
                      {formData.perksAndBenefits && (
                        <div className="pt-3 border-t border-slate-200">
                          <p className="text-xs font-semibold text-slate-500 mb-2">Perks & Benefits</p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{formData.perksAndBenefits}</p>
                        </div>
                      )}

                      {/* Description - Limited to 2-3 lines */}
                      {formData.jobDescription && (
                        <div className="pt-3 border-t border-slate-200">
                          <p className="text-xs font-semibold text-slate-500 mb-2">Description</p>
                          <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-wrap">
                            {formData.jobDescription}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-slate-200 flex gap-3">
                        <Button variant="outline" className="flex-1 border-slate-300 hover:bg-slate-50">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 font-medium">No job details entered</p>
                        <p className="text-xs text-slate-400 mt-1">Fill in the form to see preview</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons in Preview */}
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    variant="outline"
                    className="border-slate-300"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
