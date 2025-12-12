import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Save, Eye, Calendar, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsApi } from '../../services/api/cms';

export default function CreateDailyDigestPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

  // Fetch existing item if editing
  const { data: existingItem, isLoading: isLoadingItem } = useQuery({
    queryKey: ['daily-digest', id],
    queryFn: async () => {
      const digests = await cmsApi.getDailyDigests({});
      return Array.isArray(digests) ? digests.find((item: any) => item.id === id) : null;
    },
    enabled: isEditMode && !!id,
  });

  // Update form when existing item loads
  useEffect(() => {
    if (existingItem && isEditMode) {
      setFormData({
        title: existingItem.title || '',
        description: existingItem.description || '',
        date: existingItem.date ? new Date(existingItem.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        imageUrl: existingItem.imageUrl || '',
        imageFile: null,
        imagePreview: existingItem.imageUrl || null,
      });
    }
  }, [existingItem, isEditMode]);

  // Handle image file selection
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

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => cmsApi.createDailyDigest({
      title: data.title,
      description: data.description,
      date: data.date,
      imageUrl: data.imagePreview || data.imageUrl,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-digests'] });
      showToast('Daily digest created successfully', 'success');
      navigate('/cms/daily-digest');
    },
    onError: () => showToast('Failed to create daily digest', 'error'),
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      showToast('Please enter a title', 'error');
      return;
    }
    if (!formData.description.trim()) {
      showToast('Please enter a description', 'error');
      return;
    }
    if (!formData.date) {
      showToast('Please select a date', 'error');
      return;
    }

    createMutation.mutate(formData);
  };

  if (isLoadingItem && isEditMode) {
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
              onClick={() => navigate('/cms/daily-digest')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Daily Digest
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditMode ? 'Edit Daily Digest' : 'Create Daily Digest'}
              </h1>
              <p className="text-slate-600 mt-1">
                {isEditMode ? 'Update daily digest details' : 'Add a new daily digest'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Digest
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
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Digest Details</CardTitle>
                  <CardDescription className="text-slate-600">Enter daily digest information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Date */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Title *</label>
                <Input
                  placeholder="Enter digest title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Description *</label>
                <Textarea
                  placeholder="Write the daily digest content..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 min-h-[200px]"
                  rows={10}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Digest Image
                </label>
                
                {formData.imagePreview || formData.imageUrl ? (
                  <div className="mt-2 space-y-3">
                    <div className="relative">
                      <img
                        src={formData.imagePreview || formData.imageUrl}
                        alt="Digest preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-slate-200 bg-slate-50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      className="flex-1"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label htmlFor="image-upload">
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50 hover:bg-blue-50/50">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-3 rounded-full bg-blue-100">
                            <ImageIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 mb-1">Click to upload image</p>
                            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                )}

                {/* Alternative: Image URL */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <details className="group">
                    <summary className="text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900">
                      Or use image URL instead
                    </summary>
                    <div className="mt-2">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={formData.imageUrl}
                        onChange={(e) => {
                          if (e.target.value) {
                            setFormData({ 
                              ...formData, 
                              imageUrl: e.target.value,
                              imageFile: null,
                              imagePreview: null,
                            });
                          }
                        }}
                        className="mt-1"
                        disabled={!!formData.imagePreview}
                      />
                    </div>
                  </details>
                </div>
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
                  <CardDescription className="text-slate-600">See how your digest will appear</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Preview Container */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-dashed border-slate-300">
                  <div className="text-center mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Daily Digest Preview
                    </p>
                    <div className="w-full h-px bg-slate-200 mb-4"></div>
                  </div>

                  {/* Digest Preview Card */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                    {(formData.imagePreview || formData.imageUrl) && (
                      <div className="w-full h-48 bg-slate-100 overflow-hidden">
                        <img
                          src={formData.imagePreview || formData.imageUrl}
                          alt="Digest"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                        <Calendar className="h-3 w-3" />
                        <span>{formData.date ? new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Select date'}</span>
                      </div>
                      {formData.title ? (
                        <h3 className="text-xl font-bold text-slate-900">{formData.title}</h3>
                      ) : (
                        <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
                      )}
                      {formData.description ? (
                        <p className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap">
                          {formData.description}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-slate-200 rounded animate-pulse w-5/6"></div>
                          <div className="h-4 bg-slate-200 rounded animate-pulse w-4/6"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preview Info */}
                  <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>Preview Note:</strong> This is how the daily digest will appear to users on the platform.
                    </p>
                  </div>
                </div>

                {/* Preview Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Date Status</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      formData.date
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {formData.date ? '✓ Date Set' : '⚠ Required'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Title Status</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      formData.title
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {formData.title ? '✓ Title Set' : '⚠ Required'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Content Status</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      formData.description
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {formData.description ? '✓ Content Set' : '⚠ Required'}
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





















