import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Save, Eye, HelpCircle, Loader2, CheckCircle2, XCircle, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsApi, Chapter } from '../../services/api/cms';
import { postsApi } from '../../services/api/posts';

export default function CreateMcqPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    categoryId: '',
    subCategoryId: '',
    chapterId: '',
    explanation: '',
    explanationImageFile: null as File | null,
    explanationImagePreview: null as string | null,
    explanationImageUrl: '',
    articleId: '', // Link to article
  });

  // Fetch categories (Wall parent categories)
  const { data: categoriesData } = useQuery({
    queryKey: ['wall-categories'],
    queryFn: () => postsApi.getWallCategories(),
  });

  const categories = categoriesData || [];

  // Fetch sub-categories for the selected category
  const { data: subCategoriesData } = useQuery({
    queryKey: ['wall-subcategories', formData.categoryId],
    queryFn: () =>
      formData.categoryId ? postsApi.getWallSubCategories(formData.categoryId) : [],
    enabled: !!formData.categoryId,
  });

  const subCategories = subCategoriesData || [];

  // Fetch chapters for the selected sub-category
  const { data: chaptersData } = useQuery<Chapter[]>({
    queryKey: ['chapters', formData.subCategoryId],
    queryFn: () =>
      formData.subCategoryId ? cmsApi.getChaptersBySubCategory(formData.subCategoryId) : [],
    enabled: !!formData.subCategoryId,
  });

  const chapters = chaptersData || [];

  // Pre-fill category from URL params (from General Knowledge/Current Affairs page)
  useEffect(() => {
    if (!isEditMode) {
      const articleIdParam = searchParams.get('articleId');
      const categoryParam = searchParams.get('category');
      const subCategoryParam = searchParams.get('subCategory');
      const sectionParam = searchParams.get('section');
      const countryParam = searchParams.get('country');
      const categoryIdParam = searchParams.get('categoryId');
      const subCategoryIdParam = searchParams.get('subCategoryId');
      const chapterIdParam = searchParams.get('chapterId');

      if (categoryIdParam) {
        setFormData(prev => ({ ...prev, categoryId: categoryIdParam }));
      }
      if (subCategoryIdParam) {
        setFormData(prev => ({ ...prev, subCategoryId: subCategoryIdParam }));
      }
      if (chapterIdParam) {
        setFormData(prev => ({ ...prev, chapterId: chapterIdParam }));
      }
      if (articleIdParam) {
        setFormData(prev => ({ ...prev, articleId: articleIdParam }));
      }

      // Pre-fill question with context if available
      if (categoryParam || subCategoryParam || sectionParam || countryParam) {
        const contextParts: string[] = [];
        if (categoryParam) contextParts.push(`Category: ${categoryParam}`);
        if (subCategoryParam) contextParts.push(`Sub Category: ${subCategoryParam}`);
        if (sectionParam) contextParts.push(`Section: ${sectionParam}`);
        if (countryParam) contextParts.push(`Country: ${countryParam}`);
        
        if (contextParts.length > 0 && !formData.question) {
          setFormData(prev => ({
            ...prev,
            question: `Question related to ${contextParts.join(', ')}:\n\n`,
          }));
        }
      }
    }
  }, [searchParams, categories, isEditMode]);

  // Fetch existing question if editing
  const { data: existingQuestion, isLoading: isLoadingQuestion } = useQuery({
    queryKey: ['mcq-question', id],
    queryFn: async () => {
      const questions = await cmsApi.getMcqQuestions({});
      const allQuestions = Array.isArray(questions) ? questions : (questions?.data || []);
      return allQuestions.find((q: any) => q.id === id);
    },
    enabled: isEditMode && !!id,
  });

  // Update form when existing question loads
  useEffect(() => {
    if (existingQuestion && isEditMode) {
      const metadata = existingQuestion.metadata || {};
      setFormData({
        question: existingQuestion.question || '',
        options: existingQuestion.options?.map((opt: any) => opt.text || opt) || ['', '', '', ''],
        correctAnswer: existingQuestion.correctAnswer || 0,
        categoryId: existingQuestion.categoryId || '',
        subCategoryId: metadata.subCategoryId || '',
        chapterId: metadata.chapterId || '',
        explanation: existingQuestion.explanation || '',
        explanationImageFile: null,
        explanationImagePreview: existingQuestion.explanationImage || null,
        explanationImageUrl: existingQuestion.explanationImage || '',
        articleId: metadata.articleId || existingQuestion.articleId || '',
      });
    }
  }, [existingQuestion, isEditMode]);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const explanationImage = data.explanationImagePreview || data.explanationImageUrl;
      return cmsApi.createMcqQuestion({
        question: data.question,
        options: data.options.map((opt, idx) => ({
          text: opt,
          isCorrect: idx === data.correctAnswer,
        })),
        correctAnswer: data.correctAnswer,
        categoryId: data.categoryId || undefined,
        explanation: data.explanation || undefined,
        explanationImage: explanationImage || undefined,
        articleId: data.articleId || undefined, // Link to article
        metadata: {
          articleId: data.articleId,
          subCategoryId: data.subCategoryId || undefined,
          chapterId: data.chapterId || undefined,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcq-questions'] });
      showToast('MCQ question created successfully', 'success');
      navigate('/cms/mcq');
    },
    onError: () => showToast('Failed to create MCQ question', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const explanationImage = data.explanationImagePreview || data.explanationImageUrl;
      return cmsApi.updateMcqQuestion(id!, {
        question: data.question,
        options: data.options.map((opt, idx) => ({
          text: opt,
          isCorrect: idx === data.correctAnswer,
        })),
        correctAnswer: data.correctAnswer,
        categoryId: data.categoryId || undefined,
        explanation: data.explanation || undefined,
        explanationImage: explanationImage || undefined,
        metadata: {
          articleId: data.articleId || undefined,
          subCategoryId: data.subCategoryId || undefined,
          chapterId: data.chapterId || undefined,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcq-questions'] });
      queryClient.invalidateQueries({ queryKey: ['mcq-question', id] });
      showToast('MCQ question updated successfully', 'success');
      navigate('/cms/mcq');
    },
    onError: () => showToast('Failed to update MCQ question', 'error'),
  });

  const handleSubmit = () => {
    if (!formData.question.trim()) {
      showToast('Please enter a question', 'error');
      return;
    }
    if (formData.options.filter(opt => opt.trim()).length < 2) {
      showToast('Please provide at least 2 options', 'error');
      return;
    }
    if (formData.correctAnswer < 0 || formData.correctAnswer >= formData.options.length) {
      showToast('Please select a valid correct answer', 'error');
      return;
    }

    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  // Handle explanation image upload
  const handleExplanationImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
          explanationImageFile: file,
          explanationImagePreview: reader.result as string,
          explanationImageUrl: '',
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeExplanationImage = () => {
    setFormData(prev => ({
      ...prev,
      explanationImageFile: null,
      explanationImagePreview: null,
      explanationImageUrl: '',
    }));
  };

  if (isLoadingQuestion && isEditMode) {
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
              onClick={() => navigate('/cms/mcq')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to MCQ
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditMode ? 'Edit MCQ Question' : 'Create MCQ Question'}
              </h1>
              <p className="text-slate-600 mt-1">
                {isEditMode ? 'Update MCQ question details' : 'Add a new multiple choice question'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
          >
            {(createMutation.isPending || updateMutation.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Update Question' : 'Create Question'}
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
                  <HelpCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Question Details</CardTitle>
                  <CardDescription className="text-slate-600">Enter MCQ question information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Category and Basic Information */}
              <div className="grid grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      categoryId: e.target.value,
                      subCategoryId: '', // Reset sub-category when category changes
                      chapterId: '', // Reset chapter when category changes
                    })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub Category */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Sub Category</label>
                  <select
                    value={formData.subCategoryId}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      subCategoryId: e.target.value,
                      chapterId: '', // Reset chapter when sub-category changes
                    })}
                    disabled={!formData.categoryId}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a sub-category</option>
                    {subCategories.map((subCat: any) => (
                      <option key={subCat.id} value={subCat.id}>
                        {subCat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chapter */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Chapter</label>
                  <select
                    value={formData.chapterId}
                    onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                    disabled={!formData.subCategoryId}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a chapter</option>
                    {chapters.map((chapter: Chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Question *</label>
                <Textarea
                  placeholder="Enter the question..."
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="mt-1 min-h-[100px]"
                  rows={4}
                />
              </div>

              {/* Options */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Answer Options *</label>
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        formData.correctAnswer === index
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <Input
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant={formData.correctAnswer === index ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFormData({ ...formData, correctAnswer: index })}
                        className={formData.correctAnswer === index ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                      >
                        {formData.correctAnswer === index ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">Click the checkmark to mark the correct answer</p>
              </div>

              {/* Explanation */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Explanation (Optional)</label>
                <Textarea
                  placeholder="Explain why this is the correct answer..."
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="mt-1 min-h-[80px]"
                  rows={4}
                />
                
                {/* Explanation Image Upload */}
                <div className="mt-4">
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Explanation Image (Optional)</label>
                  {formData.explanationImagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={formData.explanationImagePreview}
                        alt="Explanation preview"
                        className="max-w-full h-auto max-h-64 rounded-lg border border-slate-300"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeExplanationImage}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleExplanationImageUpload}
                        className="hidden"
                        id="explanation-image-upload"
                      />
                      <label
                        htmlFor="explanation-image-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <ImageIcon className="h-8 w-8 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          Click to upload an image or drag and drop
                        </span>
                        <span className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</span>
                      </label>
                    </div>
                  )}
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
                  <CardDescription className="text-slate-600">See how your question will appear</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Preview Container */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-dashed border-slate-300">
                  <div className="text-center mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      MCQ Question Preview
                    </p>
                    <div className="w-full h-px bg-slate-200 mb-4"></div>
                  </div>

                  {/* Question Preview Card */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 p-6 space-y-4">
                    {formData.question ? (
                      <>
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <HelpCircle className="h-5 w-5 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-600 uppercase">Question</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-4">{formData.question}</h3>
                        </div>

                        <div className="space-y-2">
                          {formData.options.map((option, index) => {
                            if (!option.trim()) return null;
                            const isCorrect = formData.correctAnswer === index;
                            return (
                              <div
                                key={index}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-300'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                    isCorrect
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-slate-300 text-slate-600'
                                  }`}>
                                    {String.fromCharCode(65 + index)}
                                  </div>
                                  <span className="text-sm text-slate-700 flex-1">{option}</span>
                                  {isCorrect && (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {formData.explanation && (
                          <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-semibold text-slate-600">Explanation</span>
                            </div>
                            <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                              {formData.explanation}
                            </p>
                          </div>
                        )}

                        {formData.options.filter(opt => opt.trim()).length === 0 && (
                          <div className="text-center py-8 text-slate-400">
                            <p className="text-sm">No options added yet</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 font-medium">No question entered</p>
                        <p className="text-xs text-slate-400 mt-1">Fill in the form to see preview</p>
                      </div>
                    )}
                  </div>

                  {/* Preview Info */}
                  <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>Preview Note:</strong> This is how the MCQ question will appear to users. The correct answer is highlighted in green.
                    </p>
                  </div>
                </div>

                {/* Preview Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Question Status</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      formData.question
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {formData.question ? '✓ Question Set' : '⚠ Required'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Options Status</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      formData.options.filter(opt => opt.trim()).length >= 2
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {formData.options.filter(opt => opt.trim()).length >= 2
                        ? `✓ ${formData.options.filter(opt => opt.trim()).length} Options`
                        : '⚠ Need 2+ Options'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Correct Answer</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      formData.correctAnswer >= 0 && formData.options[formData.correctAnswer]?.trim()
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {formData.correctAnswer >= 0 && formData.options[formData.correctAnswer]?.trim()
                        ? `✓ Option ${String.fromCharCode(65 + formData.correctAnswer)}`
                        : '⚠ Not Set'}
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

