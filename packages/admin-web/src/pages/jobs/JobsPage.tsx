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
import { useToast } from '../../contexts/ToastContext';

export default function JobsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['jobs', searchTerm],
    queryFn: () => jobsApi.getAll({
      search: searchTerm || undefined,
    }),
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
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">Failed to load jobs. Please try again.</p>
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
                              {job.company?.companyName || (job.post as any)?.user?.email || 'Company'}
                            </CardDescription>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                              {job.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{job.location}</span>
                                </div>
                              )}
                              {(job.salaryMin || job.salaryMax) && (
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span>
                                    {job.salaryMin && job.salaryMax
                                      ? `$${job.salaryMin}k - $${job.salaryMax}k`
                                      : job.salaryMin
                                      ? `$${job.salaryMin}k+`
                                      : `Up to $${job.salaryMax}k`}
                                  </span>
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
                {selectedJob?.company?.companyName || 'Company'} • {selectedJob?.location || 'Location not specified'}
              </DialogDescription>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                  <p className="text-slate-600 whitespace-pre-wrap">{selectedJob.jobDescription}</p>
                </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Salary Range</h3>
                    <p className="text-slate-600">
                      {selectedJob.salaryMin && selectedJob.salaryMax
                        ? `$${selectedJob.salaryMin}k - $${selectedJob.salaryMax}k`
                        : selectedJob.salaryMin
                        ? `$${selectedJob.salaryMin}k+`
                        : selectedJob.salaryMax
                        ? `Up to $${selectedJob.salaryMax}k`
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Applications</h3>
                    <p className="text-slate-600">{selectedJob.applications || 0} applications</p>
                  </div>
                </div>
              </div>
            )}
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
