import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Save, Upload, X, Image as ImageIcon, Loader2, Smartphone, Monitor } from 'lucide-react';
import { appConfigApi } from '../../services/api/app-config';
import { useToast } from '../../contexts/ToastContext';
import { apiClient } from '../../services/api/client';

export default function AppIconPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [iconConfig, setIconConfig] = useState({
    ios: '',
    android: '',
    default: '',
  });

  const [imageFiles, setImageFiles] = useState<{
    ios?: File | null;
    android?: File | null;
    default?: File | null;
  }>({});

  const [imagePreviews, setImagePreviews] = useState<{
    ios?: string | null;
    android?: string | null;
    default?: string | null;
  }>({});

  // Fetch current icon configuration
  const { data: currentConfig, isLoading } = useQuery({
    queryKey: ['app-icon-config'],
    queryFn: () => appConfigApi.getAppIcon(),
  });

  useEffect(() => {
    if (currentConfig) {
      setIconConfig({
        ios: currentConfig.ios || '',
        android: currentConfig.android || '',
        default: currentConfig.default || '',
      });
      setImagePreviews({
        ios: currentConfig.ios || null,
        android: currentConfig.android || null,
        default: currentConfig.default || null,
      });
    }
  }, [currentConfig]);

  const handleImageUpload = async (
    platform: 'ios' | 'android' | 'default',
    file: File,
  ) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size should be less than 5MB', 'error');
      return;
    }

    // For app icons, PNG format is recommended
    if (!file.type.includes('png') && !file.type.includes('jpeg') && !file.type.includes('jpg')) {
      showToast('App icons should be in PNG or JPEG format', 'error');
      return;
    }

    try {
      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await apiClient.post('/files/upload', formData, {
        headers: {
          // Don't set Content-Type manually - let axios set it with boundary
        },
      });

      const imageUrl = uploadResponse.data.data?.url || uploadResponse.data.url;

      if (!imageUrl) {
        throw new Error('Failed to get image URL from upload response');
      }

      // Update icon config
      setIconConfig((prev) => ({
        ...prev,
        [platform]: imageUrl,
      }));

      // Update preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => ({
          ...prev,
          [platform]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);

      // Also store the file for reference
      setImageFiles((prev) => ({
        ...prev,
        [platform]: file,
      }));

      showToast(`${platform.toUpperCase()} icon uploaded successfully`, 'success');
    } catch (error: any) {
      showToast(
        error.response?.data?.message || 'Failed to upload image',
        'error',
      );
    }
  };

  const handleFileSelect = (
    platform: 'ios' | 'android' | 'default',
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(platform, file);
    }
  };

  const removeImage = (platform: 'ios' | 'android' | 'default') => {
    setIconConfig((prev) => ({
      ...prev,
      [platform]: '',
    }));
    setImagePreviews((prev) => ({
      ...prev,
      [platform]: null,
    }));
    setImageFiles((prev) => ({
      ...prev,
      [platform]: null,
    }));
  };

  const updateMutation = useMutation({
    mutationFn: (data: { ios?: string; android?: string; default?: string }) =>
      appConfigApi.updateAppIcon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-icon-config'] });
      showToast('App icon configuration saved successfully', 'success');
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Failed to save icon configuration',
        'error',
      );
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      ios: iconConfig.ios || undefined,
      android: iconConfig.android || undefined,
      default: iconConfig.default || undefined,
    });
  };

  const renderIconUpload = (
    platform: 'ios' | 'android' | 'default',
    label: string,
    description: string,
  ) => {
    const preview = imagePreviews[platform];
    const currentUrl = iconConfig[platform];

    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {label} Icon
          </label>
          <p className="text-xs text-slate-500 mb-3">{description}</p>

          {preview || currentUrl ? (
            <div className="relative">
              <div className="border-2 border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={preview || currentUrl}
                      alt={`${label} icon`}
                      className="w-20 h-20 object-contain rounded-lg border border-slate-300 bg-white p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {label} Icon
                    </p>
                    {currentUrl && (
                      <p className="text-xs text-slate-500 mt-1 break-all">
                        {currentUrl}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id={`icon-upload-${platform}`}
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleFileSelect(platform, e)}
                      className="hidden"
                    />
                    <label htmlFor={`icon-upload-${platform}`}>
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
                      onClick={() => removeImage(platform)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="file"
                id={`icon-upload-${platform}`}
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => handleFileSelect(platform, e)}
                className="hidden"
              />
              <label htmlFor={`icon-upload-${platform}`}>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50 hover:bg-blue-50/50">
                  <div className="flex flex-col items-center gap-3">
                    <ImageIcon className="h-10 w-10 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Click to upload {label} icon
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG or JPEG, recommended size: 1024x1024px, max 5MB
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Manual URL input */}
          <div className="mt-3">
            <Input
              value={iconConfig[platform]}
              onChange={(e) =>
                setIconConfig((prev) => ({
                  ...prev,
                  [platform]: e.target.value,
                }))
              }
              placeholder={`Or enter ${label.toLowerCase()} icon URL`}
            />
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-slate-900">App Icon Management</h1>
          <p className="text-slate-600 mt-1">
            Upload and manage app icons for iOS, Android, and default platforms
          </p>
          <p className="text-sm text-amber-600 mt-2 bg-amber-50 border border-amber-200 rounded-md p-3">
            <strong>Note:</strong> Changing the app icon requires rebuilding the app. The icons
            uploaded here will be used in the next app build. For Expo apps, you'll need to
            configure these URLs in app.json/app.config.js and create a new build.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Platform Icons</CardTitle>
            <CardDescription>
              Upload custom app icons for different platforms. Icons should be square images
              (recommended: 1024x1024px) in PNG or JPEG format.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {renderIconUpload(
              'default',
              'Default',
              'Default icon used for all platforms if platform-specific icons are not set',
            )}

            {renderIconUpload(
              'ios',
              'iOS',
              'iOS app icon (Apple App Store). Recommended: 1024x1024px PNG',
            )}

            {renderIconUpload(
              'android',
              'Android',
              'Android app icon (Google Play Store). Recommended: 512x512px PNG',
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
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
    </AdminLayout>
  );
}
