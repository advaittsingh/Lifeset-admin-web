import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Save, 
  Upload, 
  X, 
  Plus, 
  GripVertical,
  Loader2,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  BarChart3,
  ArrowUpDown,
  ArrowRight,
  UserCheck,
  Percent,
  Calendar,
  Mail,
  Phone,
  Gift,
} from 'lucide-react';
import { referralApi } from '../../services/api/referral';
import { appConfigApi } from '../../services/api/app-config';
import { useToast } from '../../contexts/ToastContext';
import { apiClient } from '../../services/api/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CarouselItem {
  id?: string;
  type: 'image' | 'topPerformer';
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  redirectLink?: string;
  order?: number;
}

export default function ReferralManagementPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const [carouselItems, setCarouselItems] = useState<CarouselItem[]>([]);

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['referral-analytics'],
    queryFn: () => referralApi.getAnalytics(),
  });

  // Fetch carousel configuration
  const { data: carouselConfig, isLoading: carouselLoading } = useQuery({
    queryKey: ['referral-carousel'],
    queryFn: () => appConfigApi.getReferralCarousel(),
  });

  useEffect(() => {
    if (carouselConfig) {
      setCarouselItems(carouselConfig.items || []);
    }
  }, [carouselConfig]);

  const updateMutation = useMutation({
    mutationFn: (data: { items: CarouselItem[] }) => appConfigApi.updateReferralCarousel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-carousel'] });
      showToast('Carousel configuration saved successfully', 'success');
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Failed to save carousel configuration',
        'error',
      );
    },
  });

  const handleImageUpload = async (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await apiClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl = uploadResponse.data.data?.url || uploadResponse.data.url;

      if (!imageUrl) {
        throw new Error('Failed to get image URL from upload response');
      }

      const updatedItems = [...carouselItems];
      updatedItems[index] = {
        ...updatedItems[index],
        imageUrl,
        type: 'image',
      };
      setCarouselItems(updatedItems);
      showToast('Image uploaded successfully', 'success');
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Failed to upload image',
        'error',
      );
    }
  };

  const addCarouselItem = () => {
    const newItem: CarouselItem = {
      id: `item-${Date.now()}`,
      type: 'image',
      title: '',
      subtitle: '',
      imageUrl: '',
      redirectLink: '',
      order: carouselItems.length,
    };
    setCarouselItems([...carouselItems, newItem]);
  };

  const removeCarouselItem = (index: number) => {
    const updatedItems = carouselItems.filter((_, i) => i !== index);
    setCarouselItems(updatedItems);
  };

  const handleSave = () => {
    updateMutation.mutate({ items: carouselItems });
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserDisplayName = (user: any) => {
    if (user?.studentProfile?.firstName && user?.studentProfile?.lastName) {
      return `${user.studentProfile.firstName} ${user.studentProfile.lastName}`;
    }
    return user?.email?.split('@')[0] || user?.mobile || 'Unknown User';
  };

  if (analyticsLoading || carouselLoading) {
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
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Referral Management</h1>
          <p className="text-slate-600 mt-1">
            Comprehensive referral program analytics and carousel configuration
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {analytics?.totalReferrals || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {analytics?.completedReferrals || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {analytics?.pendingReferrals || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Unique Referrers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {analytics?.uniqueReferrers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Percent className="h-4 w-4 text-blue-600" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {analytics?.conversionRate?.toFixed(1) || '0.0'}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users with Referral Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {analytics?.totalUsersWithReferralCodes || 0}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Total users who have generated referral codes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referrals Chart */}
        {analytics?.referralsByDate && analytics.referralsByDate.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Referrals Over Time (Last 30 Days)</CardTitle>
              <CardDescription>Daily referral activity trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.referralsByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <Tooltip labelFormatter={formatDate} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Referrals"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Top Referrers */}
        {analytics?.topReferrers && analytics.topReferrers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
              <CardDescription>Users with the most successful referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topReferrers.map((referrer: any, index: number) => (
                  <div
                    key={referrer.userId}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {getUserDisplayName(referrer.user)}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          {referrer.user?.email && (
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <Mail className="h-3 w-3" />
                              {referrer.user.email}
                            </div>
                          )}
                          {referrer.user?.mobile && (
                            <div className="flex items-center gap-1 text-sm text-slate-500">
                              <Phone className="h-3 w-3" />
                              {referrer.user.mobile}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600 text-xl">
                        {referrer.referralCount}
                      </p>
                      <p className="text-xs text-slate-500">referrals</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Referrals */}
        {analytics?.recentReferrals && analytics.recentReferrals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
              <CardDescription>Latest referral activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentReferrals.map((referral: any) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {getUserDisplayName(referral.referrer)?.charAt(0) || 'R'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {getUserDisplayName(referral.referrer)}
                            </p>
                            <p className="text-xs text-slate-500">Referrer</p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                        {referral.referred ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-sm">
                              {getUserDisplayName(referral.referred)?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">
                                {getUserDisplayName(referral.referred)}
                              </p>
                              <p className="text-xs text-slate-500">Referred User</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold text-sm">
                              P
                            </div>
                            <div>
                              <p className="font-semibold text-amber-600 text-sm">
                                Pending
                              </p>
                              <p className="text-xs text-slate-500">Awaiting signup</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(referral.createdAt)}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          referral.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {referral.status}
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          Code: {referral.referralCode}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Carousel Management Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Carousel Configuration</h2>
              <p className="text-slate-600 mt-1">
                Add images and configure redirection links for the referral carousel in the mobile app
              </p>
            </div>
            <Button onClick={addCarouselItem} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Carousel Items</CardTitle>
              <CardDescription>
                Configure images and links for the referral carousel. Items will be displayed in order with auto-swipe functionality.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {carouselItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                  <p>No carousel items. Click "Add Item" to create one.</p>
                </div>
              ) : (
                carouselItems.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="border border-slate-200 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">
                          Item {index + 1}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCarouselItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Image
                        </label>
                        {item.imageUrl ? (
                          <div className="relative">
                            <img
                              src={item.imageUrl}
                              alt={`Carousel item ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-slate-300"
                            />
                            <input
                              type="file"
                              id={`carousel-image-${index}`}
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(index, file);
                              }}
                              className="hidden"
                            />
                            <div className="mt-2 flex gap-2">
                              <label htmlFor={`carousel-image-${index}`}>
                                <Button type="button" variant="outline" size="sm" asChild>
                                  <span>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Change
                                  </span>
                                </Button>
                              </label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const updated = [...carouselItems];
                                  updated[index] = { ...updated[index], imageUrl: '' };
                                  setCarouselItems(updated);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              id={`carousel-image-${index}`}
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(index, file);
                              }}
                              className="hidden"
                            />
                            <label htmlFor={`carousel-image-${index}`}>
                              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                                <p className="text-sm text-slate-600">Click to upload image</p>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Title (Optional)
                          </label>
                          <Input
                            value={item.title || ''}
                            onChange={(e) => {
                              const updated = [...carouselItems];
                              updated[index] = { ...updated[index], title: e.target.value };
                              setCarouselItems(updated);
                            }}
                            placeholder="Enter title"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Subtitle (Optional)
                          </label>
                          <Input
                            value={item.subtitle || ''}
                            onChange={(e) => {
                              const updated = [...carouselItems];
                              updated[index] = { ...updated[index], subtitle: e.target.value };
                              setCarouselItems(updated);
                            }}
                            placeholder="Enter subtitle"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Redirect Link (Optional)
                          </label>
                          <Input
                            value={item.redirectLink || ''}
                            onChange={(e) => {
                              const updated = [...carouselItems];
                              updated[index] = { ...updated[index], redirectLink: e.target.value };
                              setCarouselItems(updated);
                            }}
                            placeholder="e.g., lifeset://referral or https://..."
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Deep link or URL where users should be redirected when clicking this item in the app
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4 mt-6">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
