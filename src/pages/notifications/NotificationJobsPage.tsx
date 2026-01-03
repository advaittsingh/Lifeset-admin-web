import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Bell, Plus, Calendar, Clock, CheckCircle2, XCircle, Loader2, Play, Trash2, Edit, Filter } from 'lucide-react';
import { notificationJobsApi, NotificationJob } from '../../services/api/notification-jobs';
import { useToast } from '../../contexts/ToastContext';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'ACTIVE':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getFrequencyLabel = (frequency: string) => {
  switch (frequency) {
    case 'ONCE':
      return 'Once';
    case 'HOURLY':
      return 'Every Hour';
    case 'DAILY':
      return 'Daily';
    case 'WEEKLY':
      return 'Weekly';
    case 'MONTHLY':
      return 'Monthly';
    default:
      return frequency;
  }
};

export default function NotificationJobsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [messageTypeFilter, setMessageTypeFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<NotificationJob | null>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['notification-jobs', statusFilter, messageTypeFilter],
    queryFn: () => notificationJobsApi.getAll({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      messageType: messageTypeFilter !== 'all' ? messageTypeFilter : undefined,
      limit: 100,
    }),
  });

  const jobs = jobsData?.data || jobsData || [];

  // Filter by search term
  const filteredJobs = jobs.filter((job: NotificationJob) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(searchLower) ||
      job.content.toLowerCase().includes(searchLower) ||
      job.messageType.toLowerCase().includes(searchLower)
    );
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationJobsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-jobs'] });
      showToast('Notification job deleted successfully', 'success');
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    },
    onError: () => {
      showToast('Failed to delete notification job', 'error');
    },
  });

  const executeMutation = useMutation({
    mutationFn: (id: string) => notificationJobsApi.execute(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notification-jobs'] });
      showToast(`Notification sent to ${data.sent || 0} users`, 'success');
    },
    onError: () => {
      showToast('Failed to execute notification job', 'error');
    },
  });

  const stats = {
    total: jobs.length,
    pending: jobs.filter((j: NotificationJob) => j.status === 'PENDING').length,
    active: jobs.filter((j: NotificationJob) => j.status === 'ACTIVE').length,
    completed: jobs.filter((j: NotificationJob) => j.status === 'COMPLETED').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notification Jobs</h1>
            <p className="text-slate-600 mt-1">Schedule and manage notification campaigns</p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => navigate('/notifications/jobs/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Scheduled Notifications</CardTitle>
                <CardDescription>All planned notification campaigns (Latest first)</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <select
                    value={messageTypeFilter}
                    onChange={(e) => setMessageTypeFilter(e.target.value)}
                    className="px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="admin">Admin</option>
                    <option value="content">Content</option>
                    <option value="system">System</option>
                    <option value="birthday">Birthday</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No notification jobs found
                  </div>
                ) : (
                  filteredJobs.map((job: NotificationJob) => (
                    <div
                      key={job.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        job.status === 'COMPLETED' ? 'bg-green-100' :
                        job.status === 'ACTIVE' ? 'bg-blue-100' :
                        job.status === 'PENDING' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <Bell className={`h-5 w-5 ${
                          job.status === 'COMPLETED' ? 'text-green-600' :
                          job.status === 'ACTIVE' ? 'text-blue-600' :
                          job.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{job.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                              {job.status}
                            </span>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                              {job.messageType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {(job.status === 'PENDING' || job.status === 'ACTIVE') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => executeMutation.mutate(job.id)}
                                disabled={executeMutation.isPending}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Execute
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/notifications/jobs/${job.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {job.totalSent === 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setJobToDelete(job);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{job.content}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Scheduled: {new Date(job.scheduledAt).toLocaleString()}
                          </span>
                          {job.nextSendAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Next: {new Date(job.nextSendAt).toLocaleString()}
                            </span>
                          )}
                          <span className="px-2 py-1 rounded bg-slate-100">
                            {getFrequencyLabel(job.frequency)}
                          </span>
                          <span className="px-2 py-1 rounded bg-slate-100">
                            {job.language}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            Sent: {job.totalSent}
                          </span>
                          {job.totalFailed > 0 && (
                            <span className="flex items-center gap-1">
                              <XCircle className="h-3 w-3 text-red-600" />
                              Failed: {job.totalFailed}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Notification Job</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => jobToDelete && deleteMutation.mutate(jobToDelete.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
