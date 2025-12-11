import { Fragment, useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Image as ImageIcon, 
  Loader2,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  Info,
  Target,
  BarChart3,
  Settings,
  ChevronRight
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { useToast } from '../../contexts/ToastContext';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { adManagementApi } from '../../services/api/adManagement';
import { useParams } from 'react-router-dom';

interface DailyAllocation {
  [key: string]: number; // hour -> amount
}

interface AdPerformance {
  id: string;
  money: number;
  percentageShare: string;
  visibilityPrediction: number;
}

type AdPerformanceState = {
  dailyPrediction: number;
  adOpportunityDaily: number;
  slotAdOpportunity: number;
  selectedSlot: string;
  ads: AdPerformance[];
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function AdManagementPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Filters
  const [filters, setFilters] = useState({
    country: '',
    state: '',
    city: '',
    courseCategory: '',
    gender: '',
    age: '',
    userGroup: '',
  });

  // Ad Details
  const [adDetails, setAdDetails] = useState({
    estimatedUsers: '',
    dailyBudget: '5000',
    impressions: '5000',
    startDate: '',
    endDate: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
    imageUrl: '',
  });

  // Button Options
  const [buttonOptions, setButtonOptions] = useState({
    type: 'interested' as 'interested' | 'readMore' | 'download',
    link: '',
  });

  // Supporting Text
  const [supportingText, setSupportingText] = useState({
    text: '',
    threeLineText: '',
  });

  // Advertiser Settings
  const [advertiserSettings, setAdvertiserSettings] = useState({
    startDay: '',
    endDay: '',
    dailyAllocation: '500',
    slotAllocation: '21',
    additionalFilters: {
      startDay: '',
      endDay: '',
      state: '',
      district: '',
      location: '',
      subject: '',
      gender: '',
    },
  });

  // Daily/Hourly Allocation
  const [dailyAllocations, setDailyAllocations] = useState<Record<string, DailyAllocation>>(() => {
    const initial: Record<string, DailyAllocation> = {};
    DAYS.forEach(day => {
      initial[day] = {};
      HOURS.forEach(hour => {
        initial[day][hour.toString()] = 21; // Default value
      });
    });
    return initial;
  });

  // Ad Performance
  const [adPerformance, setAdPerformance] = useState<AdPerformanceState>({
    dailyPrediction: 10000,
    adOpportunityDaily: 2000,
    slotAdOpportunity: 120,
    selectedSlot: '7PM - 7:59PM',
    ads: [] as AdPerformance[],
  });

  // Active Users Data
  const [activeUsersData, setActiveUsersData] = useState<Record<string, Record<string, number>>>({});
  const [showAllHours, setShowAllHours] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps = [
    { id: 1, key: 'content', label: 'Ad Content', icon: ImageIcon },
    { id: 2, key: 'targeting', label: 'Targeting', icon: Target },
    { id: 3, key: 'budget', label: 'Budget & Schedule', icon: DollarSign },
    { id: 4, key: 'allocation', label: 'Allocation', icon: BarChart3 },
    { id: 5, key: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 6, key: 'review', label: 'Review', icon: Eye },
  ];

  // Fetch existing campaign if editing
  const { data: existingCampaign, isLoading: isLoadingCampaign } = useQuery({
    queryKey: ['ad-campaign', id],
    queryFn: () => adManagementApi.getCampaign(id!),
    enabled: isEditMode && !!id,
  });

  // Load existing campaign data
  useEffect(() => {
    if (existingCampaign && isEditMode) {
      setFilters({
        country: existingCampaign.country || '',
        state: existingCampaign.state || '',
        city: existingCampaign.city || '',
        courseCategory: existingCampaign.courseCategory || '',
        gender: existingCampaign.gender || '',
        age: existingCampaign.age || '',
        userGroup: existingCampaign.userGroup || '',
      });
      setAdDetails({
        estimatedUsers: existingCampaign.estimatedUsers?.toString() || '',
        dailyBudget: existingCampaign.dailyBudget?.toString() || '5000',
        impressions: existingCampaign.impressions?.toString() || '5000',
        startDate: existingCampaign.startDate ? new Date(existingCampaign.startDate).toISOString().split('T')[0] : '',
        endDate: existingCampaign.endDate ? new Date(existingCampaign.endDate).toISOString().split('T')[0] : '',
        imageFile: null,
        imagePreview: existingCampaign.imageUrl || null,
        imageUrl: existingCampaign.imageUrl || '',
      });
      setButtonOptions({
        type: (existingCampaign.buttonType as any) || 'interested',
        link: existingCampaign.buttonLink || '',
      });
      setSupportingText({
        text: existingCampaign.supportingText || '',
        threeLineText: existingCampaign.threeLineText || '',
      });
      setAdvertiserSettings({
        startDay: existingCampaign.advertiserStartDay ? new Date(existingCampaign.advertiserStartDay).toISOString().split('T')[0] : '',
        endDay: existingCampaign.advertiserEndDay ? new Date(existingCampaign.advertiserEndDay).toISOString().split('T')[0] : '',
        dailyAllocation: existingCampaign.dailyAllocation?.toString() || '500',
        slotAllocation: existingCampaign.slotAllocation?.toString() || '21',
        additionalFilters: {
          startDay: '',
          endDay: '',
          state: existingCampaign.advertiserState || '',
          district: existingCampaign.advertiserDistrict || '',
          location: existingCampaign.advertiserLocation || '',
          subject: existingCampaign.advertiserSubject || '',
          gender: existingCampaign.advertiserGender || '',
        },
      });
      if (existingCampaign.hourlyAllocations) {
        setDailyAllocations(existingCampaign.hourlyAllocations as any);
      }
    }
  }, [existingCampaign, isEditMode]);

  // Calculate estimated users when filters change
  const estimateUsersMutation = useMutation({
    mutationFn: adManagementApi.estimateUsers,
    onSuccess: (data) => {
      if (data?.estimatedUsers !== undefined) {
        setAdDetails(prev => ({ ...prev, estimatedUsers: data.estimatedUsers.toString() }));
      }
    },
    onError: (error) => {
      // Silently fail - don't show error for estimation
      console.error('Error estimating users:', error);
    },
  });

  useEffect(() => {
    const hasFilters = Object.values(filters).some(v => v && v.trim() !== '');
    if (hasFilters && !isEditMode) {
      const timeoutId = setTimeout(() => {
        try {
          estimateUsersMutation.mutate(filters);
        } catch (error) {
          console.error('Error in estimate mutation:', error);
        }
      }, 800); // Increased debounce time
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.country, filters.state, filters.city, filters.courseCategory, filters.gender, filters.age, filters.userGroup, isEditMode]);

  // Calculate slot allocation when daily allocation changes
  useEffect(() => {
    const daily = parseFloat(advertiserSettings.dailyAllocation) || 0;
    const slotsPerDay = 24;
    const slotAmount = Math.floor(daily / slotsPerDay);
    setAdvertiserSettings(prev => ({ ...prev, slotAllocation: slotAmount.toString() }));
    
    // Update all hourly slots
    setDailyAllocations(prev => {
      const updated = { ...prev };
      DAYS.forEach(day => {
        updated[day] = { ...updated[day] };
        HOURS.forEach(hour => {
          updated[day][hour.toString()] = slotAmount;
        });
      });
      return updated;
    });
  }, [advertiserSettings.dailyAllocation]);

  // Fetch ad performance predictions
  const { data: performanceData } = useQuery<AdPerformanceState>({
    queryKey: ['ad-performance', adPerformance.selectedSlot],
    queryFn: () => adManagementApi.getPerformancePredictions(adPerformance.selectedSlot),
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false, // Don't retry on error
  });

  // Fetch active users data
  const { data: activeUsers } = useQuery<Record<string, Record<string, number>>>({
    queryKey: ['active-users-by-hour'],
    queryFn: () => adManagementApi.getActiveUsersByHour(),
    refetchInterval: 60000, // Refresh every minute
  });

  useEffect(() => {
    if (performanceData) {
      setAdPerformance(performanceData);
    }
  }, [performanceData]);

  useEffect(() => {
    if (activeUsers) {
      setActiveUsersData(activeUsers);
    }
  }, [activeUsers]);

  const imageUploadMutation = useMutation({
    mutationFn: adManagementApi.uploadImage,
    onSuccess: (imageUrl) => {
      setAdDetails(prev => ({
        ...prev,
        imageUrl,
        imagePreview: imageUrl,
        imageFile: null,
      }));
      showToast('Image uploaded successfully', 'success');
    },
    onError: () => {
      showToast('Failed to upload image', 'error');
    },
  });

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
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
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdDetails(prev => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);

      // Upload to server
      imageUploadMutation.mutate(file);
    }
  };

  const updateHourlyAllocation = (day: string, hour: number, value: number) => {
    setDailyAllocations(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [hour.toString()]: value,
      },
    }));
  };

  const applySameAllocationToAllDays = () => {
    const firstDay = dailyAllocations[DAYS[0]];
    const updated = { ...dailyAllocations };
    DAYS.forEach(day => {
      updated[day] = { ...firstDay };
    });
    setDailyAllocations(updated);
    showToast('Allocation applied to all days', 'success');
  };

  // Step validation functions
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Ad Content
        return !!(adDetails.imagePreview || adDetails.imageUrl) && !!buttonOptions.link && !!supportingText.text;
      case 2: // Targeting
        return Object.values(filters).some(v => v && v.trim() !== '') || true; // At least one filter or allow all
      case 3: // Budget
        return !!(adDetails.dailyBudget && parseFloat(adDetails.dailyBudget) > 0 && adDetails.startDate && adDetails.endDate);
      case 4: // Allocation
        return !!(advertiserSettings.dailyAllocation && parseFloat(advertiserSettings.dailyAllocation) > 0);
      case 5: // Performance
        return true; // Performance is informational, always valid
      case 6: // Review
        return true; // Review is the final step
      default:
        return false;
    }
  };

  const markStepComplete = (step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const handleNextStep = () => {
    if (!validateStep(currentStep)) {
      showToast(`Please complete all required fields in ${steps[currentStep - 1].label}`, 'error');
      return;
    }
    markStepComplete(currentStep);
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setActiveTab(steps[currentStep].key);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setActiveTab(steps[currentStep - 2].key);
    }
  };

  const handleStepClick = (step: number) => {
    // Only allow clicking on completed steps or the next step
    if (step <= currentStep || completedSteps.has(step - 1)) {
      setCurrentStep(step);
      setActiveTab(steps[step - 1].key);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditMode && id) {
        return adManagementApi.updateCampaign(id, data);
      } else {
        return adManagementApi.createCampaign(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-ads'] });
      queryClient.invalidateQueries({ queryKey: ['ad-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['ad-campaign', id] });
      showToast(isEditMode ? 'Ad updated successfully' : 'Ad created successfully', 'success');
      navigate('/sponsor-ads');
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || (isEditMode ? 'Failed to update ad' : 'Failed to create ad'), 'error');
    },
  });

  const handlePublish = () => {
    // Validate all steps before publishing
    for (let i = 1; i <= 5; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i);
        setActiveTab(steps[i - 1].key);
        showToast(`Please complete step ${i}: ${steps[i - 1].label}`, 'error');
        return;
      }
    }

    if (!adDetails.imagePreview && !adDetails.imageUrl) {
      showToast('Please upload an ad image', 'error');
      setCurrentStep(1);
      setActiveTab('content');
      return;
    }
    if (!adDetails.startDate || !adDetails.endDate) {
      showToast('Please select start and end dates', 'error');
      setCurrentStep(3);
      setActiveTab('budget');
      return;
    }
    if (!buttonOptions.link) {
      showToast('Please provide a link for the button', 'error');
      setCurrentStep(1);
      setActiveTab('content');
      return;
    }

    const submitData = {
      // Basic info
      title: supportingText.text || 'Untitled Ad',
      imageUrl: adDetails.imageUrl || (adDetails.imagePreview?.startsWith('data:') ? null : adDetails.imagePreview) || null,
      supportingText: supportingText.text,
      threeLineText: supportingText.threeLineText,
      buttonType: buttonOptions.type,
      buttonLink: buttonOptions.link,
      
      // Filters
      country: filters.country || null,
      state: filters.state || null,
      city: filters.city || null,
      courseCategory: filters.courseCategory || null,
      gender: filters.gender || null,
      age: filters.age || null,
      userGroup: filters.userGroup || null,
      
      // Budget & Schedule
      dailyBudget: parseFloat(adDetails.dailyBudget) || 0,
      impressions: parseInt(adDetails.impressions) || 0,
      estimatedUsers: parseInt(adDetails.estimatedUsers) || 0,
      startDate: adDetails.startDate ? new Date(adDetails.startDate).toISOString() : null,
      endDate: adDetails.endDate ? new Date(adDetails.endDate).toISOString() : null,
      
      // Advertiser Settings
      advertiserStartDay: advertiserSettings.startDay ? new Date(advertiserSettings.startDay).toISOString() : null,
      advertiserEndDay: advertiserSettings.endDay ? new Date(advertiserSettings.endDay).toISOString() : null,
      dailyAllocation: parseFloat(advertiserSettings.dailyAllocation) || 0,
      slotAllocation: parseFloat(advertiserSettings.slotAllocation) || 0,
      hourlyAllocations: dailyAllocations,
      
      // Additional Filters
      advertiserState: advertiserSettings.additionalFilters.state || null,
      advertiserDistrict: advertiserSettings.additionalFilters.district || null,
      advertiserLocation: advertiserSettings.additionalFilters.location || null,
      advertiserSubject: advertiserSettings.additionalFilters.subject || null,
      advertiserGender: advertiserSettings.additionalFilters.gender || null,
      
      // Status
      status: 'active' as const,
    };

    createMutation.mutate(submitData);
  };

  if (isLoadingCampaign && isEditMode) {
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
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/sponsor-ads')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Ad Management</h1>
              <p className="text-slate-600 mt-1">Create and manage advertisements with targeting and performance tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">
              Step {currentStep} of {steps.length}
            </span>
          </div>
        </div>

        {/* Step Progress Indicator */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = completedSteps.has(step.id);
                const isAccessible = step.id <= currentStep || completedSteps.has(step.id - 1);
                
                return (
                  <Fragment key={step.id}>
                    <div className="flex flex-col items-center flex-1">
                      <button
                        type="button"
                        onClick={() => isAccessible && handleStepClick(step.id)}
                        disabled={!isAccessible}
                        className={`flex flex-col items-center gap-2 transition-all ${
                          !isAccessible ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                            isActive
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                              : isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-slate-100 border-slate-300 text-slate-400'
                          }`}
                        >
                          {isCompleted && !isActive ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="text-center">
                          <p className={`text-xs font-semibold ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                            Step {step.id}
                          </p>
                          <p className={`text-xs ${isActive ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                            {step.label}
                          </p>
                        </div>
                      </button>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mt-[-24px] ${
                        isCompleted ? 'bg-emerald-500' : currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'
                      }`} />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Tabs value={activeTab} onValueChange={(value) => {
          const step = steps.find(s => s.key === value);
          if (step) {
            handleStepClick(step.id);
          }
        }} className="w-full">
          <TabsList className="hidden">
            {steps.map(step => (
              <TabsTrigger key={step.key} value={step.key}>
                {step.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Ad Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50/50 to-white border-b">
                  <CardTitle className="text-lg">Ad Image & Content</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Upload Image <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    {!adDetails.imagePreview && !adDetails.imageUrl && (
                      <p className="text-xs text-red-500 mt-1">This field is required</p>
                    )}
                    <label htmlFor="image-upload">
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors">
                        {adDetails.imagePreview || adDetails.imageUrl ? (
                          <div className="space-y-3">
                            <img
                              src={adDetails.imagePreview || adDetails.imageUrl}
                              alt="Ad Preview"
                              className="w-full max-w-md mx-auto rounded-lg border border-slate-200"
                            />
                            <Button variant="outline" size="sm" className="mt-2">
                              Change Image
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <ImageIcon className="h-12 w-12 text-slate-400" />
                            <p className="text-sm font-semibold text-slate-900">Click to upload image</p>
                            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Supporting Text</label>
                    <Textarea
                      value={supportingText.text}
                      onChange={(e) => setSupportingText({ ...supportingText, text: e.target.value })}
                      placeholder="Enter supporting text for your ad..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">3 Line Text</label>
                    <Textarea
                      value={supportingText.threeLineText}
                      onChange={(e) => setSupportingText({ ...supportingText, threeLineText: e.target.value })}
                      placeholder="Enter 3 line text description..."
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-white border-b">
                  <CardTitle className="text-lg">Button Configuration</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">Button Type</label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="radio"
                          checked={buttonOptions.type === 'interested'}
                          onChange={() => setButtonOptions({ ...buttonOptions, type: 'interested' })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-slate-700 font-medium">Interested</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="radio"
                          checked={buttonOptions.type === 'readMore'}
                          onChange={() => setButtonOptions({ ...buttonOptions, type: 'readMore' })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-slate-700 font-medium">Read More</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="radio"
                          checked={buttonOptions.type === 'download'}
                          onChange={() => setButtonOptions({ ...buttonOptions, type: 'download' })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-slate-700 font-medium">Download</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Button Link <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={buttonOptions.link}
                      onChange={(e) => setButtonOptions({ ...buttonOptions, link: e.target.value })}
                      placeholder="https://example.com"
                    />
                    <p className="text-xs text-slate-500 mt-2">URL users will be redirected to when clicking the button</p>
                    {!buttonOptions.link && (
                      <p className="text-xs text-red-500 mt-1">This field is required</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Targeting Tab */}
          <TabsContent value="targeting" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50/50 to-white border-b">
                <CardTitle className="text-lg">Targeting Filters</CardTitle>
                <CardDescription>Define your target audience based on location, demographics, and interests</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Country</label>
                    <Input
                      value={filters.country}
                      onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                      placeholder="Select Country"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">State</label>
                    <Input
                      value={filters.state}
                      onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                      placeholder="Select State"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">City</label>
                    <Input
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                      placeholder="Select City"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Course Category</label>
                    <Input
                      value={filters.courseCategory}
                      onChange={(e) => setFilters({ ...filters, courseCategory: e.target.value })}
                      placeholder="Select Course Category"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Gender</label>
                    <select
                      value={filters.gender}
                      onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Age Range</label>
                    <Input
                      value={filters.age}
                      onChange={(e) => setFilters({ ...filters, age: e.target.value })}
                      placeholder="e.g., 18-25"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">User Group</label>
                    <Input
                      value={filters.userGroup}
                      onChange={(e) => setFilters({ ...filters, userGroup: e.target.value })}
                      placeholder="Select User Group"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Estimated Users</p>
                      <p className="text-2xl font-bold text-blue-700 mt-1">
                        {adDetails.estimatedUsers ? parseInt(adDetails.estimatedUsers).toLocaleString() : '0'}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                  <p className="text-xs text-blue-700 mt-2">This count is automatically calculated based on your targeting filters</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget & Schedule Tab */}
          <TabsContent value="budget" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-amber-50/50 to-white border-b">
                  <CardTitle className="text-lg">Budget Settings</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Daily Budget <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={adDetails.dailyBudget}
                      onChange={(e) => setAdDetails({ ...adDetails, dailyBudget: e.target.value })}
                      placeholder="5000"
                      min="0"
                    />
                    <p className="text-xs text-slate-500 mt-1">Amount to spend per day on this ad</p>
                    {(!adDetails.dailyBudget || parseFloat(adDetails.dailyBudget) <= 0) && (
                      <p className="text-xs text-red-500 mt-1">Please enter a valid daily budget</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Impressions</label>
                    <Input
                      type="number"
                      value={adDetails.impressions}
                      onChange={(e) => setAdDetails({ ...adDetails, impressions: e.target.value })}
                      placeholder="5000"
                    />
                    <p className="text-xs text-slate-500 mt-1">Expected number of ad views</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50/50 to-white border-b">
                  <CardTitle className="text-lg">Schedule</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={adDetails.startDate}
                      onChange={(e) => setAdDetails({ ...adDetails, startDate: e.target.value })}
                    />
                    {!adDetails.startDate && (
                      <p className="text-xs text-red-500 mt-1">This field is required</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={adDetails.endDate}
                      onChange={(e) => setAdDetails({ ...adDetails, endDate: e.target.value })}
                      min={adDetails.startDate}
                    />
                    {!adDetails.endDate && (
                      <p className="text-xs text-red-500 mt-1">This field is required</p>
                    )}
                    {adDetails.startDate && adDetails.endDate && new Date(adDetails.endDate) < new Date(adDetails.startDate) && (
                      <p className="text-xs text-red-500 mt-1">End date must be after start date</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Allocation Tab */}
          <TabsContent value="allocation" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-50/50 to-white border-b">
                <CardTitle className="text-lg">Fund Allocation & Active Users</CardTitle>
                <CardDescription>View active users by hour and adjust fund allocation based on trends</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Daily Allocation <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={advertiserSettings.dailyAllocation}
                      onChange={(e) => setAdvertiserSettings({ ...advertiserSettings, dailyAllocation: e.target.value })}
                      min="0"
                    />
                    {(!advertiserSettings.dailyAllocation || parseFloat(advertiserSettings.dailyAllocation) <= 0) && (
                      <p className="text-xs text-red-500 mt-1">Please enter a valid daily allocation</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">Per Slot Allocation</label>
                    <Input
                      type="number"
                      value={advertiserSettings.slotAllocation}
                      readOnly
                      className="bg-slate-50"
                    />
                    <p className="text-xs text-slate-500 mt-1">Auto-calculated: Daily ÷ 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">Active Users by Hour</h3>
                    <p className="text-xs text-slate-500">View user activity trends to optimize allocation</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updated = { ...dailyAllocations };
                        DAYS.forEach(day => {
                          const dayUsers = activeUsersData[day] || {};
                          const maxUsers = Math.max(...Object.values(dayUsers), 1);
                          HOURS.forEach(hour => {
                            const userCount = dayUsers[hour.toString()] || 0;
                            const ratio = userCount / maxUsers;
                            const allocation = Math.floor(parseFloat(advertiserSettings.dailyAllocation) * ratio / 24);
                            updated[day][hour.toString()] = allocation;
                          });
                        });
                        setDailyAllocations(updated);
                        showToast('Allocation adjusted based on active users', 'success');
                      }}
                    >
                      Auto-Allocate by Users
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={applySameAllocationToAllDays}
                    >
                      Apply to All Days
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllHours(!showAllHours)}
                    >
                      {showAllHours ? 'Show Less' : 'Show All Hours'}
                    </Button>
                  </div>
                </div>

                {/* Active Users & Allocation Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gradient-to-r from-purple-50 to-blue-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-3 text-left font-semibold text-slate-700 border-r border-slate-200 sticky left-0 bg-gradient-to-r from-purple-50 to-blue-50 z-20">Day</th>
                          <th className="px-3 py-3 text-center font-semibold text-slate-700 border-r border-slate-200">Total Users</th>
                          {(showAllHours ? HOURS : HOURS.slice(0, 12)).map(hour => (
                            <th key={hour} className="px-2 py-3 text-center font-semibold text-slate-700 border-r border-slate-200 min-w-[80px]">
                              <div className="flex flex-col">
                                <span>{hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DAYS.map(day => {
                          const dayUsers = activeUsersData[day] || {};
                          const totalUsers = Object.values(dayUsers).reduce((sum, count) => sum + count, 0);
                          const peakEntry = Object.entries(dayUsers).reduce((max, [hour, count]) => {
                            const maxCount = typeof max[1] === 'number' ? max[1] : 0;
                            return count > maxCount ? [hour, count] : max;
                          }, ['0', 0] as [string, number]);
                          const peakCount = peakEntry[1];

                          return (
                            <tr key={day} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="px-3 py-3 font-semibold text-slate-700 border-r border-slate-200 sticky left-0 bg-white z-10">
                                {day}
                              </td>
                              <td className="px-3 py-3 text-center border-r border-slate-200 bg-blue-50">
                                <div className="font-bold text-blue-700">{totalUsers.toLocaleString()}</div>
                                <div className="text-[10px] text-blue-600">Peak: {peakCount}</div>
                              </td>
                              {(showAllHours ? HOURS : HOURS.slice(0, 12)).map(hour => {
                                const userCount = dayUsers[hour.toString()] || 0;
                                const intensity = userCount > 0 ? Math.min((userCount / (peakCount || 1)) * 100, 100) : 0;
                                const hasHighActivity = userCount > 500;

                                return (
                                  <td key={hour} className="px-2 py-3 border-r border-slate-200">
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="w-full">
                                        <div className="text-[10px] font-medium text-slate-600 mb-1 text-center">{userCount} users</div>
                                        <div 
                                          className="w-full h-3 rounded bg-slate-200 relative overflow-hidden"
                                          title={`${userCount} active users`}
                                        >
                                          <div 
                                            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all"
                                            style={{ width: `${intensity}%` }}
                                          />
                                        </div>
                                      </div>
                                      <Input
                                        type="number"
                                        value={dailyAllocations[day][hour.toString()]}
                                        onChange={(e) => updateHourlyAllocation(day, hour, parseFloat(e.target.value) || 0)}
                                        className={`w-16 h-7 text-xs text-center p-1 ${hasHighActivity ? 'border-blue-300 bg-blue-50 font-semibold' : ''}`}
                                        min="0"
                                        step="1"
                                      />
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>💡 Tip:</strong> Use the active user data (bars above) to adjust your fund allocation. 
                    Increase allocation during peak hours (darker bars) for better visibility. Click "Auto-Allocate by Users" 
                    to automatically distribute funds based on user activity trends.
                  </p>
                </div>

                {/* Additional Filters */}
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Additional Targeting Filters</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">State</label>
                      <Input
                        value={advertiserSettings.additionalFilters.state}
                        onChange={(e) => setAdvertiserSettings({
                          ...advertiserSettings,
                          additionalFilters: { ...advertiserSettings.additionalFilters, state: e.target.value }
                        })}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">District</label>
                      <Input
                        value={advertiserSettings.additionalFilters.district}
                        onChange={(e) => setAdvertiserSettings({
                          ...advertiserSettings,
                          additionalFilters: { ...advertiserSettings.additionalFilters, district: e.target.value }
                        })}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Location</label>
                      <Input
                        value={advertiserSettings.additionalFilters.location}
                        onChange={(e) => setAdvertiserSettings({
                          ...advertiserSettings,
                          additionalFilters: { ...advertiserSettings.additionalFilters, location: e.target.value }
                        })}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Subject</label>
                      <Input
                        value={advertiserSettings.additionalFilters.subject}
                        onChange={(e) => setAdvertiserSettings({
                          ...advertiserSettings,
                          additionalFilters: { ...advertiserSettings.additionalFilters, subject: e.target.value }
                        })}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Gender</label>
                      <select
                        value={advertiserSettings.additionalFilters.gender}
                        onChange={(e) => setAdvertiserSettings({
                          ...advertiserSettings,
                          additionalFilters: { ...advertiserSettings.additionalFilters, gender: e.target.value }
                        })}
                        className="w-full px-2 py-1 border border-slate-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="all">All</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-white border-b">
                <CardTitle className="text-lg">Ad Performance & Predictions</CardTitle>
                <CardDescription>View performance metrics and predictions for your ad campaign</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-700 mb-1">Daily Prediction</p>
                    <p className="text-2xl font-bold text-blue-900">{adPerformance.dailyPrediction}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <p className="text-xs font-medium text-purple-700 mb-1">Ad Opportunity (Daily)</p>
                    <p className="text-2xl font-bold text-purple-900">{adPerformance.adOpportunityDaily}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                    <p className="text-xs font-medium text-emerald-700 mb-1">Slot Ad Opportunity</p>
                    <p className="text-2xl font-bold text-emerald-900">{adPerformance.slotAdOpportunity}</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">Selected Slot: {adPerformance.selectedSlot}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Ad Performance Comparison</h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-slate-700 border-r border-slate-200">Ad</th>
                            <th className="px-4 py-3 text-center font-semibold text-slate-700 border-r border-slate-200">Money</th>
                            <th className="px-4 py-3 text-center font-semibold text-slate-700 border-r border-slate-200">% Share</th>
                            <th className="px-4 py-3 text-center font-semibold text-slate-700">Visibility</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adPerformance.ads.map((ad) => (
                            <tr key={ad.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="px-4 py-3 font-medium text-slate-700 border-r border-slate-200">{ad.id}</td>
                              <td className="px-4 py-3 text-center border-r border-slate-200">{ad.money}</td>
                              <td className="px-4 py-3 text-center border-r border-slate-200">{ad.percentageShare}%</td>
                              <td className="px-4 py-3 text-center">{ad.visibilityPrediction}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900 mb-1">Ad Agency Notification</p>
                      <p className="text-xs text-yellow-800 leading-relaxed">
                        Ad agency will receive a notification if anyone changes the bid and presence is getting affected. 
                        They will have 2 options either the visibility will get reduced or they need to match the bid 
                        to get the committed exposure which he received at the time of bid applied.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-white border-b">
                <CardTitle className="text-lg">Review & Publish</CardTitle>
                <CardDescription>Review all your ad details before publishing</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ad Preview */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Ad Preview</h3>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-dashed border-slate-300 min-h-[400px] flex items-center justify-center">
                      {adDetails.imagePreview || adDetails.imageUrl ? (
                        <div className="w-full max-w-md space-y-4">
                          <img
                            src={adDetails.imagePreview || adDetails.imageUrl}
                            alt="Ad Preview"
                            className="w-full rounded-lg border-2 border-slate-200 shadow-lg"
                          />
                          {supportingText.text && (
                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                              <p className="text-sm text-slate-700 leading-relaxed">{supportingText.text}</p>
                            </div>
                          )}
                          {buttonOptions.link && (
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
                              {buttonOptions.type === 'interested' && 'Interested'}
                              {buttonOptions.type === 'readMore' && 'Read More'}
                              {buttonOptions.type === 'download' && 'Download'}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="h-16 w-16 text-slate-400 mx-auto mb-3" />
                          <p className="text-sm text-slate-500">No image uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Campaign Summary</h3>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Targeting</p>
                        <div className="text-sm text-slate-900">
                          {filters.country && <span className="inline-block mr-2 mb-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{filters.country}</span>}
                          {filters.state && <span className="inline-block mr-2 mb-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{filters.state}</span>}
                          {filters.city && <span className="inline-block mr-2 mb-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{filters.city}</span>}
                          {filters.gender && <span className="inline-block mr-2 mb-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{filters.gender}</span>}
                          {!filters.country && !filters.state && !filters.city && <span className="text-slate-500">All locations</span>}
                        </div>
                        <p className="text-xs text-slate-600 mt-2">Estimated Users: <span className="font-semibold text-slate-900">{parseInt(adDetails.estimatedUsers || '0').toLocaleString()}</span></p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Budget</p>
                        <p className="text-sm text-slate-900">Daily: ₹{parseFloat(adDetails.dailyBudget || '0').toLocaleString()}</p>
                        <p className="text-sm text-slate-900">Impressions: {parseInt(adDetails.impressions || '0').toLocaleString()}</p>
                        <p className="text-xs text-slate-600 mt-2">
                          {adDetails.startDate && adDetails.endDate && (
                            <>Runs from {new Date(adDetails.startDate).toLocaleDateString()} to {new Date(adDetails.endDate).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Allocation</p>
                        <p className="text-sm text-slate-900">Daily: ₹{parseFloat(advertiserSettings.dailyAllocation || '0').toLocaleString()}</p>
                        <p className="text-sm text-slate-900">Per Slot: ₹{parseFloat(advertiserSettings.slotAllocation || '0').toLocaleString()}</p>
                      </div>

                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-semibold text-emerald-900">All Steps Completed</p>
                        </div>
                        <p className="text-xs text-emerald-700">You're ready to publish your ad campaign!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Step Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < steps.length ? (
              <Button
                onClick={handleNextStep}
                disabled={!validateStep(currentStep)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                disabled={createMutation.isPending || !validateStep(6)}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold shadow-lg"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Publish Ad Campaign
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
