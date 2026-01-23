import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Save, Loader2, Video, Play, ExternalLink } from 'lucide-react';
import { appConfigApi } from '../../services/api/app-config';
import { useToast } from '../../contexts/ToastContext';

interface ModuleVideo {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const modules: ModuleVideo[] = [
  {
    key: 'myCard',
    label: 'My Card',
    description: 'Demo video for the My Card feature',
    icon: <Video className="h-5 w-5" />,
  },
  {
    key: 'networking',
    label: 'Networking',
    description: 'Demo video for the Networking feature',
    icon: <Video className="h-5 w-5" />,
  },
  {
    key: 'myProfile',
    label: 'My Profile',
    description: 'Demo video for the My Profile feature',
    icon: <Video className="h-5 w-5" />,
  },
  {
    key: 'myBookmark',
    label: 'My Bookmark',
    description: 'Demo video for the My Bookmark feature',
    icon: <Video className="h-5 w-5" />,
  },
  {
    key: 'dailyDigest',
    label: 'Daily Digest',
    description: 'Demo video for the Daily Digest feature',
    icon: <Video className="h-5 w-5" />,
  },
  {
    key: 'currentAffairs',
    label: 'Current Affairs',
    description: 'Demo video for the Current Affairs feature',
    icon: <Video className="h-5 w-5" />,
  },
  {
    key: 'generalKnowledge',
    label: 'General Knowledge',
    description: 'Demo video for the General Knowledge feature',
    icon: <Video className="h-5 w-5" />,
  },
  {
    key: 'knowYourself',
    label: 'Know Yourself',
    description: 'Demo video for the Know Yourself feature',
    icon: <Video className="h-5 w-5" />,
  },
  {
    key: 'mcq',
    label: 'MCQ',
    description: 'Demo video for the MCQ feature',
    icon: <Video className="h-5 w-5" />,
  },
  {
    key: 'fresherJobs',
    label: 'Fresher Jobs',
    description: 'Demo video for the Fresher Jobs feature',
    icon: <Video className="h-5 w-5" />,
  },
  {
    key: 'internships',
    label: 'Internships',
    description: 'Demo video for the Internships feature',
    icon: <Video className="h-5 w-5" />,
  },
  {
    key: 'govtVacancies',
    label: 'Govt Vacancies',
    description: 'Demo video for the Govt Vacancies feature',
    icon: <Video className="h-5 w-5" />,
  },
];

export default function DemoVideosPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const justSavedRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  // Fetch existing demo video configuration
  // Always refetch on mount to ensure we have latest data after refresh
  const { data: demoVideosConfig, isLoading } = useQuery({
    queryKey: ['demo-videos'],
    queryFn: async () => {
      const result = await appConfigApi.getDemoVideos();
      console.log('Fetched demo videos config:', result); // Debug log
      return result;
    },
    refetchOnMount: 'always', // Always refetch on mount to get latest data
    refetchOnWindowFocus: false, // Don't refetch on window focus
    staleTime: 0, // Consider data stale immediately so it refetches on mount
  });

  // Load existing video URLs into state on initial load and after refresh
  useEffect(() => {
    // Only proceed if we have config data
    if (!demoVideosConfig) {
      console.log('No demoVideosConfig yet, waiting...'); // Debug log
      return;
    }
    
    // Skip if we just saved (prevents overwriting immediately after save)
    if (justSavedRef.current) {
      console.log('Just saved, skipping load'); // Debug log
      // Reset after a short delay
      setTimeout(() => {
        justSavedRef.current = false;
      }, 100);
      return;
    }
    
    // Build URLs from config - handle different possible data structures
    // Backend returns: { updatedAt: "...", videos: { myCard: "...", ... } }
    const urls: Record<string, string> = {};
    modules.forEach(module => {
      // Try nested 'videos' object first (backend structure)
      let value = (demoVideosConfig as any)?.videos?.[module.key];
      
      // If not found in videos, try direct access (legacy/alternative format)
      if (value === undefined || value === null) {
        value = demoVideosConfig[module.key as keyof typeof demoVideosConfig];
      }
      
      // If still not found, try nested data structure
      if (value === undefined || value === null) {
        value = (demoVideosConfig as any)?.data?.[module.key];
      }
      
      // Convert null/undefined to empty string, but keep actual URLs
      const urlValue = value ?? '';
      urls[module.key] = urlValue || ''; // Ensure it's always a string
      
      // Debug log for each module with URL
      if (urlValue && urlValue.trim() !== '') {
        console.log(`Found URL for ${module.key}:`, urlValue); // Debug log
      }
    });
    
    console.log('Demo videos config loaded:', demoVideosConfig); // Debug log
    console.log('Built URLs object:', urls); // Debug log
    
    // Always load from config - this handles initial load and refresh
    // Use functional update to check state safely
    setVideoUrls(prev => {
      console.log('Current state before update:', prev); // Debug log
      console.log('Config URLs to load:', urls); // Debug log
      console.log('isInitialLoadRef.current:', isInitialLoadRef.current); // Debug log
      
      // On initial mount (isInitialLoadRef) or when state is empty (refresh), always load from config
      const isStateEmpty = Object.keys(prev).length === 0 || 
                          Object.values(prev).every(v => !v || v.trim() === '');
      
      // Check if config has any saved URLs
      const configHasUrls = Object.values(urls).some(v => v && v.trim() !== '');
      console.log('Config has URLs:', configHasUrls, 'State is empty:', isStateEmpty); // Debug log
      
      // Always load on initial mount or when state is empty (handles refresh)
      if (isInitialLoadRef.current || isStateEmpty) {
        console.log('Loading from config (initial load or empty state)'); // Debug log
        isInitialLoadRef.current = false;
        return urls; // Always return config data
      }
      
      // If state has data, check if config differs and has saved URLs
      // If config has saved URLs but state doesn't match, prefer config (refresh scenario)
      if (configHasUrls) {
        const configDiffers = modules.some(module => {
          const configUrl = urls[module.key] || '';
          const stateUrl = prev[module.key] || '';
          return configUrl !== stateUrl;
        });
        
        if (configDiffers) {
          console.log('Config differs from state and has saved URLs, updating from config'); // Debug log
          return urls;
        }
      }
      
      // Otherwise keep current state (user might be editing)
      console.log('Keeping current state (no changes detected)'); // Debug log
      return prev;
    });
  }, [demoVideosConfig]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Record<string, string>) => {
      // Backend expects: { videos: { myCard: "...", ... } }
      const config: any = {
        videos: {}
      };
      modules.forEach(module => {
        const url = data[module.key]?.trim() || '';
        config.videos[module.key] = url || null;
      });
      console.log('Sending config to backend:', config); // Debug log
      return appConfigApi.updateDemoVideos(config);
    },
    onSuccess: (response, variables) => {
      // Mark that we just saved to prevent useEffect from overwriting immediately
      justSavedRef.current = true;
      
      // Build saved URLs from what we sent
      const savedUrls: Record<string, string> = {};
      modules.forEach(module => {
        // Use the data we sent (variables) as the source of truth
        savedUrls[module.key] = variables[module.key] || '';
      });
      
      // Update state immediately with what we saved (so it shows in UI)
      setVideoUrls(savedUrls);
      console.log('Saved video URLs:', savedUrls); // Debug log
      
      // Update the query cache with the response data (for future loads/refresh)
      // Backend returns: { updatedAt: "...", videos: { myCard: "...", ... } }
      // Ensure cache matches this structure
      const cacheData: any = {
        updatedAt: response?.updatedAt || new Date().toISOString(),
        videos: {}
      };
      
      modules.forEach(module => {
        // Try to get value from response.videos first (backend structure)
        let responseValue = (response as any)?.videos?.[module.key];
        
        // If not found, try direct access on response
        if (responseValue === undefined || responseValue === null) {
          responseValue = response?.[module.key as keyof typeof response];
        }
        
        const savedValue = variables[module.key]?.trim() || '';
        
        // Use response data if available, otherwise use what we sent
        const finalValue = responseValue !== undefined && responseValue !== null 
          ? responseValue 
          : (savedValue || null);
        
        // Store in videos object to match backend structure
        cacheData.videos[module.key] = finalValue;
      });
      
      // Always update cache with complete data matching backend structure
      queryClient.setQueryData(['demo-videos'], cacheData);
      console.log('Updated cache with:', cacheData); // Debug log
      
      // Reset the flag after a delay to allow future loads
      setTimeout(() => {
        justSavedRef.current = false;
      }, 200);
      
      showToast('Demo videos updated successfully', 'success');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to update demo videos';
      showToast(errorMessage, 'error');
    },
  });

  const handleVideoUrlChange = (moduleKey: string, url: string) => {
    setVideoUrls(prev => ({
      ...prev,
      [moduleKey]: url,
    }));
  };

  const handleSave = () => {
    updateMutation.mutate(videoUrls);
  };

  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty is valid (optional)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getVideoThumbnail = (url: string): string | null => {
    if (!url || !url.trim()) return null;
    
    try {
      // YouTube thumbnail
      if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
        const videoId = url.includes('youtu.be/')
          ? url.split('youtu.be/')[1]?.split('?')[0]?.split('/')[0]
          : url.split('v=')[1]?.split('&')[0]?.split('#')[0];
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
      
      // Vimeo thumbnail - extract video ID and use thumbnail API
      if (url.includes('vimeo.com/')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0]?.split('/').pop()?.split('#')[0];
        if (videoId && /^\d+$/.test(videoId)) {
          // Use Vimeo thumbnail API (no auth required for public videos)
          return `https://vumbnail.com/${videoId}.jpg`;
        }
      }
    } catch (error) {
      console.warn('Error generating video thumbnail:', error);
    }
    
    return null;
  };

  const getVideoPlatform = (url: string): 'youtube' | 'vimeo' | 'other' | null => {
    if (!url || !url.trim()) return null;
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return 'other';
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Demo Videos Management</h1>
            <p className="text-slate-600 mt-1">
              Manage demo video URLs for all app modules. These videos will be displayed in the app to help users understand each feature.
            </p>
          </div>
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
                Save All Changes
              </>
            )}
          </Button>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Video className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Video URL Guidelines</p>
                <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                  <li>Supported platforms: YouTube, Vimeo, or direct video URLs</li>
                  <li>YouTube format: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID</li>
                  <li>Vimeo format: https://vimeo.com/VIDEO_ID</li>
                  <li>Direct video URLs should be in MP4, WebM, or other supported formats</li>
                  <li>Leave empty to remove the demo video for a module</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const videoUrl = videoUrls[module.key] || '';
            const hasError = videoUrl && !isValidUrl(videoUrl);
            const thumbnail = getVideoThumbnail(videoUrl);

            return (
              <Card key={module.key} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {module.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{module.label}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Video Preview - Show thumbnail if video URL exists */}
                  {videoUrl && !hasError && (
                    <div className="space-y-2">
                      {thumbnail ? (
                        <div className="relative rounded-lg overflow-hidden border border-slate-200 group">
                          <img
                            src={thumbnail}
                            alt={`${module.label} video thumbnail`}
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                              // Hide image if thumbnail fails to load
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                            <Play className="h-10 w-10 text-white drop-shadow-lg" />
                          </div>
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0"
                            aria-label={`Watch ${module.label} demo video`}
                          />
                        </div>
                      ) : (
                        <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 h-40 flex items-center justify-center group">
                          <div className="text-center">
                            <Video className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">Video thumbnail unavailable</p>
                          </div>
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0"
                            aria-label={`Watch ${module.label} demo video`}
                          />
                        </div>
                      )}
                      
                      {/* Video URL Link - Always show when URL exists */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-600 mb-1">Video URL</p>
                            <a
                              href={videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 hover:underline break-all flex items-center gap-1.5 group"
                            >
                              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                              <span className="truncate">{videoUrl}</span>
                            </a>
                          </div>
                          <div className="flex-shrink-0">
                            {getVideoPlatform(videoUrl) === 'youtube' && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                YouTube
                              </span>
                            )}
                            {getVideoPlatform(videoUrl) === 'vimeo' && (
                              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                Vimeo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video URL Input */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Video URL {videoUrl && !hasError && <span className="text-green-600">✓</span>}
                    </label>
                    <Input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => handleVideoUrlChange(module.key, e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                      className={hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : (videoUrl ? 'border-green-300' : '')}
                    />
                    {hasError && (
                      <p className="text-xs text-red-600 mt-1">
                        Please enter a valid URL
                      </p>
                    )}
                    {!videoUrl && (
                      <p className="text-xs text-slate-500 mt-1">
                        Enter a YouTube or Vimeo video URL
                      </p>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-xs text-slate-500">
                      {videoUrl ? 'Video configured' : 'No video set'}
                    </span>
                    {videoUrl && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Save Button (Bottom) */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            size="lg"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
