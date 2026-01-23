import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Briefcase, Plus, MapPin, DollarSign, Users, Loader2, Trash2, Edit, Eye, Clock, Award, Calendar } from 'lucide-react';
import { internshipsApi } from '../../services/api/internships';
import { JobPost } from '../../services/api/jobs';
import { postsApi } from '../../services/api/posts';
import { useToast } from '../../contexts/ToastContext';
import { useAuthStore } from '../../store/authStore';

// Utility function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const plainText = doc.body.textContent || doc.body.innerText || '';
    return plainText.trim();
  } catch (error) {
    return html.replace(/<[^>]*>/g, '').trim();
  }
};

export default function InternshipsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch internships from posts API (filtered by jobType: INTERNSHIP)
  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['internships', searchTerm],
    queryFn: async () => {
      try {
        // Use posts API with postType and jobType filter
        const postsResult = await postsApi.getAll({
          postType: 'JOB',
          search: searchTerm || undefined,
        });
        // Transform posts to job format and filter by INTERNSHIP
        const posts = Array.isArray(postsResult) ? postsResult : (postsResult?.data || []);
        const internshipPosts = posts.filter((post: any) => {
          const metadata = post.metadata || {};
          const jobType = post.jobType || metadata.jobType;
          return jobType === 'INTERNSHIP' || jobType === 'Internship';
        });
        return internshipPosts.map((post: any) => {
          // Read from top level (new structure) or metadata (backward compatibility)
          const metadata = post.metadata || {};
          return {
          id: post.id,
          postId: post.id,
          jobTitle: post.title,
          jobDescription: post.description,
            location: post.jobLocation || metadata.jobLocation || metadata.location || post.location,
            salaryMin: post.salaryMin || metadata.salaryMin,
            salaryMax: post.salaryMax || metadata.salaryMax,
            experience: post.experience || metadata.experience,
            skills: post.skills || metadata.skills || [],
            applicationDeadline: post.applicationDeadline || metadata.applicationDeadline,
          views: post.views || 0,
          applications: post.applications || 0,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          post: post, // Include full post object with all metadata
            company: post.user || post.companyName || metadata.companyName ? { 
              companyName: post.companyName || metadata.companyName 
            } : null,
          };
        });
      } catch (err: any) {
        // If 401, it's an auth issue - let it bubble up
        if (err?.response?.status === 401) {
          throw err;
        }
        // For other errors, try the internships API as fallback
        try {
          const internshipsResult = await internshipsApi.getAll({
            search: searchTerm || undefined,
          });
          if (internshipsResult && (Array.isArray(internshipsResult) || internshipsResult.data)) {
            return internshipsResult;
          }
        } catch (fallbackErr) {
          // If both fail, throw the original error
          throw err;
        }
        throw err;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const jobs = jobsData?.data || jobsData || [];


  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      console.log('Deleting internship with ID:', id);
      return internshipsApi.delete(id);
    },
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['internships', searchTerm] });
      
      // Snapshot the previous value
      const previousJobs = queryClient.getQueryData(['internships', searchTerm]);
      
      // Optimistically update to remove the internship
      queryClient.setQueryData(['internships', searchTerm], (old: any) => {
        if (!old) return old;
        const jobsArray = Array.isArray(old) ? old : (old.data || []);
        return jobsArray.filter((job: any) => job.id !== deletedId && job.postId !== deletedId);
      });
      
      return { previousJobs };
    },
    onSuccess: (data, deletedId) => {
      console.log('Delete successful, response:', data);
      // Invalidate all internship-related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['internships'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Also remove the specific internship from cache if it exists
      queryClient.removeQueries({ queryKey: ['internship', deletedId] });
      // Force refetch to ensure we have the latest data
      queryClient.refetchQueries({ queryKey: ['internships', searchTerm] });
      showToast('Internship deleted successfully', 'success');
    },
    onError: (error: any, deletedId, context) => {
      console.error('Delete job error:', {
        error,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        deletedId,
      });
      
      // Rollback optimistic update
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs', searchTerm], context.previousJobs);
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Failed to delete internship. Please check the console for details.';
      showToast(errorMessage, 'error');
    },
  });


  if (error) {
    const isAuthError = (error as any)?.response?.status === 401;
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="border-red-200 bg-red-50 max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-red-800 font-medium">
                  {isAuthError 
                    ? 'Authentication failed. Please log in again.' 
                    : 'Failed to load jobs. Please try again.'}
                </p>
                {isAuthError ? (
                  <Button
                    onClick={() => {
                      useAuthStore.getState().logout();
                      navigate('/login');
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Go to Login
                  </Button>
                ) : (
                  <Button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['internships'] })}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Retry
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Internship Listings</h1>
            <p className="text-slate-600 mt-1">Manage internship postings and applications</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => navigate('/internships/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Post Internship
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Active Internships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{jobs.length}</div>
              <p className="text-xs text-slate-500 mt-1">Currently listed</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {jobs.reduce((sum: number, job: JobPost) => sum + (job.applications || 0), 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {jobs.reduce((sum: number, job: JobPost) => sum + (job.views || 0), 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">All Internships</CardTitle>
                <CardDescription>Search and manage internship listings</CardDescription>
              </div>
              <Input
                placeholder="Search internships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid gap-6">
                {jobs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No internships found
                  </div>
                ) : (
                  jobs.map((job: JobPost) => {
                    const post = job.post || {};
                    const metadata = post.metadata || {};
                    const companyName = post.companyName || metadata.companyName || job.company?.companyName || 'Company';
                    const industry = post.industry || metadata.industry;
                    const location = job.location || post.jobLocation || metadata.jobLocation || metadata.location;
                    const jobType = post.jobType || metadata.jobType;
                    const jobFunction = post.jobFunction || metadata.jobFunction;
                    const experience = job.experience || post.experience || metadata.experience;
                    const yearlySalary = metadata.yearlySalary;
                    const salaryMin = job.salaryMin || post.salaryMin || metadata.salaryMin;
                    const salaryMax = job.salaryMax || post.salaryMax || metadata.salaryMax;
                    const capacity = post.capacity || metadata.capacity;
                    const workingDays = post.workingDays || metadata.workingDays;
                    const workTime = post.workTime || metadata.workTime;
                    const clientToManage = post.clientToManage || metadata.clientToManage;
                    const skills = post.skills || metadata.skills || job.skills || [];
                    const perksAndBenefits = post.perksAndBenefits || metadata.perksAndBenefits;
                    const description = job.jobDescription || post.description || '';
                    const descriptionText = stripHtmlTags(description);

                    return (
                      <Card key={job.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2">{job.jobTitle}</CardTitle>
                              <CardDescription className="text-base mb-3">
                                {companyName}
                                {industry && <span className="text-slate-500"> • {industry}</span>}
                              </CardDescription>
                              
                              {/* All Job Fields Grid */}
                              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                                {location && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{location}</span>
                                  </div>
                                )}
                                {jobType && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>{jobType}</span>
                                  </div>
                                )}
                                {jobFunction && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{jobFunction}</span>
                                  </div>
                                )}
                                {experience && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Users className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>{experience}</span>
                                  </div>
                                )}
                                {(yearlySalary || salaryMin || salaryMax) && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <DollarSign className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>
                                      {yearlySalary 
                                        ? `₹${yearlySalary}`
                                        : salaryMin && salaryMax
                                        ? `₹${salaryMin} - ₹${salaryMax}`
                                        : salaryMin
                                        ? `₹${salaryMin}+`
                                        : `Up to ₹${salaryMax}`}
                                    </span>
                                  </div>
                                )}
                                {capacity && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Users className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>{capacity} positions</span>
                                  </div>
                                )}
                                {workingDays && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{workingDays}</span>
                                  </div>
                                )}
                                {workTime && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>{workTime}</span>
                                  </div>
                                )}
                                {clientToManage && (
                                  <div className="flex items-center gap-2 text-slate-600 col-span-2">
                                    <Users className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">Client: {clientToManage}</span>
                                  </div>
                                )}
                                {Array.isArray(skills) && skills.length > 0 && (
                                  <div className="flex items-center gap-2 text-slate-600 col-span-2">
                                    <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <div className="flex flex-wrap gap-1">
                                      {skills.slice(0, 5).map((skill: string, idx: number) => (
                                        <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                          {skill}
                                        </span>
                                      ))}
                                      {skills.length > 5 && <span className="text-xs text-slate-500">+{skills.length - 5} more</span>}
                                    </div>
                                  </div>
                                )}
                                {perksAndBenefits && (
                                  <div className="flex items-start gap-2 text-slate-600 col-span-2">
                                    <Award className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-xs line-clamp-1">{perksAndBenefits}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Description - 2-3 lines */}
                          {descriptionText && (
                            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <p className="text-sm text-slate-700 line-clamp-3">{descriptionText}</p>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>{job.applications || 0} applications</span>
                              <span>{job.views || 0} views</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedJob(job);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/internships/edit/${job.id}`)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this internship?')) {
                                    const jobId = job.postId || job.id;
                                    deleteMutation.mutate(jobId);
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>


        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedJob?.jobTitle}</DialogTitle>
              <DialogDescription>
                {(selectedJob?.post as any)?.metadata?.companyName || selectedJob?.company?.companyName || 'Company'} • {selectedJob?.location || (selectedJob?.post as any)?.metadata?.jobLocation || (selectedJob?.post as any)?.metadata?.location || 'Location not specified'}
                {(selectedJob?.post as any)?.metadata?.industry && (
                  <span> • {(selectedJob?.post as any)?.metadata?.industry}</span>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedJob ? (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  {(selectedJob.post as any)?.metadata?.companyName && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Company Name</h3>
                      <p className="text-slate-600">{(selectedJob.post as any).metadata.companyName}</p>
                    </div>
                  )}
                  {(selectedJob.post as any)?.metadata?.industry && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Industry</h3>
                      <p className="text-slate-600">{(selectedJob.post as any).metadata.industry}</p>
                    </div>
                  )}
                  {(selectedJob.location || (selectedJob.post as any)?.metadata?.jobLocation || (selectedJob.post as any)?.metadata?.location) && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Location</h3>
                      <p className="text-slate-600">{selectedJob.location || (selectedJob.post as any)?.metadata?.jobLocation || (selectedJob.post as any)?.metadata?.location}</p>
                    </div>
                  )}
                  {(selectedJob.post as any)?.metadata?.selectRole && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Role</h3>
                      <p className="text-slate-600">{(selectedJob.post as any).metadata.selectRole}</p>
                    </div>
                  )}
                  {(selectedJob.post as any)?.metadata?.jobType && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Job Type</h3>
                      <p className="text-slate-600">{(selectedJob.post as any).metadata.jobType}</p>
                    </div>
                  )}
                  {(selectedJob.post as any)?.metadata?.function && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Function</h3>
                      <p className="text-slate-600">{(selectedJob.post as any).metadata.function}</p>
                    </div>
                  )}
                  {(selectedJob.post as any)?.metadata?.experience && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Experience</h3>
                      <p className="text-slate-600">{(selectedJob.post as any).metadata.experience}</p>
                    </div>
                  )}
                  {(selectedJob.post as any)?.metadata?.workingDays && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Working Days</h3>
                      <p className="text-slate-600">{(selectedJob.post as any).metadata.workingDays}</p>
                    </div>
                  )}
                  {(selectedJob.post as any)?.metadata?.workTime && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Work Time</h3>
                      <p className="text-slate-600">{(selectedJob.post as any).metadata.workTime}</p>
                    </div>
                  )}
                  {(selectedJob.post as any)?.metadata?.capacity && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Capacity</h3>
                      <p className="text-slate-600">{(selectedJob.post as any).metadata.capacity}</p>
                    </div>
                  )}
                  {(selectedJob.post as any)?.metadata?.clientToManage && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Client to Manage</h3>
                      <p className="text-slate-600">{(selectedJob.post as any).metadata.clientToManage}</p>
                    </div>
                  )}
                </div>

                {/* Salary */}
                {((selectedJob.post as any)?.metadata?.yearlySalary || selectedJob.salaryMin || selectedJob.salaryMax) && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Salary</h3>
                    <p className="text-slate-600">
                      {(selectedJob.post as any)?.metadata?.yearlySalary 
                        ? `₹${(selectedJob.post as any).metadata.yearlySalary}`
                        : selectedJob.salaryMin && selectedJob.salaryMax
                        ? `₹${selectedJob.salaryMin} - ₹${selectedJob.salaryMax}`
                        : selectedJob.salaryMin
                        ? `₹${selectedJob.salaryMin}+`
                        : selectedJob.salaryMax
                        ? `Up to ₹${selectedJob.salaryMax}`
                        : 'Not specified'}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                  <p className="text-slate-600 whitespace-pre-wrap">{stripHtmlTags(selectedJob.jobDescription || '')}</p>
                </div>

                {/* Skills */}
                {selectedJob.skills && selectedJob.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Perks & Benefits */}
                {(selectedJob.post as any)?.metadata?.perksAndBenefits && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Perks & Benefits</h3>
                    <p className="text-slate-600 whitespace-pre-wrap">{(selectedJob.post as any).metadata.perksAndBenefits}</p>
                  </div>
                )}

                {/* Candidate Qualities */}
                {(selectedJob.post as any)?.metadata?.candidateQualities && 
                 Array.isArray((selectedJob.post as any).metadata.candidateQualities) &&
                 (selectedJob.post as any).metadata.candidateQualities.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Candidate Qualities</h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedJob.post as any).metadata.candidateQualities.map((quality: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          {quality}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Publishing Status */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Publishing Status</h3>
                    <p className="text-slate-600">
                      {(selectedJob.post as any)?.metadata?.isPrivate ? 'Private' : 
                       (selectedJob.post as any)?.metadata?.isPublic !== false ? 'Public' : 'Not Published'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Applications</h3>
                    <p className="text-slate-600">{selectedJob.applications || 0} applications</p>
                  </div>
                </div>

                {/* Private Filters */}
                {(selectedJob.post as any)?.metadata?.isPrivate && 
                 (selectedJob.post as any)?.metadata?.privateFilters && (
                  <div className="pt-4 border-t border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-2">Private Filters</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {(selectedJob.post as any).metadata.privateFilters.selectCollege && (
                        <div>
                          <span className="font-medium text-slate-700">College: </span>
                          <span className="text-slate-600">{(selectedJob.post as any).metadata.privateFilters.selectCollege}</span>
                        </div>
                      )}
                      {(selectedJob.post as any).metadata.privateFilters.selectCourse && (
                        <div>
                          <span className="font-medium text-slate-700">Course: </span>
                          <span className="text-slate-600">{(selectedJob.post as any).metadata.privateFilters.selectCourse}</span>
                        </div>
                      )}
                      {(selectedJob.post as any).metadata.privateFilters.selectCourseCategory && (
                        <div>
                          <span className="font-medium text-slate-700">Category: </span>
                          <span className="text-slate-600">{(selectedJob.post as any).metadata.privateFilters.selectCourseCategory}</span>
                        </div>
                      )}
                      {(selectedJob.post as any).metadata.privateFilters.selectYear && (
                        <div>
                          <span className="font-medium text-slate-700">Year: </span>
                          <span className="text-slate-600">Year {(selectedJob.post as any).metadata.privateFilters.selectYear}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
