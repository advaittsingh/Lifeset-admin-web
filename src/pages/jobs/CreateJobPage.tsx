import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Save, Eye, Briefcase, MapPin, DollarSign, Calendar, Users, Loader2, Building2, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../../services/api/jobs';
import { institutesApi } from '../../services/api/institutes';

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

export default function CreateJobPage() {
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
    selectRole: '',
    location: '',
    clientToManage: '',
    workingDays: '',
    yearlySalary: '',
    skills: '',
    function: '',
    experience: '',
    jobType: '',
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
  const { data: existingJob, isLoading: isLoadingJob } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.getById(id!),
    enabled: isEditMode && !!id,
  });

  // Update form when existing job loads
  useEffect(() => {
    if (existingJob && isEditMode) {
      const job = existingJob.data || existingJob;
      const metadata = job.metadata || job.post?.metadata || {};
      setFormData({
        jobTitle: job.jobTitle || job.title || '',
        companyName: metadata.companyName || '',
        industry: metadata.industry || '',
        selectRole: metadata.selectRole || '',
        location: job.location || metadata.location || '',
        clientToManage: metadata.clientToManage || '',
        workingDays: metadata.workingDays || '',
        yearlySalary: metadata.yearlySalary || (job.salaryMin && job.salaryMax ? `${job.salaryMin}-${job.salaryMax}` : ''),
        skills: Array.isArray(job.skills) ? job.skills.join(', ') : (metadata.skills || ''),
        function: metadata.function || '',
        experience: job.experience || metadata.experience || '',
        jobType: metadata.jobType || '',
        capacity: metadata.capacity || '',
        workTime: metadata.workTime || '',
        perksAndBenefits: metadata.perksAndBenefits || '',
        jobDescription: job.jobDescription || job.description || '',
        candidateQualities: metadata.candidateQualities || [],
        isPublished: job.isPublished || false,
        isPublic: metadata.isPublic !== false,
        isPrivate: metadata.isPrivate || false,
        privateFilters: {
          selectCollege: metadata.privateFilters?.selectCollege || '',
          selectCourse: metadata.privateFilters?.selectCourse || '',
          selectCourseCategory: metadata.privateFilters?.selectCourseCategory || '',
          selectYear: metadata.privateFilters?.selectYear || '',
        },
      });
    }
  }, [existingJob, isEditMode]);

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

      return jobsApi.create({
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
        selectRole: data.selectRole || undefined,
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
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      showToast('Job posted successfully', 'success');
      navigate('/jobs');
    },
    onError: () => showToast('Failed to create job', 'error'),
  });

  const updateMutation = useMutation({
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

      // For update, we'll need to update the post metadata as well
      // This assumes the backend can handle metadata updates
      return jobsApi.update(id!, {
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
        location: data.location || undefined,
        salaryMin,
        salaryMax,
        experience: data.experience || undefined,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
        // Include metadata fields - backend should handle these
        metadata: {
          companyName: data.companyName,
          industry: data.industry,
          selectRole: data.selectRole,
          clientToManage: data.clientToManage,
          workingDays: data.workingDays,
          yearlySalary: data.yearlySalary,
          function: data.function,
          jobType: data.jobType,
          capacity: data.capacity,
          workTime: data.workTime,
          perksAndBenefits: data.perksAndBenefits,
          candidateQualities: data.candidateQualities,
          isPublic: data.isPublic,
          isPrivate: data.isPrivate,
          privateFilters: data.isPrivate ? data.privateFilters : undefined,
        },
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      showToast('Job updated successfully', 'success');
      navigate('/jobs');
    },
    onError: () => showToast('Failed to update job', 'error'),
  });

  const handleSubmit = () => {
    if (!formData.jobTitle.trim()) {
      showToast('Please enter a job title', 'error');
      return;
    }
    if (!formData.jobDescription.trim()) {
      showToast('Please enter a job description', 'error');
      return;
    }

    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
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
              onClick={() => navigate('/jobs')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditMode ? 'Edit Job Posting' : 'Create Job Posting'}
              </h1>
              <p className="text-slate-600 mt-1">
                {isEditMode ? 'Update job posting details' : 'Add a new job or internship posting'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
          >
            {(createMutation.isPending || updateMutation.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
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
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Select Role</label>
                  <Input
                    placeholder="e.g., Full-time, Part-time, Intern"
                    value={formData.selectRole}
                    onChange={(e) => setFormData({ ...formData, selectRole: e.target.value })}
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
                  <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
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
                    <option value="">Select Job Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
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
                  className="mt-1 min-h-[150px]"
                  rows={8}
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
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{formData.jobTitle}</h3>
                        {formData.companyName && (
                          <div className="flex items-center gap-2 text-slate-600 mb-2">
                            <Building2 className="h-4 w-4" />
                            <span className="text-sm">{formData.companyName}</span>
                          </div>
                        )}
                        {formData.location && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{formData.location}</span>
                          </div>
                        )}
                      </div>

                      {formData.jobDescription && (
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-2">Description</p>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-6">
                            {formData.jobDescription}
                          </p>
                        </div>
                      )}

                      <div className="grid gap-3 pt-4 border-t border-slate-200">
                        {formData.yearlySalary && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">₹{formData.yearlySalary}</span>
                          </div>
                        )}
                        {formData.experience && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{formData.experience}</span>
                          </div>
                        )}
                        {formData.skills && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-1">Required Skills</p>
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
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
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

                {/* Publish Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmit}
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
                        <Save className="h-4 w-4 mr-2" />
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
