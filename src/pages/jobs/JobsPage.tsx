import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Briefcase, Plus, MapPin, DollarSign, Users, Loader2, Trash2, Edit, Eye } from 'lucide-react';
import { jobsApi, JobPost } from '../../services/api/jobs';
import { postsApi } from '../../services/api/posts';
import { useToast } from '../../contexts/ToastContext';
import { useAuthStore } from '../../store/authStore';

export default function JobsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch jobs from posts API (since jobs are created as posts with postType: 'JOB')
  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['jobs', searchTerm],
    queryFn: async () => {
      try {
        // Use posts API with postType filter since jobs are stored as posts
        const postsResult = await postsApi.getAll({
          postType: 'JOB',
          search: searchTerm || undefined,
        });
        // Transform posts to job format
        const posts = Array.isArray(postsResult) ? postsResult : (postsResult?.data || []);
        return posts.map((post: any) => ({
          id: post.id,
          postId: post.id,
          jobTitle: post.title,
          jobDescription: post.description,
          location: post.metadata?.location,
          salaryMin: post.metadata?.salaryMin,
          salaryMax: post.metadata?.salaryMax,
          experience: post.metadata?.experience,
          skills: post.metadata?.skills || [],
          applicationDeadline: post.metadata?.applicationDeadline,
          views: post.views || 0,
          applications: post.applications || 0,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          post: post, // Include full post object with all metadata
          company: post.user || post.metadata?.companyName ? { companyName: post.metadata.companyName } : null,
        }));
      } catch (err: any) {
        // If 401, it's an auth issue - let it bubble up
        if (err?.response?.status === 401) {
          throw err;
        }
        // For other errors, try the jobs API as fallback
        try {
          const jobsResult = await jobsApi.getAll({
            search: searchTerm || undefined,
          });
          if (jobsResult && (Array.isArray(jobsResult) || jobsResult.data)) {
            return jobsResult;
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
    mutationFn: (id: string) => jobsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      showToast('Job deleted successfully', 'success');
    },
    onError: () => showToast('Failed to delete job', 'error'),
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
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['jobs'] })}
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
            <h1 className="text-3xl font-bold text-slate-900">Job Listings</h1>
            <p className="text-slate-600 mt-1">Manage job postings and applications</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => navigate('/jobs/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Post Job
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Active Jobs</CardTitle>
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
                <CardTitle className="text-lg font-semibold">All Jobs</CardTitle>
                <CardDescription>Search and manage job listings</CardDescription>
              </div>
              <Input
                placeholder="Search jobs..."
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
                    No jobs found
                  </div>
                ) : (
                  jobs.map((job: JobPost) => (
                    <Card key={job.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{job.jobTitle}</CardTitle>
                            <CardDescription className="text-base mb-3">
                              {(job.post as any)?.metadata?.companyName || job.company?.companyName || (job.post as any)?.user?.email || 'Company'}
                              {(job.post as any)?.metadata?.industry && (
                                <span className="text-slate-500"> • {(job.post as any).metadata.industry}</span>
                              )}
                            </CardDescription>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                              {job.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{job.location}</span>
                                </div>
                              )}
                              {(job.post as any)?.metadata?.jobType && (
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-4 w-4" />
                                  <span>{(job.post as any).metadata.jobType}</span>
                                </div>
                              )}
                              {(job.salaryMin || job.salaryMax || (job.post as any)?.metadata?.yearlySalary) && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>
                                    {(job.post as any)?.metadata?.yearlySalary 
                                      ? `₹${(job.post as any).metadata.yearlySalary}`
                                      : job.salaryMin && job.salaryMax
                                      ? `₹${job.salaryMin} - ₹${job.salaryMax}`
                                      : job.salaryMin
                                      ? `₹${job.salaryMin}+`
                                      : `Up to ₹${job.salaryMax}`}
                                  </span>
                                </div>
                              )}
                              {(job.post as any)?.metadata?.experience && (
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  <span>{(job.post as any).metadata.experience}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{job.applications || 0} applications</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 mb-4 line-clamp-2">{job.jobDescription}</p>
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
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/jobs/edit/${job.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this job?')) {
                                deleteMutation.mutate(job.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
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
                {(selectedJob?.post as any)?.metadata?.companyName || selectedJob?.company?.companyName || 'Company'} • {selectedJob?.location || 'Location not specified'}
                {(selectedJob?.post as any)?.metadata?.industry && (
                  <span> • {(selectedJob.post as any).metadata.industry}</span>
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
                  <p className="text-slate-600 whitespace-pre-wrap">{selectedJob.jobDescription}</p>
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
