import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Save, Eye, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type SponsorAdFormData = {
  sponsorBacklink: string;
  sponsorAdImage: string;
  sponsorAdImageFile: File | null;
  imagePreview: string | null;
  status: 'active' | 'inactive';
};

export default function CreateSponsorAdPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<SponsorAdFormData>({
    sponsorBacklink: '',
    sponsorAdImage: '',
    sponsorAdImageFile: null as File | null,
    imagePreview: null as string | null,
    status: 'active' as 'active' | 'inactive',
  });

  // Fetch existing ad if editing
  const { data: existingAd, isLoading: isLoadingAd } = useQuery({
    queryKey: ['sponsor-ad', id],
    queryFn: async () => {
      // This would be an actual API call
      return {
        id: id,
        sponsorBacklink: 'https://wa.me/918630654336?text=Hello%20LifeSet!',
        sponsorAdImage: 'https://via.placeholder.com/300x300?text=Ad+Image',
        status: 'active' as const,
      };
    },
    enabled: isEditMode && !!id,
  });

  // Update form when existing ad loads
  useEffect(() => {
    if (existingAd && isEditMode) {
      setFormData({
        sponsorBacklink: existingAd.sponsorBacklink || '',
        sponsorAdImage: existingAd.sponsorAdImage || '',
        sponsorAdImageFile: null,
        imagePreview: existingAd.sponsorAdImage || null,
        status: existingAd.status || 'active',
      });
    }
  }, [existingAd, isEditMode]);

  // Handle image file selection
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          sponsorAdImageFile: file,
          imagePreview: reader.result as string,
          sponsorAdImage: '', // Clear URL if file is uploaded
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      sponsorAdImageFile: null,
      imagePreview: null,
      sponsorAdImage: '',
    }));
  };

  const createMutation = useMutation({
    mutationFn: async (data: SponsorAdFormData) => {
      // This would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-ads'] });
      showToast('Sponsor ad created successfully', 'success');
      navigate('/sponsor-ads');
    },
    onError: () => showToast('Failed to create sponsor ad', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SponsorAdFormData) => {
      // This would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-ads'] });
      queryClient.invalidateQueries({ queryKey: ['sponsor-ad', id] });
      showToast('Sponsor ad updated successfully', 'success');
      navigate('/sponsor-ads');
    },
    onError: () => showToast('Failed to update sponsor ad', 'error'),
  });

  const handleSubmit = () => {
    if (!formData.sponsorBacklink.trim()) {
      showToast('Please enter a sponsor backlink', 'error');
      return;
    }
    if (!formData.imagePreview && !formData.sponsorAdImage.trim()) {
      showToast('Please upload an ad image', 'error');
      return;
    }

    // Prepare form data for submission
    const submitData: SponsorAdFormData = {
      sponsorBacklink: formData.sponsorBacklink,
      sponsorAdImage: formData.imagePreview || formData.sponsorAdImage, // Use preview if file uploaded, else URL
      sponsorAdImageFile: formData.sponsorAdImageFile,
      imagePreview: formData.imagePreview,
      status: formData.status,
    };

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (isLoadingAd && isEditMode) {
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
              onClick={() => navigate('/sponsor-ads')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sponsor Ads
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditMode ? 'Edit Sponsor Ad' : 'Create Sponsor Ad'}
              </h1>
              <p className="text-slate-600 mt-1">
                {isEditMode ? 'Update sponsor advertisement details' : 'Add a new sponsor advertisement to the community wall'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold shadow-lg"
          >
            {(createMutation.isPending || updateMutation.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Ad' : 'Create Ad'}
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
                  <ImageIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Ad Details</CardTitle>
                  <CardDescription className="text-slate-600">Enter sponsor advertisement information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Sponsor Backlink */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Sponsor Backlink
                </label>
                <Input
                  placeholder="https://example.com or https://wa.me/1234567890"
                  value={formData.sponsorBacklink}
                  onChange={(e) => setFormData({ ...formData, sponsorBacklink: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-2">
                  The URL users will be redirected to when clicking the ad. Can be a website, WhatsApp link, or form.
                </p>
              </div>

              {/* Ad Image Upload */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Ad Image
                </label>
                
                {formData.imagePreview || formData.sponsorAdImage ? (
                  <div className="mt-2 space-y-3">
                    <div className="relative">
                      <img
                        src={formData.imagePreview || formData.sponsorAdImage}
                        alt="Ad preview"
                        className="w-full max-w-md h-64 object-contain rounded-lg border-2 border-slate-200 bg-slate-50"
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
                    <div className="flex items-center gap-2">
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
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50 hover:bg-blue-50/50">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-3 rounded-full bg-blue-100">
                            <ImageIcon className="h-8 w-8 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 mb-1">
                              Click to upload image
                            </p>
                            <p className="text-xs text-slate-500">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById('image-upload')?.click();
                            }}
                          >
                            Select Image
                          </Button>
                        </div>
                      </div>
                    </label>
                  </div>
                )}
                
                {/* Alternative: Image URL option */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <details className="group">
                    <summary className="text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900">
                      Or use image URL instead
                    </summary>
                    <div className="mt-2">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={formData.sponsorAdImage}
                        onChange={(e) => {
                          if (e.target.value) {
                            setFormData({ 
                              ...formData, 
                              sponsorAdImage: e.target.value,
                              sponsorAdImageFile: null,
                              imagePreview: null,
                            });
                          }
                        }}
                        className="mt-1"
                        disabled={!!formData.imagePreview}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Enter image URL if you prefer not to upload a file
                      </p>
                    </div>
                  </details>
                </div>
                
                <p className="text-xs text-slate-500 mt-2">
                  Recommended size: 300x300px or larger. Max file size: 5MB.
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="active">Active - Ad will be visible on the wall</option>
                  <option value="inactive">Inactive - Ad will be hidden</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Active ads will be displayed on the community wall. Inactive ads are saved but not shown.
                </p>
              </div>

              {/* Image Upload Helper */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-sm font-semibold text-blue-900 mb-2">💡 Image Tips</p>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>Use high-quality images (300x300px minimum)</li>
                  <li>Ensure text is readable and clear</li>
                  <li>Test the image URL to make sure it loads correctly</li>
                  <li>Consider adding a QR code for easy access</li>
                </ul>
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
                  <CardDescription className="text-slate-600">See how your ad will appear on the wall</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Preview Container */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-dashed border-slate-300">
                  <div className="text-center mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Community Wall Preview
                    </p>
                    <div className="w-full h-px bg-slate-200 mb-4"></div>
                  </div>

                  {/* Ad Preview Card */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow">
                    {formData.imagePreview || formData.sponsorAdImage ? (
                      <div className="relative group cursor-pointer">
                        <div className="w-full aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                          <img
                            src={formData.imagePreview || formData.sponsorAdImage}
                            alt="Sponsor Ad Preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const errorDiv = target.nextElementSibling as HTMLElement;
                              if (errorDiv) {
                                errorDiv.style.display = 'flex';
                              }
                            }}
                          />
                          <div className="hidden absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <div className="text-center p-4">
                              <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                              <p className="text-sm text-slate-500 font-medium">Invalid Image</p>
                              <p className="text-xs text-slate-400 mt-1">Please check the image</p>
                            </div>
                          </div>
                        </div>
                        {formData.sponsorBacklink && (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 px-4 py-2 rounded-lg shadow-xl border border-slate-200">
                              <p className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                                <LinkIcon className="h-3 w-3" />
                                Click to open link
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-dashed border-slate-300">
                        <div className="text-center p-4">
                          <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-500 font-medium">No image uploaded</p>
                          <p className="text-xs text-slate-400 mt-1">Upload an image to see preview</p>
                        </div>
                      </div>
                    )}

                    {/* Ad Info Footer */}
                    {(formData.imagePreview || formData.sponsorAdImage) && (
                      <div className="p-4 bg-slate-50 border-t border-slate-200">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              formData.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`} />
                            <span className="text-xs font-semibold text-slate-600">
                              {formData.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {formData.sponsorBacklink && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 max-w-full">
                              <LinkIcon className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate max-w-[200px]" title={formData.sponsorBacklink}>
                                {formData.sponsorBacklink.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview Info */}
                  <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>Preview Note:</strong> This is how the ad will appear on the community wall. Users can click on the image to open the backlink.
                    </p>
                  </div>
                </div>

                {/* Preview Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Image Status</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      formData.imagePreview || formData.sponsorAdImage
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {formData.imagePreview || formData.sponsorAdImage 
                        ? `✓ ${formData.sponsorAdImageFile ? 'Image Uploaded' : 'Image Loaded'}` 
                        : '⚠ No Image'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Link Status</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      formData.sponsorBacklink
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {formData.sponsorBacklink ? '✓ Link Set' : '⚠ No Link'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Ad Status</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      formData.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {formData.status === 'active' ? '✓ Will be Visible' : '○ Will be Hidden'}
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

