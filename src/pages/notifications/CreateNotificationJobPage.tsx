import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, X, Calendar, Clock, Globe, Repeat } from 'lucide-react';
import { notificationJobsApi } from '../../services/api/notification-jobs';
import { useToast } from '../../contexts/ToastContext';
import { institutesApi } from '../../services/api/institutes';

export default function CreateNotificationJobPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    messageType: 'admin',
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  // Load job data when editing
  useEffect(() => {
    if (isEditMode && jobData) {
      const job = jobData as any;
      const scheduledDate = new Date(job.scheduledAt);
      setFormData({
        messageType: job.messageType || 'admin',
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
    }
  }, [isEditMode, jobData]);

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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image: '' });
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Upload image if file is selected
      let imageUrl = formData.image;
      if (imageFile) {
        // TODO: Upload image to server and get URL
        // For now, using base64 data URL
        imageUrl = imagePreview || '';
      }

      // Combine date and time
      const scheduledDateTime = new Date(`${data.scheduledAt}T${data.scheduledTime}`);
      const scheduledAtISO = scheduledDateTime.toISOString();

      return notificationJobsApi.create({
        messageType: data.messageType,
        title: data.title,
        content: data.content,
        image: imageUrl || undefined,
        redirectionLink: data.redirectionLink || undefined,
        scheduledAt: scheduledAtISO,
        language: data.language,
        frequency: data.frequency,
        filterConditions: Object.keys(data.filterConditions).some(key => data.filterConditions[key])
          ? data.filterConditions
          : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-jobs'] });
      showToast('Notification job created successfully', 'success');
      navigate('/notifications');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to create notification job', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      // Upload image if file is selected
      let imageUrl = formData.image;
      if (imageFile) {
        // TODO: Upload image to server and get URL
        // For now, using base64 data URL
        imageUrl = imagePreview || '';
      }

      // Combine date and time
      const scheduledDateTime = new Date(`${data.scheduledAt}T${data.scheduledTime}`);
      const scheduledAtISO = scheduledDateTime.toISOString();

      return notificationJobsApi.update(id!, {
        messageType: data.messageType,
        title: data.title,
        content: data.content,
        image: imageUrl || undefined,
        redirectionLink: data.redirectionLink || undefined,
        scheduledAt: scheduledAtISO,
        language: data.language,
        frequency: data.frequency,
        filterConditions: Object.keys(data.filterConditions).some(key => data.filterConditions[key])
          ? data.filterConditions
          : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['notification-job', id] });
      showToast('Notification job updated successfully', 'success');
      navigate('/notifications');
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to update notification job', 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.scheduledAt || !formData.scheduledTime) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

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
                      Message Type *
                    </label>
                    <select
                      value={formData.messageType}
                      onChange={(e) => setFormData({ ...formData, messageType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="admin">Admin</option>
                      <option value="content">Content</option>
                      <option value="system">System</option>
                      <option value="birthday">Birthday</option>
                      <option value="reminder">Reminder</option>
                      <option value="missing_you">Missing You</option>
                      <option value="new_student">New Student</option>
                    </select>
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
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          id="notification-image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <label htmlFor="notification-image-upload">
                          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50 hover:bg-blue-50/50">
                            <div className="flex flex-col items-center gap-2">
                              <ImageIcon className="h-8 w-8 text-slate-400" />
                              <div>
                                <p className="text-sm font-semibold text-slate-900">Click to upload image</p>
                                <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    )}
                    {!imagePreview && (
                      <Input
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="Or enter image URL"
                        className="mt-2"
                      />
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
