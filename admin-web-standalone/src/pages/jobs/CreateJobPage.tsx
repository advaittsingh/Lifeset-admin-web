import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Save, Eye, Briefcase, MapPin, DollarSign, Calendar, Users, Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsApi } from '../../services/api/jobs';

export default function CreateJobPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    experience: '',
    skills: '',
    applicationDeadline: '',
  });

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
      setFormData({
        jobTitle: job.jobTitle || job.title || '',
        jobDescription: job.jobDescription || job.description || '',
        location: job.location || '',
        salaryMin: job.salaryMin?.toString() || '',
        salaryMax: job.salaryMax?.toString() || '',
        experience: job.experience || '',
        skills: Array.isArray(job.skills) ? job.skills.join(', ') : '',
        applicationDeadline: job.applicationDeadline || '',
      });
    }
  }, [existingJob, isEditMode]);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => jobsApi.create({
      jobTitle: data.jobTitle,
      jobDescription: data.jobDescription,
      location: data.location || undefined,
      salaryMin: data.salaryMin ? parseFloat(data.salaryMin) : undefined,
      salaryMax: data.salaryMax ? parseFloat(data.salaryMax) : undefined,
      experience: data.experience || undefined,
      skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
      applicationDeadline: data.applicationDeadline || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      showToast('Job posted successfully', 'success');
      navigate('/jobs');
    },
    onError: () => showToast('Failed to create job', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => jobsApi.update(id!, {
      jobTitle: data.jobTitle,
      jobDescription: data.jobDescription,
      location: data.location || undefined,
      salaryMin: data.salaryMin ? parseFloat(data.salaryMin) : undefined,
      salaryMax: data.salaryMax ? parseFloat(data.salaryMax) : undefined,
      experience: data.experience || undefined,
      skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
      applicationDeadline: data.applicationDeadline || undefined,
    }),
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
                {isEditMode ? 'Update job posting details' : 'Add a new job posting to the platform'}
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
                {isEditMode ? 'Update Job' : 'Create Job'}
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
              {/* Job Title */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Job Title *
                </label>
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Job Description */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Job Description *</label>
                <Textarea
                  placeholder="Describe the job role, responsibilities, and requirements..."
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  className="mt-1 min-h-[120px]"
                  rows={6}
                />
              </div>

              {/* Location */}
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

              {/* Salary Range */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Min Salary
                  </label>
                  <Input
                    type="number"
                    placeholder="50000"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Max Salary</label>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Experience Required</label>
                <Input
                  placeholder="e.g., 2-5 years"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Skills (comma-separated)</label>
                <Input
                  placeholder="e.g., React, Node.js, TypeScript"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Separate multiple skills with commas</p>
              </div>

              {/* Application Deadline */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Application Deadline
                </label>
                <Input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                  className="mt-1"
                />
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
                  <CardTitle className="text-lg font-bold text-slate-900">Live Preview</CardTitle>
                  <CardDescription className="text-slate-600">See how your job posting will appear</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Preview Container */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-dashed border-slate-300">
                  <div className="text-center mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Job Posting Preview
                    </p>
                    <div className="w-full h-px bg-slate-200 mb-4"></div>
                  </div>

                  {/* Job Preview Card */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 p-6 space-y-4">
                    {formData.jobTitle ? (
                      <>
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-2">{formData.jobTitle}</h3>
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
                          {formData.salaryMin && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                {formData.salaryMin && formData.salaryMax
                                  ? `₹${parseInt(formData.salaryMin).toLocaleString()} - ₹${parseInt(formData.salaryMax).toLocaleString()}`
                                  : formData.salaryMin
                                  ? `₹${parseInt(formData.salaryMin).toLocaleString()}+`
                                  : 'Salary not specified'}
                              </span>
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

                          {formData.applicationDeadline && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-600">
                                Deadline: {new Date(formData.applicationDeadline).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-slate-200">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            Apply Now
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 font-medium">No job details entered</p>
                        <p className="text-xs text-slate-400 mt-1">Fill in the form to see preview</p>
                      </div>
                    )}
                  </div>

                  {/* Preview Info */}
                  <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>Preview Note:</strong> This is how the job posting will appear to users. They can click "Apply Now" to submit their application.
                    </p>
                  </div>
                </div>

                {/* Preview Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Title Status</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      formData.jobTitle
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {formData.jobTitle ? '✓ Title Set' : '⚠ Required'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Description Status</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      formData.jobDescription
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {formData.jobDescription ? '✓ Description Set' : '⚠ Required'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Additional Info</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      formData.location || formData.skills || formData.salaryMin
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {formData.location || formData.skills || formData.salaryMin ? '✓ Added' : '○ Optional'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

