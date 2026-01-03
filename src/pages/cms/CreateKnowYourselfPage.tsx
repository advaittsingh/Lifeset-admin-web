import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Save, Eye, Loader2, Image as ImageIcon, Upload, Send, Cloud, CloudOff } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsApi } from '../../services/api/cms';
import { useAutoSave } from '../../hooks/useAutoSave';

export default function CreateKnowYourselfPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({ 
    imageFile: null as File | null,
    imagePreview: null as string | null,
    imageUrl: '',
    yesIs: '',
    noIs: '',
    question: '', 
    options: [
      'बिल्कुल गलत / Absolutly Incorrect',
      'कुछ हद तक गलत / Partially Incorrect',
      'निष्पक्ष / Neutral',
      'कुछ हद तक सही / Partially Correct',
      'बिल्कुल सही / Absolutely Correct'
    ],
    order: 0 
  });

  // Personality options for dropdowns
  const personalityOptions = [
    { value: 'E', label: 'Extraversion (E)' },
    { value: 'I', label: 'Introversion (I)' },
    { value: 'N', label: 'Intuition (N)' },
    { value: 'S', label: 'Sensing (S)' },
    { value: 'F', label: 'Feeling (F)' },
    { value: 'T', label: 'Thinking (T)' },
    { value: 'P', label: 'Perception (P)' },
    { value: 'J', label: 'Judgment (J)' },
  ];

  // Fetch existing question if editing (include inactive to find all questions)
  const { data: existingItem, isLoading: isLoadingItem } = useQuery({
    queryKey: ['personality-question', id],
    queryFn: async () => {
      const questions = await cmsApi.getPersonalityQuestions({ includeInactive: true });
      const allQuestions = Array.isArray(questions) ? questions : (questions?.data || []);
      return allQuestions.find((item: any) => item.id === id);
    },
    enabled: isEditMode && !!id,
  });

  // Auto-save functionality (only in create mode, not edit mode)
  const autoSaveKey = `cms-draft-know-yourself-${id || 'new'}`;
  const { isSaving, lastSaved, hasDraft, restoreDraft, clearDraft } = useAutoSave({
    key: autoSaveKey,
    data: formData,
    enabled: !isEditMode, // Only auto-save in create mode
    debounceMs: 2000, // Save 2 seconds after last change
    onRestore: (restoredData) => {
      // Only restore if we're in create mode and form is empty
      if (!isEditMode && !formData.question) {
        // Restore image preview if it was a data URL
        setFormData({
          ...restoredData,
          imageFile: null,
          imagePreview: restoredData.imagePreview?.startsWith('data:') ? restoredData.imagePreview : null,
        });
        showToast('Draft restored from auto-save', 'info');
      }
    },
  });

  // Restore draft on mount if in create mode
  useEffect(() => {
    if (!isEditMode && hasDraft) {
      const restored = restoreDraft();
      if (restored && !formData.question) {
        // Show restore prompt
        if (window.confirm('A draft was found. Would you like to restore it?')) {
          setFormData({
            ...restored,
            imageFile: null,
            imagePreview: restored.imagePreview?.startsWith('data:') ? restored.imagePreview : null,
          });
          showToast('Draft restored', 'success');
        } else {
          clearDraft();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update form when existing item loads
  useEffect(() => {
    if (existingItem && isEditMode) {
      setFormData({
        imageFile: null,
        imagePreview: existingItem.imageUrl || null,
        imageUrl: existingItem.imageUrl || '',
        yesIs: existingItem.yesIs || '',
        noIs: existingItem.noIs || '',
        question: existingItem.question || '',
        options: Array.isArray(existingItem.options) ? existingItem.options : [
          'बिल्कुल गलत / Absolutly Incorrect',
          'कुछ हद तक गलत / Partially Incorrect',
          'निष्पक्ष / Neutral',
          'कुछ हद तक सही / Partially Correct',
          'बिल्कुल सही / Absolutely Correct'
        ],
        order: existingItem.order || 0,
      });
    }
  }, [existingItem, isEditMode]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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

  const [isPublishing, setIsPublishing] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: any) => cmsApi.createPersonalityQuestion(data),
    onSuccess: (_, variables) => {
      clearDraft(); // Clear draft when successfully published
      queryClient.invalidateQueries({ queryKey: ['personality-questions'] });
      const message = variables.isPublished 
        ? 'Question published successfully' 
        : 'Question saved as draft successfully';
      showToast(message, 'success');
      setIsPublishing(false);
      navigate('/cms/know-yourself');
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || 'Failed to create question', 'error');
      setIsPublishing(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => cmsApi.updatePersonalityQuestion(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['personality-questions'] });
      queryClient.invalidateQueries({ queryKey: ['personality-question', id] });
      const message = variables.data.isPublished 
        ? 'Question published successfully' 
        : 'Question saved as draft successfully';
      showToast(message, 'success');
      setIsPublishing(false);
      navigate('/cms/know-yourself');
    },
    onError: (error: any) => {
      showToast(error?.response?.data?.message || 'Failed to update question', 'error');
      setIsPublishing(false);
    },
  });

  const handleSubmit = (isPublished: boolean = false) => {
    if (!formData.question.trim()) {
      showToast('Please enter a question', 'error');
      return;
    }
    if (!formData.yesIs) {
      showToast('Please select Yes Is', 'error');
      return;
    }
    if (!formData.noIs) {
      showToast('Please select No Is', 'error');
      return;
    }

    setIsPublishing(isPublished);

    const imageUrl = formData.imagePreview || formData.imageUrl;
    
    const submitData = {
      question: formData.question,
      yesIs: formData.yesIs,
      noIs: formData.noIs,
      options: formData.options,
      order: formData.order,
      imageUrl: imageUrl || undefined,
      isPublished: isPublished,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
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
        {/* Auto-save indicator */}
        {!isEditMode && (
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving draft...</span>
                </>
              ) : hasDraft && lastSaved ? (
                <>
                  <Cloud className="h-4 w-4 text-green-600" />
                  <span>Draft saved {lastSaved.toLocaleTimeString()}</span>
                </>
              ) : (
                <>
                  <CloudOff className="h-4 w-4 text-slate-400" />
                  <span>Auto-save enabled</span>
                </>
              )}
            </div>
            {hasDraft && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const restored = restoreDraft();
                    if (restored) {
                      if (restored.imagePreview && restored.imagePreview.startsWith('data:')) {
                        setFormData(restored);
                      } else {
                        setFormData({ ...restored, imageFile: null, imagePreview: null });
                      }
                      showToast('Draft restored successfully', 'success');
                    }
                  }}
                  className="text-xs"
                >
                  <Cloud className="h-3 w-3 mr-1" />
                  Restore Draft
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
                      clearDraft();
                      showToast('Draft deleted', 'info');
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete Draft
                </Button>
              </div>
            )}
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/cms/know-yourself')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Know Yourself
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditMode ? 'Edit Personality Question' : 'Create Personality Question'}
              </h1>
              <p className="text-slate-600 mt-1">
                {isEditMode ? 'Update an existing personality question' : 'Add a new personality question'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(false)}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="border-slate-300"
            >
              {(createMutation.isPending || updateMutation.isPending) && !isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg"
            >
              {(createMutation.isPending || updateMutation.isPending) && isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content - Side by Side */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Side - Form */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">General Details</CardTitle>
                  <CardDescription className="text-slate-600">Enter question information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* File Upload */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  File Upload
                </label>
                {formData.imagePreview || formData.imageUrl ? (
                  <div className="mt-2 space-y-3">
                    <div className="relative">
                      <img
                        src={formData.imagePreview || formData.imageUrl}
                        alt="Question preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-slate-200 bg-slate-50"
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
                    <input
                      type="file"
                      id="image-upload-change"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('image-upload-change') as HTMLInputElement;
                        if (input) {
                          input.value = ''; // Reset so same file can be selected again
                          input.click();
                        }
                      }}
                      className="w-full"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Change Image
                    </Button>
                    {/* Alternative: Image URL */}
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <details className="group">
                        <summary className="text-xs font-medium text-slate-600 cursor-pointer hover:text-slate-900">
                          Or use image URL instead
                        </summary>
                        <div className="mt-2">
                          <Input
                            id="image-upload-url"
                            placeholder="https://example.com/image.jpg"
                            value={formData.imageUrl}
                            onChange={(e) => {
                              const url = e.target.value;
                              if (url) {
                                setFormData(prev => ({
                                  ...prev,
                                  imageUrl: url,
                                  imageFile: null,
                                  imagePreview: url,
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  imageUrl: '',
                                }));
                              }
                            }}
                            className="mt-1"
                            disabled={!!formData.imageFile}
                          />
                        </div>
                      </details>
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
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer bg-slate-50 hover:bg-blue-50/50">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-6 w-6 text-slate-400" />
                          <span className="text-sm text-slate-600">Choose file</span>
                          <span className="text-xs text-slate-500">No file chosen</span>
                        </div>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Yes Is */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Yes Is *</label>
                <select
                  value={formData.yesIs}
                  onChange={(e) => setFormData({ ...formData, yesIs: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Select Yes Is --</option>
                  {personalityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* No Is */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">No Is *</label>
                <select
                  value={formData.noIs}
                  onChange={(e) => setFormData({ ...formData, noIs: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Select No Is --</option>
                  {personalityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Question *</label>
                <Textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  rows={6}
                  placeholder="Enter question in Hindi and English. Use line breaks to separate Hindi and English text.&#10;&#10;Example:&#10;आप कुछ करने से पहले हमेशा यह सोचते हैं कि आपके कार्यों का दूसरों पर क्या प्रभाव पड़ेगा।&#10;&#10;You always consider how your actions might affect other people before doing something."
                  className="mt-1 whitespace-pre-wrap"
                  style={{ whiteSpace: 'pre-wrap' }}
                />
                <p className="text-xs text-slate-500 mt-2">
                  Tip: Press Enter to create line breaks between Hindi and English text
                </p>
              </div>

              {/* Order */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Order</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                  placeholder="Display order (0 = first)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Preview */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-green-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-md">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Preview</CardTitle>
                  <CardDescription className="text-slate-600">See how your question will appear</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Personality</span>
                  <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                {formData.question && (
                  <div 
                    className="text-base font-medium text-slate-900 p-3 bg-slate-50 rounded-lg whitespace-pre-wrap"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {formData.question}
                  </div>
                )}
                {(formData.imagePreview || formData.imageUrl) && (
                  <div className="w-full">
                    <img
                      src={formData.imagePreview || formData.imageUrl}
                      alt="Question"
                      className="w-full h-64 object-cover rounded-lg border-2 border-slate-200"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  {formData.options.map((option, idx) => (
                    <label key={idx} className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input type="radio" name="preview-option" className="text-blue-600" disabled />
                      <span className="text-sm text-slate-700 flex-1">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}




