import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Bell, Send, CheckCircle2, Clock, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { notificationsApi, Notification } from '../../services/api/notifications';
import { useToast } from '../../contexts/ToastContext';

export default function NotificationsPage() {
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'SYSTEM',
    sendToAll: false,
    userId: '',
    redirectUrl: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
    imageUrl: '',
    filters: {
      userType: '',
      collegeId: '',
      courseId: '',
      city: '',
      state: '',
      isActive: true,
      isVerified: undefined as boolean | undefined,
      registrationDateFrom: '',
      registrationDateTo: '',
    },
  });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => notificationsApi.getAll({ limit: 50 }),
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
  });

  const notifications = notificationsData?.data || notificationsData || [];

  const sendMutation = useMutation({
    mutationFn: (data: any) => notificationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      showToast('Notification sent successfully', 'success');
      setIsSendDialogOpen(false);
      setFormData({
        title: '',
        message: '',
        type: 'SYSTEM',
        sendToAll: false,
        userId: '',
        redirectUrl: '',
        imageFile: null,
        imagePreview: null,
        imageUrl: '',
        filters: {
          userType: '',
          collegeId: '',
          courseId: '',
          city: '',
          state: '',
          isActive: true,
          isVerified: undefined,
          registrationDateFrom: '',
          registrationDateTo: '',
        },
      });
    },
    onError: () => showToast('Failed to send notification', 'error'),
  });

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
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result as string,
          imageUrl: '',
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
      imageUrl: '',
    }));
  };

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const handleSend = () => {
    const imageUrl = formData.imagePreview || formData.imageUrl;
    sendMutation.mutate({
      title: formData.title,
      message: formData.message,
      type: formData.type,
      sendToAll: formData.sendToAll,
      userId: formData.sendToAll ? undefined : formData.userId,
      redirectUrl: formData.redirectUrl || undefined,
      image: imageUrl || undefined,
      filters: formData.sendToAll ? formData.filters : undefined,
    });
  };

  const stats = {
    total: notifications.length,
    unread: unreadCount?.count || notifications.filter((n: Notification) => !n.isRead).length,
    sentToday: notifications.filter((n: Notification) => {
      const today = new Date();
      const created = new Date(n.createdAt);
      return created.toDateString() === today.toDateString();
    }).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-600 mt-1">Manage system notifications</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => setIsSendDialogOpen(true)}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Notification
          </Button>
        </div>

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
            <CardDescription>Latest system and user notifications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No notifications found
                  </div>
                ) : (
                  notifications.map((notification: Notification) => (
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
                          <span className="px-2 py-1 rounded bg-slate-100">{notification.type}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(notification.createdAt).toLocaleString()}
                          </span>
                          {notification.user && (
                            <span>To: {notification.user.email || notification.user.mobile}</span>
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

        {/* Send Dialog */}
        <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
              <DialogDescription>Send a notification to one or all users</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Notification title"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Message *</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Notification message"
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SYSTEM">System</option>
                  <option value="JOB">Job</option>
                  <option value="CHAT">Chat</option>
                  <option value="EXAM">Exam</option>
                  <option value="CONNECTION">Connection</option>
                </select>
              </div>
              
              {/* Redirection Link */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Redirection Link (Optional)</label>
                <Input
                  value={formData.redirectUrl}
                  onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                  placeholder="https://example.com/page"
                  type="url"
                />
                <p className="text-xs text-slate-500 mt-1">Users will be redirected to this URL when they tap the notification</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Image (Optional)</label>
                {formData.imagePreview ? (
                  <div className="relative">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-slate-200"
                    />
                    <button
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
                {formData.imageUrl && !formData.imagePreview && (
                  <div className="mt-2">
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value, imagePreview: null, imageFile: null })}
                      placeholder="Or enter image URL"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sendToAll}
                    onChange={(e) => setFormData({ ...formData, sendToAll: e.target.checked, userId: '' })}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-700">Send to all users</span>
                </label>
              </div>
              {!formData.sendToAll && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">User ID (optional)</label>
                  <Input
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    placeholder="Leave empty to send to all"
                  />
                </div>
              )}

              {formData.sendToAll && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-slate-900">Filter Users (Optional)</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">User Type</label>
                      <select
                        value={formData.filters.userType}
                        onChange={(e) => setFormData({
                          ...formData,
                          filters: { ...formData.filters, userType: e.target.value },
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Types</option>
                        <option value="STUDENT">Student</option>
                        <option value="COMPANY">Company</option>
                        <option value="COLLEGE">College</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">City</label>
                      <Input
                        value={formData.filters.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          filters: { ...formData.filters, city: e.target.value },
                        })}
                        placeholder="Filter by city"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">State</label>
                      <Input
                        value={formData.filters.state}
                        onChange={(e) => setFormData({
                          ...formData,
                          filters: { ...formData.filters, state: e.target.value },
                        })}
                        placeholder="Filter by state"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Verification Status</label>
                      <select
                        value={formData.filters.isVerified === undefined ? '' : formData.filters.isVerified.toString()}
                        onChange={(e) => setFormData({
                          ...formData,
                          filters: {
                            ...formData.filters,
                            isVerified: e.target.value === '' ? undefined : e.target.value === 'true',
                          },
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All</option>
                        <option value="true">Verified</option>
                        <option value="false">Unverified</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Registration Date From</label>
                      <Input
                        type="date"
                        value={formData.filters.registrationDateFrom}
                        onChange={(e) => setFormData({
                          ...formData,
                          filters: { ...formData.filters, registrationDateFrom: e.target.value },
                        })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Registration Date To</label>
                      <Input
                        type="date"
                        value={formData.filters.registrationDateTo}
                        onChange={(e) => setFormData({
                          ...formData,
                          filters: { ...formData.filters, registrationDateTo: e.target.value },
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleSend}
                disabled={sendMutation.isPending || !formData.title || !formData.message}
              >
                {sendMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
