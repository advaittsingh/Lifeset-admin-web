import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Loader2, Brain, Upload, Image as ImageIcon } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';
import { useToast } from '../../contexts/ToastContext';

export default function KnowYourselfPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({ 
    personality: '',
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
  const queryClient = useQueryClient();
  const { showToast } = useToast();

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file, imagePreview: URL.createObjectURL(file) });
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, imageFile: null, imagePreview: null, imageUrl: '' });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['personality-questions'],
    queryFn: () => cmsApi.getPersonalityQuestions(),
  });

  const questions = Array.isArray(data) ? data : (data?.data || []);

  const createMutation = useMutation({
    mutationFn: (data: any) => cmsApi.createPersonalityQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personality-questions'] });
      showToast('Question created successfully', 'success');
      setIsCreateDialogOpen(false);
      setFormData({ 
        personality: '',
        imageFile: null,
        imagePreview: null,
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
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => cmsApi.updatePersonalityQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personality-questions'] });
      showToast('Question updated successfully', 'success');
      setIsEditDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsApi.deletePersonalityQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personality-questions'] });
      showToast('Question deleted successfully', 'success');
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Know Yourself Quiz</h1>
            <p className="text-slate-600 mt-1">Manage personality quiz questions</p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Question
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personality Quiz Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((item: any, idx: number) => (
                  <Card key={item.id} className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-slate-500">Question {item.order || idx + 1}</span>
                          </div>
                          <h3 className="font-semibold mb-2">{item.question}</h3>
                          <div className="ml-6 space-y-1">
                            {Array.isArray(item.options) && item.options.map((opt: string, optIdx: number) => (
                              <div key={optIdx} className="text-sm text-slate-600">
                                {optIdx + 1}. {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setFormData({
                                personality: item.personality || '',
                                imageFile: null,
                                imagePreview: item.imageUrl || null,
                                imageUrl: item.imageUrl || '',
                                yesIs: item.yesIs || '',
                                noIs: item.noIs || '',
                                question: item.question || '',
                                options: Array.isArray(item.options) ? item.options : [
                                  'बिल्कुल गलत / Absolutly Incorrect',
                                  'कुछ हद तक गलत / Partially Incorrect',
                                  'निष्पक्ष / Neutral',
                                  'कुछ हद तक सही / Partially Correct',
                                  'बिल्कुल सही / Absolutely Correct'
                                ],
                                order: item.order || 0,
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialogs */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Personality Question</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Personality *</label>
                  <select
                    value={formData.personality}
                    onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Personality</option>
                    {personalityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
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

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Yes Is *</label>
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

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">No Is *</label>
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

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Question *</label>
                  <Textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    rows={4}
                    placeholder="Enter question in Hindi and English (e.g., आप कुछ करने से पहले हमेशा यह सोचते हैं कि आपके कार्यों का दूसरों पर क्या प्रभाव पड़ेगा। / You always consider how your actions might affect other people before doing something.)"
                  />
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-4">
                <div className="sticky top-4">
                  <Card className="border-2 border-slate-200">
                    <CardHeader className="bg-slate-50">
                      <CardTitle className="text-lg">Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>Personality</span>
                          <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        {formData.question && (
                          <div className="text-base font-medium text-slate-900">
                            {formData.question}
                          </div>
                        )}
                        {(formData.imagePreview || formData.imageUrl) && (
                          <div className="w-full">
                            <img
                              src={formData.imagePreview || formData.imageUrl}
                              alt="Question"
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          {formData.options.map((option, idx) => (
                            <label key={idx} className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
                              <input type="radio" name="preview-option" className="text-blue-600" disabled />
                              <span className="text-sm text-slate-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending || !formData.question || !formData.personality || !formData.yesIs || !formData.noIs}
              >
                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Personality Question</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Personality *</label>
                  <select
                    value={formData.personality}
                    onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Personality</option>
                    {personalityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block flex items-center gap-2">
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload-edit')?.click()}
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
                        id="image-upload-edit"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <label htmlFor="image-upload-edit">
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

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Yes Is *</label>
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

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">No Is *</label>
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

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Question *</label>
                  <Textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    rows={4}
                    placeholder="Enter question in Hindi and English"
                  />
                </div>
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-4">
                <div className="sticky top-4">
                  <Card className="border-2 border-slate-200">
                    <CardHeader className="bg-slate-50">
                      <CardTitle className="text-lg">Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>Personality</span>
                          <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        {formData.question && (
                          <div className="text-base font-medium text-slate-900">
                            {formData.question}
                          </div>
                        )}
                        {(formData.imagePreview || formData.imageUrl) && (
                          <div className="w-full">
                            <img
                              src={formData.imagePreview || formData.imageUrl}
                              alt="Question"
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          {formData.options.map((option, idx) => (
                            <label key={idx} className="flex items-center gap-2 p-2 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">
                              <input type="radio" name="preview-option-edit" className="text-blue-600" disabled />
                              <span className="text-sm text-slate-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => updateMutation.mutate({ id: selectedItem?.id, data: formData })}
                disabled={updateMutation.isPending || !formData.question || !formData.personality || !formData.yesIs || !formData.noIs}
              >
                {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

