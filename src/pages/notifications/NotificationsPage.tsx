import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Bell, CheckCircle2, Clock, Loader2, Plus, Calendar, XCircle, Play, Trash2, Edit, Filter } from 'lucide-react';
import { notificationsApi, Notification } from '../../services/api/notifications';
import { notificationJobsApi, NotificationJob } from '../../services/api/notification-jobs';
import { usersApi, User } from '../../services/api/users';
import { useToast } from '../../contexts/ToastContext';
import { apiClient } from '../../services/api/client';

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

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'notifications' | 'jobs'>('notifications');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<NotificationJob | null>(null);
  const [sendNotificationDialogOpen, setSendNotificationDialogOpen] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    body: '',
    redirectUrl: '',
    imageUrl: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
    notificationType: 'ADMIN', // Default to 'ADMIN' (backend enum value)
    sendToAll: true,
    selectedUserIds: [] as string[],
  });

  // Notification types that match backend NotificationType enum
  // Backend enum: ADMIN, CURRENT_AFFAIRS, GENERAL_KNOWLEDGE, MCQ, GOVT_VACANCY, DAILY_DIGEST, KNOW_YOURSELF
  const notificationTypes = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'CURRENT_AFFAIRS', label: 'Current Affairs' },
    { value: 'GENERAL_KNOWLEDGE', label: 'General Knowledge' },
    { value: 'MCQ', label: 'MCQ' },
    { value: 'GOVT_VACANCY', label: 'Government Vacancy' },
    { value: 'DAILY_DIGEST', label: 'Daily Digest' },
    { value: 'KNOW_YOURSELF', label: 'Know Yourself' },
  ];
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch notifications
  const { data: notificationsData, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const result = await notificationsApi.getAll({ limit: 50 });
      console.log('Fetched notifications:', result); // Debug log
      console.log('Notifications array:', Array.isArray(result) ? result : result?.data); // Debug log
      return result;
    },
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
  });

  // Fetch notification jobs
  const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['notification-jobs', statusFilter],
    queryFn: () => notificationJobsApi.getAll({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      limit: 100,
    }),
  });

  const notifications = notificationsData?.data || notificationsData || [];
  const jobs = jobsData?.data || jobsData || [];

  console.log('All notifications:', notifications); // Debug log
  console.log('Number of notifications:', notifications.length); // Debug log

  // Filter to show ONLY CMS notifications (sent from CMS pages)
  // Include ONLY:
  // 1. Content notifications (CA, GK, MCQ, Exam, Job, Govt Vacancy, Daily Digest, Know Yourself)
  // 2. Notifications sent via "Send Notification" button (type: 'admin')
  // Exclude ALL user-to-user notifications (Connection, Chat, Message, etc.)
  const cmsNotifications = notifications.filter((notification: Notification) => {
    const notificationData = (notification as any).data || {};
    
    console.log('Checking notification:', notification.id, {
      title: notification.title,
      type: notification.type,
      dataType: notificationData.type
    }); // Debug log
    
    // Method 1: Check data.type field - these are the CMS content types
    // Support both old format (lowercase with hyphens) and new format (uppercase enum values)
    const cmsContentTypes = [
      // New backend enum values (uppercase with underscores)
      'ADMIN',
      'CURRENT_AFFAIRS',
      'GENERAL_KNOWLEDGE',
      'MCQ',
      'GOVT_VACANCY',
      'DAILY_DIGEST',
      'KNOW_YOURSELF',
      // Old format (lowercase with hyphens) - for backward compatibility
      'current-affair',
      'general-knowledge',
      'govt-vacancy',
      'daily-digest',
      'know-yourself',
      'mcq',
      'admin',
      // Legacy formats
      'exam',
      'job',
    ];
    
    const notificationType = notificationData.type?.toUpperCase() || notificationData.type;
    if (notificationData.type && cmsContentTypes.some(type => 
      type.toUpperCase() === notificationType || notificationData.type === type
    )) {
      console.log('Included - CMS content type:', notificationData.type); // Debug log
      return true;
    }
    
    // Method 2: Check notification.type field for CMS-related patterns
    const cmsTypePatterns = ['ARTICLE', 'CONTENT', 'VACANCY', 'CMS', 'ADMIN', 'EXAM', 'JOB', 'MCQ'];
    if (notification.type && cmsTypePatterns.some(pattern => notification.type.toUpperCase().includes(pattern))) {
      // But exclude connection-related types even if they match patterns
      if (!notification.type.toUpperCase().includes('CONNECTION')) {
        console.log('Included - CMS type pattern:', notification.type); // Debug log
        return true;
      }
    }
    
    // Method 3: Check notification content for CMS content keywords
    const cmsKeywords = [
      'current affair', 
      'general knowledge', 
      'govt vacancy', 
      'government vacancy', 
      'daily digest',
      'know yourself',
      'mcq',
      'exam',
      'job posting',
      'job opportunity'
    ];
    const notificationText = `${notification.title} ${notification.message}`.toLowerCase();
    if (cmsKeywords.some(keyword => notificationText.includes(keyword))) {
      // But exclude connection requests
      if (!notificationText.includes('connection') && !notificationText.includes('connect')) {
        console.log('Included - CMS keyword in content'); // Debug log
        return true;
      }
    }
    
    // Exclude everything else (including connection requests, chat messages, etc.)
    console.log('Excluded - not a CMS notification'); // Debug log
    return false;
  });

  console.log('Filtered CMS notifications:', cmsNotifications.length); // Debug log

  // Filter jobs by search term
  const filteredJobs = jobs.filter((job: NotificationJob) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(searchLower) ||
      job.content.toLowerCase().includes(searchLower)
    );
  });


  const deleteJobMutation = useMutation({
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

  const executeJobMutation = useMutation({
    mutationFn: (id: string) => notificationJobsApi.execute(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notification-jobs'] });
      showToast(`Notification sent to ${data.sent || 0} users`, 'success');
    },
    onError: () => {
      showToast('Failed to execute notification job', 'error');
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  // Fetch users for selection
  const { data: usersData } = useQuery({
    queryKey: ['users', userSearchTerm],
    queryFn: () => usersApi.getAll({ search: userSearchTerm, limit: 100 }),
    enabled: sendNotificationDialogOpen && !notificationForm.sendToAll,
  });

  const users = usersData?.data || [];

  // Upload image mutation
  const imageUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post('/files/upload', formData, {
        headers: {
          // Don't set Content-Type manually - let axios set it with boundary for FormData
        },
      });
      
      const imageUrl = response.data?.data?.url || 
                      response.data?.url || 
                      response.data?.data?.imageUrl ||
                      response.data?.imageUrl;
      
      if (!imageUrl) {
        throw new Error('Failed to get image URL from upload response');
      }
      
      return imageUrl;
    },
    onSuccess: (imageUrl) => {
      setNotificationForm(prev => ({
        ...prev,
        imageUrl,
        imagePreview: imageUrl,
        imageFile: null,
      }));
      showToast('Image uploaded successfully', 'success');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to upload image';
      showToast(errorMessage, 'error');
    },
  });

  // Handle image file selection
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setNotificationForm(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
      
      // Upload the file
      imageUploadMutation.mutate(file);
    }
  };

  const removeImage = () => {
    setNotificationForm(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
      imageUrl: '',
    }));
  };

  const sendNotificationMutation = useMutation({
    mutationFn: (data: typeof notificationForm) => {
      // Validate image URL if provided
      if (data.imageUrl && data.imageUrl.trim()) {
        const imageUrl = data.imageUrl.trim();
        
        // Check if URL is HTTPS
        if (!imageUrl.startsWith('https://')) {
          throw new Error('Image URL must use HTTPS (not HTTP) for push notifications');
        }
        
        // Check if URL has valid file extension
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const hasValidExtension = validExtensions.some(ext => 
          imageUrl.toLowerCase().endsWith(ext)
        );
        
        if (!hasValidExtension) {
          throw new Error('Image URL must have a valid file extension (.jpg, .jpeg, .png, or .gif)');
        }
      }
      
      const payload = {
        userIds: data.sendToAll ? null : data.selectedUserIds,
        notification: {
          title: data.title,
          body: data.body,
        },
        redirectUrl: data.redirectUrl || undefined,
        imageUrl: data.imageUrl?.trim() || undefined,
        data: {
          type: data.notificationType || 'admin',
        },
      };
      
      // Log the payload for debugging
      console.log('Sending notification with payload:', JSON.stringify(payload, null, 2));
      
      return notificationsApi.send(payload);
    },
    onSuccess: (response) => {
      console.log('Notification sent successfully, response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null/undefined');
      
      // Check if the backend returned success: false or no tokens
      if (response?.success === false) {
        const errorMessage = response?.message || 'Failed to send notification';
        // Check if it's a "no tokens" error - show warning instead of error
        if (errorMessage.includes('No tokens found') || errorMessage.includes('no tokens')) {
          showToast('No users have registered push tokens yet. Users need to open the app to register their tokens.', 'warning');
        } else {
          showToast(`Notification failed: ${errorMessage}`, 'error');
        }
        console.error('Backend returned success: false', response);
        return; // Don't close dialog or reset form on failure
      }
      
      // Show more detailed success message if response contains info
      const successMessage = response?.sent 
        ? `Notification sent successfully to ${response.sent} user(s)`
        : response?.message || 'Notification sent successfully';
      
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      showToast(successMessage, 'success');
      setSendNotificationDialogOpen(false);
      setNotificationForm({
        title: '',
        body: '',
        redirectUrl: '',
        imageUrl: '',
        imageFile: null,
        imagePreview: null,
        notificationType: 'ADMIN',
        sendToAll: true,
        selectedUserIds: [],
      });
      setUserSearchTerm('');
    },
    onError: (error: any) => {
      console.error('Failed to send notification - Full error:', error);
      console.error('Error response:', error?.response);
      console.error('Error response data:', error?.response?.data);
      
      const errorMessage = error?.response?.data?.message 
        || error?.response?.data?.error?.message
        || error?.message 
        || 'Failed to send notification';
      // Check if it's a "no tokens" error - show warning instead of error
      if (errorMessage.includes('No tokens found') || errorMessage.includes('no tokens')) {
        showToast('No users have registered push tokens yet. Users need to open the app to register their tokens.', 'warning');
      } else {
        showToast(`Failed to send notification: ${errorMessage}`, 'error');
      }
    },
  });

  // Filter CMS notifications for stats (same logic as cmsNotifications)
  const cmsNotificationsForStats = notifications.filter((notification: Notification) => {
    const notificationData = (notification as any).data || {};
    
    // Only include CMS content types
    // Support both old format (lowercase with hyphens) and new format (uppercase enum values)
    const cmsContentTypes = [
      // New backend enum values (uppercase with underscores)
      'ADMIN',
      'CURRENT_AFFAIRS',
      'GENERAL_KNOWLEDGE',
      'MCQ',
      'GOVT_VACANCY',
      'DAILY_DIGEST',
      'KNOW_YOURSELF',
      // Old format (lowercase with hyphens) - for backward compatibility
      'current-affair',
      'general-knowledge',
      'govt-vacancy',
      'daily-digest',
      'know-yourself',
      'mcq',
      'admin',
      // Legacy formats
      'exam',
      'job',
    ];
    
    const notificationType = notificationData.type?.toUpperCase() || notificationData.type;
    if (notificationData.type && cmsContentTypes.some(type => 
      type.toUpperCase() === notificationType || notificationData.type === type
    )) {
      return true;
    }
    
    const cmsTypePatterns = ['ARTICLE', 'CONTENT', 'VACANCY', 'CMS', 'ADMIN', 'EXAM', 'JOB', 'MCQ'];
    if (notification.type && cmsTypePatterns.some(pattern => notification.type.toUpperCase().includes(pattern))) {
      // Exclude connection-related types
      if (!notification.type.toUpperCase().includes('CONNECTION')) {
        return true;
      }
    }
    
    const cmsKeywords = [
      'current affair', 
      'general knowledge', 
      'govt vacancy', 
      'government vacancy', 
      'daily digest',
      'know yourself',
      'mcq',
      'exam',
      'job posting',
      'job opportunity'
    ];
    const notificationText = `${notification.title} ${notification.message}`.toLowerCase();
    if (cmsKeywords.some(keyword => notificationText.includes(keyword))) {
      // Exclude connection requests
      if (!notificationText.includes('connection') && !notificationText.includes('connect')) {
        return true;
      }
    }
    
    return false;
  });

  const stats = {
    total: cmsNotificationsForStats.length,
    unread: cmsNotificationsForStats.filter((n: Notification) => !n.isRead).length,
    sentToday: cmsNotificationsForStats.filter((n: Notification) => {
      const today = new Date();
      const created = new Date(n.createdAt);
      return created.toDateString() === today.toDateString();
    }).length,
    jobsTotal: jobs.length,
    jobsPending: jobs.filter((j: NotificationJob) => j.status === 'PENDING').length,
    jobsActive: jobs.filter((j: NotificationJob) => j.status === 'ACTIVE').length,
    jobsCompleted: jobs.filter((j: NotificationJob) => j.status === 'COMPLETED').length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-600 mt-1">Manage system notifications and scheduled campaigns</p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'jobs' && (
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => navigate('/notifications/jobs/create')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Job
              </Button>
            )}
            {activeTab === 'notifications' && (
              <>
                <Button
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                  onClick={() => setSendNotificationDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Send Notification
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  onClick={() => navigate('/notifications/jobs/create')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Notification Job
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Recent Notifications
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Scheduled Jobs
            </button>
          </nav>
        </div>

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                  <p className="text-xs text-slate-500 mt-1">All time</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Unread</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.unread}</div>
                  <p className="text-xs text-slate-500 mt-1">Require attention</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Sent Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600">{stats.sentToday}</div>
                  <p className="text-xs text-slate-500 mt-1">Last 24 hours</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Notifications</CardTitle>
                <CardDescription>
                  Latest notifications sent from CMS (Current Affairs, General Knowledge, Govt Vacancies, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingNotifications ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cmsNotifications.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        No CMS notifications found
                      </div>
                    ) : (
                      cmsNotifications.map((notification: Notification) => {
                        // Get CMS type from notification data
                        const notificationData = (notification as any).data || {};
                        const cmsType = notificationData.type || notification.type || '';
                        
                        // Map CMS type to display label
                        const getCmsTypeLabel = (type: string) => {
                          const labels: Record<string, string> = {
                            'current-affair': 'Current Affair',
                            'general-knowledge': 'General Knowledge',
                            'govt-vacancy': 'Government Vacancy',
                            'daily-digest': 'Daily Digest',
                            'know-yourself': 'Know Yourself',
                            'mcq': 'MCQ',
                            'admin': 'Admin Notification',
                          };
                          return labels[type.toLowerCase()] || 'CMS Content';
                        };
                        
                        const cmsTypeLabel = getCmsTypeLabel(cmsType);
                        
                        return (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-4 p-4 rounded-lg border ${
                            notification.isRead ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            notification.isRead ? 'bg-slate-200' : 'bg-blue-200'
                          }`}>
                            <Bell className={`h-5 w-5 ${notification.isRead ? 'text-slate-600' : 'text-blue-600'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsReadMutation.mutate(notification.id)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{notification.message}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                                {cmsTypeLabel}
                              </span>
                              <span className="px-2 py-1 rounded bg-purple-100 text-purple-700">CMS</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(notification.createdAt).toLocaleString()}
                              </span>
                              {notification.user ? (
                                <span>To: {notification.user.email || notification.user.mobile}</span>
                              ) : (
                                <span className="text-emerald-600 font-medium">Broadcast to All Users</span>
                              )}
                            </div>
                          </div>
                        </div>
                        );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.jobsTotal}</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{stats.jobsPending}</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Active</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.jobsActive}</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.jobsCompleted}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Scheduled Notification Jobs</CardTitle>
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
                {isLoadingJobs ? (
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
                              </div>
                              <div className="flex items-center gap-2">
                                {(job.status === 'PENDING' || job.status === 'ACTIVE') && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => executeJobMutation.mutate(job.id)}
                                    disabled={executeJobMutation.isPending}
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
                              {/* Display target audience */}
                              {job.userIds && job.userIds.length > 0 ? (
                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">
                                  {job.userIds.length} User{job.userIds.length !== 1 ? 's' : ''}
                                </span>
                              ) : job.filterConditions && Object.keys(job.filterConditions).some(key => job.filterConditions[key]) ? (
                                <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 font-medium">
                                  Filtered
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded bg-red-100 text-red-700 font-medium">
                                  ALL Users
                                </span>
                              )}
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
          </>
        )}

        {/* Delete Job Confirmation Dialog */}
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
                onClick={() => jobToDelete && deleteJobMutation.mutate(jobToDelete.id)}
                disabled={deleteJobMutation.isPending}
              >
                {deleteJobMutation.isPending ? (
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

        {/* Send Notification Dialog */}
        <Dialog open={sendNotificationDialogOpen} onOpenChange={setSendNotificationDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>
                Send a notification to specific users or broadcast to all users
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Title *
                </label>
                <Input
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  placeholder="Notification title"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Notification Type *
                </label>
                <select
                  value={notificationForm.notificationType}
                  onChange={(e) => setNotificationForm({ ...notificationForm, notificationType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {notificationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Select the type of notification to be displayed in the mobile app notification page
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Message *
                </label>
                <textarea
                  value={notificationForm.body}
                  onChange={(e) => setNotificationForm({ ...notificationForm, body: e.target.value })}
                  placeholder="Notification message"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Redirect URL (Optional)
                </label>
                <Input
                  value={notificationForm.redirectUrl}
                  onChange={(e) => setNotificationForm({ ...notificationForm, redirectUrl: e.target.value })}
                  placeholder="https://example.com/page"
                  type="url"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Image (Optional)
                </label>
                {notificationForm.imagePreview || notificationForm.imageUrl ? (
                  <div className="space-y-2">
                    <div className="relative inline-block">
                      <img
                        src={notificationForm.imagePreview || notificationForm.imageUrl || ''}
                        alt="Preview"
                        className="max-w-full h-48 object-cover rounded-md border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                    {!notificationForm.imagePreview && notificationForm.imageUrl && (
                      <Input
                        value={notificationForm.imageUrl}
                        onChange={(e) => setNotificationForm({ ...notificationForm, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        type="url"
                        className="mt-2"
                      />
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={imageUploadMutation.isPending}
                        className="flex-1"
                      />
                      <span className="text-xs text-slate-500">or</span>
                      <Input
                        value={notificationForm.imageUrl}
                        onChange={(e) => setNotificationForm({ ...notificationForm, imageUrl: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        type="url"
                        className="flex-1"
                      />
                    </div>
                    {imageUploadMutation.isPending && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading image...
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      Upload an image file (max 5MB) or enter an image URL
                    </p>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendToAll"
                  checked={notificationForm.sendToAll}
                  onChange={(e) => setNotificationForm({
                    ...notificationForm,
                    sendToAll: e.target.checked,
                    selectedUserIds: e.target.checked ? [] : notificationForm.selectedUserIds,
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="sendToAll" className="text-sm font-medium text-slate-700">
                  Send to all users
                </label>
              </div>

              {!notificationForm.sendToAll && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block">
                    Select Users *
                  </label>
                  <Input
                    placeholder="Search users by phone number..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="mb-2"
                  />
                  <div className="border border-slate-200 rounded-md max-h-60 overflow-y-auto p-2 space-y-2">
                    {users.length === 0 ? (
                      <div className="text-sm text-slate-500 text-center py-4">No users found</div>
                    ) : (
                      users.map((user: User) => (
                        <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded">
                          <input
                            type="checkbox"
                            id={`user-${user.id}`}
                            checked={notificationForm.selectedUserIds.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNotificationForm({
                                  ...notificationForm,
                                  selectedUserIds: [...notificationForm.selectedUserIds, user.id],
                                });
                              } else {
                                setNotificationForm({
                                  ...notificationForm,
                                  selectedUserIds: notificationForm.selectedUserIds.filter(id => id !== user.id),
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                          <label htmlFor={`user-${user.id}`} className="text-sm text-slate-700 flex-1 cursor-pointer">
                            {user.mobile || user.email || user.id}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  {notificationForm.selectedUserIds.length > 0 && (
                    <p className="text-xs text-slate-500">
                      {notificationForm.selectedUserIds.length} user(s) selected
                    </p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setSendNotificationDialogOpen(false);
                setNotificationForm({
                  title: '',
                  body: '',
                  redirectUrl: '',
                  imageUrl: '',
                  imageFile: null,
                  imagePreview: null,
                  notificationType: 'ADMIN',
                  sendToAll: true,
                  selectedUserIds: [],
                });
                setUserSearchTerm('');
              }}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!notificationForm.title || !notificationForm.body) {
                    showToast('Please fill in title and message', 'error');
                    return;
                  }
                  if (!notificationForm.sendToAll && notificationForm.selectedUserIds.length === 0) {
                    showToast('Please select at least one user or enable "Send to all users"', 'error');
                    return;
                  }
                  sendNotificationMutation.mutate(notificationForm);
                }}
                disabled={sendNotificationMutation.isPending || imageUploadMutation.isPending}
                className="bg-gradient-to-r from-green-600 to-emerald-600"
              >
                {sendNotificationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : imageUploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading Image...
                  </>
                ) : (
                  'Send Notification'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
