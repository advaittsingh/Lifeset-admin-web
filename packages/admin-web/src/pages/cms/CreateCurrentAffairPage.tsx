import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ArrowLeft, Save, Eye, Newspaper, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsApi } from '../../services/api/cms';
import { postsApi } from '../../services/api/posts';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';

export default function CreateCurrentAffairPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newSubCategory, setNewSubCategory] = useState('');
  const [subCategoryOptions, setSubCategoryOptions] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fullArticle: '',
    categoryId: '',
    subCategoryId: '',
    section: '',
    country: '',
    imageUrl: '',
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['wall-categories'],
    queryFn: () => postsApi.getWallCategories(),
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);

  useEffect(() => {
    const subs = new Set<string>();
    categories?.forEach((cat: any) => {
      if (Array.isArray(cat?.subCategories)) {
        cat.subCategories.forEach((sub: any) => {
          const label =
            typeof sub === 'string'
              ? sub
              : sub?.name || sub?.label || sub?.value || sub?.title;
          if (label) subs.add(label);
        });
      }
      const metaSub = cat?.metadata?.subCategory;
      if (typeof metaSub === 'string' && metaSub.trim()) {
        subs.add(metaSub.trim());
      }
    });
    setSubCategoryOptions(Array.from(subs));
  }, [categories]);

  // Calculate word count for description
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const descriptionWordCount = getWordCount(formData.description);
  const isDescriptionValid = descriptionWordCount >= 200 && descriptionWordCount <= 300;

  const createCategoryMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => postsApi.createWallCategory(data),
    onSuccess: (createdCategory) => {
      queryClient.invalidateQueries({ queryKey: ['wall-categories'] });
      const created = Array.isArray(createdCategory) ? createdCategory[0] : createdCategory;
      const createdId = created?.id;
      const createdName = created?.name || newCategoryName;
      setFormData(prev => ({
        ...prev,
        categoryId: createdId || prev.categoryId,
        // keep sub-category choice intact
      }));
      if (createdName) {
        showToast(`Category "${createdName}" created`, 'success');
      } else {
        showToast('Category created successfully', 'success');
      }
      setIsCategoryDialogOpen(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
    },
    onError: () => showToast('Failed to create category', 'error'),
  });

  // Fetch existing item if editing
  const { data: existingItem, isLoading: isLoadingItem } = useQuery({
    queryKey: ['current-affair', id],
    queryFn: async () => {
      const items = await cmsApi.getCurrentAffairs({});
      return Array.isArray(items) ? items.find((item: any) => item.id === id) : null;
    },
    enabled: isEditMode && !!id,
  });

  // Update form when existing item loads
  useEffect(() => {
    if (existingItem && isEditMode) {
      const metadata = existingItem.metadata || {};
      setFormData({
        title: existingItem.title || '',
        description: existingItem.description || '',
        fullArticle: metadata.fullArticle || '',
        categoryId: existingItem.categoryId || '',
        subCategoryId: metadata.subCategoryId || '',
        section: metadata.section || '',
        country: metadata.country || '',
        imageUrl: existingItem.images?.[0] || '',
        imageFile: null,
        imagePreview: existingItem.images?.[0] || null,
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
    mutationFn: (data: typeof formData) => {
      const imageUrl = data.imagePreview || data.imageUrl;
      return cmsApi.createCurrentAffair({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId || undefined,
        images: imageUrl ? [imageUrl] : [],
        metadata: {
          fullArticle: data.fullArticle,
          subCategoryId: data.subCategoryId,
          section: data.section,
          country: data.country,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-affairs'] });
      showToast('Current affair created successfully', 'success');
      navigate('/cms/current-affairs');
    },
    onError: () => showToast('Failed to create current affair', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const imageUrl = data.imagePreview || data.imageUrl;
      return cmsApi.updateCurrentAffair(id!, {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId || undefined,
        images: imageUrl ? [imageUrl] : [],
        metadata: {
          fullArticle: data.fullArticle,
          subCategoryId: data.subCategoryId,
          section: data.section,
          country: data.country,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-affairs'] });
      queryClient.invalidateQueries({ queryKey: ['current-affair', id] });
      showToast('Current affair updated successfully', 'success');
      navigate('/cms/current-affairs');
    },
    onError: () => showToast('Failed to update current affair', 'error'),
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
    if (!isDescriptionValid) {
      showToast('Description must be between 200-300 words', 'error');
      return;
    }

    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === '__create__') {
      setIsCategoryDialogOpen(true);
      return;
    }
    setFormData(prev => ({ ...prev, categoryId: value }));
  };

  const handleAddSubCategory = () => {
    const trimmed = newSubCategory.trim();
    if (!trimmed) return;
    setSubCategoryOptions(prev => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setFormData(prev => ({ ...prev, subCategoryId: trimmed }));
    setNewSubCategory('');
    showToast('Sub-category added', 'success');
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
              onClick={() => navigate('/cms/current-affairs')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Current Affairs
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isEditMode ? 'Edit Current Affair' : 'Create Current Affair'}
              </h1>
              <p className="text-slate-600 mt-1">
                {isEditMode ? 'Update current affair details' : 'Add a new current affair article'}
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || !isDescriptionValid}
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
                {isEditMode ? 'Update Article' : 'Create Article'}
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
                  <Newspaper className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Article Details</CardTitle>
                  <CardDescription className="text-slate-600">Enter current affair information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Title */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Title *</label>
                <Input
                  placeholder="Enter article title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Description (200-300 words) */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">
                  Description * (200-300 words)
                </label>
                <Textarea
                  placeholder="Write a brief description (200-300 words)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 min-h-[150px]"
                  rows={6}
                  maxLength={2000}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.description.split(/\s+/).filter(Boolean).length} words (recommended: 200-300)
                </p>
              </div>

              {/* Full Article */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Full Article</label>
                <Textarea
                  placeholder="Write the complete article content..."
                  value={formData.fullArticle}
                  onChange={(e) => setFormData({ ...formData, fullArticle: e.target.value })}
                  className="mt-1 min-h-[300px]"
                  rows={15}
                />
                <p className="text-xs text-slate-500 mt-1">Complete article content (optional)</p>
              </div>

              {/* Category Selection */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Category *</label>
              <div className="flex items-center gap-2">
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  <option value="__create__">+ Create New Category</option>
                </select>
                <Button variant="outline" size="sm" onClick={() => setIsCategoryDialogOpen(true)}>
                  + Add
                </Button>
              </div>
              </div>

              {/* Sub-Category */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Sub-Category</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="New sub-category"
                    value={newSubCategory}
                    onChange={(e) => setNewSubCategory(e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={handleAddSubCategory} disabled={!newSubCategory.trim()}>
                    Add
                  </Button>
                </div>
                <select
                  value={formData.subCategoryId}
                  onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select Sub Category</option>
                  {subCategoryOptions.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value={formData.subCategoryId || ''}>
                    {formData.subCategoryId ? `Keep: ${formData.subCategoryId}` : 'Custom'}
                  </option>
                </select>
              </div>
              </div>

              {/* Section */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Section</label>
                <Input
                  placeholder="Enter section"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Country */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Country</label>
                <Input
                  placeholder="Enter country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Article Image
                </label>
                
                {formData.imagePreview || formData.imageUrl ? (
                  <div className="mt-2 space-y-3">
                    <div className="relative">
                      <img
                        src={formData.imagePreview || formData.imageUrl}
                        alt="Article preview"
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
                  <CardDescription className="text-slate-600">See how your article will appear</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Preview Container */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-dashed border-slate-300">
                  <div className="text-center mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Article Preview
                    </p>
                    <div className="w-full h-px bg-slate-200 mb-4"></div>
                  </div>

                  {/* Article Preview Card */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                    {(formData.imagePreview || formData.imageUrl) && (
                      <div className="w-full h-48 bg-slate-100 overflow-hidden">
                        <img
                          src={formData.imagePreview || formData.imageUrl}
                          alt="Article"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4 space-y-3">
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
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Newspaper className="h-3 w-3" />
                          <span>Current Affairs</span>
                          <span>•</span>
                          <span>{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Info */}
                  <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>Preview Note:</strong> This is how the current affair article will appear to users on the platform.
                    </p>
                  </div>
                </div>

                {/* Preview Status */}
                <div className="space-y-2">
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
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-sm font-medium text-slate-700">Image Status</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      formData.imagePreview || formData.imageUrl
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {formData.imagePreview || formData.imageUrl ? '✓ Image Added' : '○ Optional'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Name</label>
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Description</label>
              <Textarea
                placeholder="Optional description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                createCategoryMutation.mutate({
                  name: newCategoryName,
                  description: newCategoryDescription,
                })
              }
              disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {createCategoryMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

