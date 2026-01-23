import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, X, Calendar, Clock, Globe, Repeat, Plus, XCircle } from 'lucide-react';
import { notificationJobsApi } from '../../services/api/notification-jobs';
import { usersApi, User } from '../../services/api/users';
import { useToast } from '../../contexts/ToastContext';
import { institutesApi } from '../../services/api/institutes';
import { apiClient } from '../../services/api/client';

export default function CreateNotificationJobPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    notificationType: 'ADMIN', // Backend enum value for notification type
    title: '',
    content: '',
    image: '',
    redirectionLink: '',
    scheduledAt: '',
    scheduledTime: '',
    language: 'ALL' as 'ALL' | 'ENGLISH' | 'HINDI',
    frequency: 'ONCE' as 'ONCE' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY',
    filterConditions: {
      collegeId: '',
      courseId: '',
      stage: '',
      city: '',
      state: '',
    },
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Fetch job data if editing
  const { data: jobData, isLoading: isLoadingJob } = useQuery({
    queryKey: ['notification-job', id],
    queryFn: () => notificationJobsApi.getById(id!),
    enabled: isEditMode && !!id,
  });

  // Fetch colleges and courses for filters
  const { data: collegesData } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => institutesApi.getInstitutes(),
  });

  const colleges = Array.isArray(collegesData) ? collegesData : (collegesData?.data || []);

  // Fetch users for selection
  const { data: usersData } = useQuery({
    queryKey: ['users', userSearchTerm],
    queryFn: () => usersApi.getAll({ search: userSearchTerm, limit: 100 }),
    enabled: !sendToAll,
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
      setFormData(prev => ({
        ...prev,
        image: imageUrl,
      }));
      setImagePreview(imageUrl);
      setImageFile(null);
      showToast('Image uploaded successfully', 'success');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to upload image';
      showToast(errorMessage, 'error');
    },
  });

  // Load job data when editing
  useEffect(() => {
    if (isEditMode && jobData) {
      const job = jobData as any;
      const scheduledDate = new Date(job.scheduledAt);
      setFormData({
        notificationType: (job as any).notificationType || 'ADMIN',
        title: job.title || '',
        content: job.content || '',
        image: job.image || '',
        redirectionLink: job.redirectionLink || '',
        scheduledAt: scheduledDate.toISOString().split('T')[0],
        scheduledTime: scheduledDate.toTimeString().slice(0, 5),
        language: job.language || 'ALL',
        frequency: job.frequency || 'ONCE',
        filterConditions: job.filterConditions || {
          collegeId: '',
          courseId: '',
          stage: '',
          city: '',
          state: '',
        },
      });
      if (job.image) {
        setImagePreview(job.image);
      }
      // Load selected user IDs if available
      if (job.userIds && Array.isArray(job.userIds) && job.userIds.length > 0) {
        setSelectedUserIds(job.userIds);
        setSendToAll(false);
      } else {
        setSendToAll(true);
      }
    }
  }, [isEditMode, jobData]);

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
        setImageFile(file);
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload the file
      imageUploadMutation.mutate(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Validate image URL if provided
      let imageUrl = data.image?.trim() || '';
      if (imageUrl) {
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

      // Combine date and time
      const scheduledDateTime = new Date(`${data.scheduledAt}T${data.scheduledTime}`);
      const scheduledAtISO = scheduledDateTime.toISOString();

      // Validate that at least one targeting method is selected
      const hasUserIds = !sendToAll && selectedUserIds && selectedUserIds.length > 0;
      const hasFilterConditions = Object.keys(data.filterConditions).some(key => 
        data.filterConditions[key] && data.filterConditions[key].toString().trim() !== ''
      );

      if (!sendToAll && !hasUserIds && !hasFilterConditions) {
        throw new Error('Please select at least one targeting method: specific users or filter conditions');
      }

      const payload = {
        messageType: 'admin', // Default value for backend compatibility
        notificationType: data.notificationType || 'ADMIN',
        title: data.title,
        content: data.content,
        image: imageUrl || undefined,
        redirectionLink: data.redirectionLink || undefined,
        scheduledAt: scheduledAtISO,
        language: data.language,
        frequency: data.frequency,
        userIds: hasUserIds ? selectedUserIds : (sendToAll ? undefined : undefined),
        filterConditions: hasFilterConditions
          ? data.filterConditions
          : undefined,
      };

      // Debug logging
      console.log('Creating notification job with payload:', JSON.stringify(payload, null, 2));
      console.log('Send to all:', sendToAll);
      console.log('Selected user IDs:', selectedUserIds);
      console.log('Has user IDs:', hasUserIds);
      console.log('Has filter conditions:', hasFilterConditions);

      return notificationJobsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-jobs'] });
      showToast('Notification job created successfully', 'success');
      navigate('/notifications');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to create notification job';
      showToast(errorMessage, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      // Validate image URL if provided
      let imageUrl = data.image?.trim() || '';
      if (imageUrl) {
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

      // Combine date and time
      const scheduledDateTime = new Date(`${data.scheduledAt}T${data.scheduledTime}`);
      const scheduledAtISO = scheduledDateTime.toISOString();

      // Validate that at least one targeting method is selected
      const hasUserIds = !sendToAll && selectedUserIds && selectedUserIds.length > 0;
      const hasFilterConditions = Object.keys(data.filterConditions).some(key => 
        data.filterConditions[key] && data.filterConditions[key].toString().trim() !== ''
      );

      if (!sendToAll && !hasUserIds && !hasFilterConditions) {
        throw new Error('Please select at least one targeting method: specific users or filter conditions');
      }

      const payload = {
        messageType: 'admin', // Default value for backend compatibility
        notificationType: data.notificationType || 'ADMIN',
        title: data.title,
        content: data.content,
        image: imageUrl || undefined,
        redirectionLink: data.redirectionLink || undefined,
        scheduledAt: scheduledAtISO,
        language: data.language,
        frequency: data.frequency,
        userIds: sendToAll ? null : (hasUserIds ? selectedUserIds : null),
        filterConditions: hasFilterConditions
          ? data.filterConditions
          : undefined,
      };

      // Debug logging
      console.log('Updating notification job with payload:', JSON.stringify(payload, null, 2));
      console.log('Selected user IDs:', selectedUserIds);
      console.log('Has user IDs:', hasUserIds);

      return notificationJobsApi.update(id!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['notification-job', id] });
      showToast('Notification job updated successfully', 'success');
      navigate('/notifications');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to update notification job';
      showToast(errorMessage, 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.scheduledAt || !formData.scheduledTime) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    // Validate user selection if not sending to all
    if (!sendToAll && selectedUserIds.length === 0) {
      showToast('Please select at least one user or check "Send to all users"', 'error');
      return;
    }

    console.log('Submitting form with:', {
      formData,
      sendToAll,
      selectedUserIds,
      selectedUserIdsLength: selectedUserIds.length
    });

    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isEditMode && isLoadingJob) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/notifications')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditMode ? 'Edit Notification Job' : 'Create Notification Job'}
              </h1>
              <p className="text-slate-600 mt-1">Schedule a notification campaign with user filters</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Notification content and settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Notification Type *
                    </label>
                    <select
                      value={formData.notificationType}
                      onChange={(e) => setFormData({ ...formData, notificationType: e.target.value })}
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
                      Title *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Notification title"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Content *
                    </label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Notification message content"
                      rows={6}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Redirection Link (Optional)
                    </label>
                    <Input
                      value={formData.redirectionLink}
                      onChange={(e) => setFormData({ ...formData, redirectionLink: e.target.value })}
                      placeholder="https://example.com/page"
                      type="url"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Users will be redirected to this URL when they tap the notification
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Image (Optional)
                    </label>
                    {imagePreview || formData.image ? (
                      <div className="space-y-2">
                        <div className="relative inline-block">
                          <img
                            src={imagePreview || formData.image || ''}
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
                        {!imagePreview && formData.image && (
                          <Input
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Schedule & Frequency</CardTitle>
                  <CardDescription>When and how often to send</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Date *
                      </label>
                      <Input
                        type="date"
                        value={formData.scheduledAt}
                        onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Time *
                      </label>
                      <Input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Frequency *
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="ONCE">Once</option>
                      <option value="HOURLY">Every Hour</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Language *
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="ALL">All Languages</option>
                      <option value="ENGLISH">English</option>
                      <option value="HINDI">Hindi</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Filter Conditions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Target Users</CardTitle>
                  <CardDescription>
                    Choose how to target users for this notification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sendToAll"
                      checked={sendToAll}
                      onChange={(e) => {
                        setSendToAll(e.target.checked);
                        if (e.target.checked) {
                          setSelectedUserIds([]);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor="sendToAll" className="text-sm font-medium text-slate-700">
                      Send to all users
                    </label>
                  </div>

                  {!sendToAll && (
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
                                checked={selectedUserIds.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUserIds([...selectedUserIds, user.id]);
                                  } else {
                                    setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
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
                      {selectedUserIds.length > 0 && (
                        <p className="text-xs text-slate-500">
                          {selectedUserIds.length} user(s) selected
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Filter Conditions</CardTitle>
                  <CardDescription>
                    Apply filters to target specific users. Filters are applied on the day of the event.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      College (Optional)
                    </label>
                    <select
                      value={formData.filterConditions.collegeId}
                      onChange={(e) => setFormData({
                        ...formData,
                        filterConditions: {
                          ...formData.filterConditions,
                          collegeId: e.target.value,
                        },
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Colleges</option>
                      {colleges.map((college: any) => (
                        <option key={college.id} value={college.id}>
                          {college.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Course (Optional)
                    </label>
                    <Input
                      value={formData.filterConditions.courseId}
                      onChange={(e) => setFormData({
                        ...formData,
                        filterConditions: {
                          ...formData.filterConditions,
                          courseId: e.target.value,
                        },
                      })}
                      placeholder="Course ID"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Stage (Optional)
                    </label>
                    <Input
                      value={formData.filterConditions.stage}
                      onChange={(e) => setFormData({
                        ...formData,
                        filterConditions: {
                          ...formData.filterConditions,
                          stage: e.target.value,
                        },
                      })}
                      placeholder="e.g., FRESHMAN, SOPHOMORE, JUNIOR, SENIOR"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      City (Optional)
                    </label>
                    <Input
                      value={formData.filterConditions.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        filterConditions: {
                          ...formData.filterConditions,
                          city: e.target.value,
                        },
                      })}
                      placeholder="Filter by city"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      State (Optional)
                    </label>
                    <Input
                      value={formData.filterConditions.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        filterConditions: {
                          ...formData.filterConditions,
                          state: e.target.value,
                        },
                      })}
                      placeholder="Filter by state"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/notifications')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Job' : 'Create Job'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
