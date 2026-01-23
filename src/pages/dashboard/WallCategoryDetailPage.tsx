import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { ArrowLeft, Plus, Loader2, Tag, Trash2, Pencil, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { postsApi, WallCategory } from '../../services/api/posts';
import { cmsApi, Chapter } from '../../services/api/cms';
import { useToast } from '../../contexts/ToastContext';

export default function WallCategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateSubCategoryDialogOpen, setIsCreateSubCategoryDialogOpen] = useState(false);
  const [isEditSubCategoryDialogOpen, setIsEditSubCategoryDialogOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<WallCategory | null>(null);
  const [subCategoryFormData, setSubCategoryFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [editSubCategoryFormData, setEditSubCategoryFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());
  const [isCreateChapterDialogOpen, setIsCreateChapterDialogOpen] = useState(false);
  const [isEditChapterDialogOpen, setIsEditChapterDialogOpen] = useState(false);
  const [selectedSubCategoryForChapter, setSelectedSubCategoryForChapter] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterFormData, setChapterFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    order: '',
  });
  const [editChapterFormData, setEditChapterFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    order: '',
  });

  // Fetch parent category details (only parents to find the selected one)
  const { data: categoriesData } = useQuery<WallCategory[]>({
    queryKey: ['wall-categories', 'parents'],
    queryFn: async () => {
      return postsApi.getWallCategories({ onlyParents: true });
    },
  });

  const allCategories: WallCategory[] = categoriesData || [];
  const selectedCategory = allCategories.find((cat: WallCategory) => cat.id === id);

  // Fetch sub-categories for this category
  const { data: subCategoriesData, isLoading: isLoadingSubCategories } = useQuery<WallCategory[]>({
    queryKey: ['wall-categories', 'sub-categories', id],
    queryFn: async () => {
      if (!id) return [];
      try {
        // Backend returns only sub-categories for this parent
        const allSubCategories = await postsApi.getWallSubCategories(id);
        // Client-side safety filter: ensure only sub-categories with parentCategoryId === id
        const filteredSubCategories = allSubCategories.filter(
          (cat) => cat.parentCategoryId === id
        );
        return filteredSubCategories;
      } catch (error: any) {
        console.error('Error fetching sub-categories:', error);
        return [];
      }
    },
    enabled: !!id,
  });

  const subCategories: WallCategory[] = subCategoriesData || [];

  // Fetch chapter counts for all sub-categories
  const { data: allChaptersData } = useQuery<Chapter[]>({
    queryKey: ['all-chapters', id],
    queryFn: async () => {
      if (!id || subCategories.length === 0) return [];
      // Fetch chapters for all sub-categories
      const chapterPromises = subCategories.map(subCat => 
        cmsApi.getChaptersBySubCategory(subCat.id)
      );
      const allChapters = await Promise.all(chapterPromises);
      return allChapters.flat();
    },
    enabled: !!id && subCategories.length > 0,
  });

  // Create a map of subCategoryId -> chapter count
  const chapterCountMap = useMemo(() => {
    const map = new Map<string, number>();
    if (allChaptersData) {
      subCategories.forEach(subCat => {
        const count = allChaptersData.filter(ch => ch.subCategoryId === subCat.id).length;
        map.set(subCat.id, count);
      });
    }
    return map;
  }, [allChaptersData, subCategories]);

  // Component to display chapters for a sub-category
  const SubCategoryChapters: React.FC<{ subCategoryId: string; onEdit: (chapter: Chapter) => void; onDelete: (chapter: Chapter) => void; onCreate: () => void }> = ({ subCategoryId, onEdit, onDelete, onCreate }) => {
    const { data: chaptersData, isLoading } = useQuery<Chapter[]>({
      queryKey: ['chapters', subCategoryId],
      queryFn: () => cmsApi.getChaptersBySubCategory(subCategoryId),
      enabled: expandedSubCategories.has(subCategoryId),
    });

    const chapters = chaptersData || [];

    // Fetch post counts for each chapter
    const { data: chapterPostCounts } = useQuery<Map<string, number>>({
      queryKey: ['chapter-post-counts', subCategoryId],
      queryFn: async () => {
        if (chapters.length === 0) return new Map();
        const countMap = new Map<string, number>();
        try {
          // Fetch current affairs and general knowledge articles for this sub-category
          const [caResult, gkResult] = await Promise.all([
            cmsApi.getCurrentAffairs({ subCategoryId }).catch(() => ({ data: [] })),
            cmsApi.getGeneralKnowledge({}).catch(() => ({ data: [] })),
          ]);
          const caItems = Array.isArray(caResult) ? caResult : (caResult?.data || []);
          const gkItems = Array.isArray(gkResult) ? gkResult : (gkResult?.data || []);
          const allItems = [...caItems, ...gkItems].filter((item: any) => item.metadata?.subCategoryId === subCategoryId);
          
          // Count articles per chapter
          chapters.forEach(chapter => {
            const count = allItems.filter((item: any) => item.metadata?.chapterId === chapter.id).length;
            countMap.set(chapter.id, count);
          });
        } catch (error) {
          console.error('Error fetching chapter post counts:', error);
        }
        return countMap;
      },
      enabled: expandedSubCategories.has(subCategoryId) && chapters.length > 0,
    });

    if (!expandedSubCategories.has(subCategoryId)) {
      return null;
    }

    if (isLoading) {
      return (
        <div className="ml-14 mt-3 p-4 bg-slate-50 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        </div>
      );
    }

    return (
      <div className="ml-14 mt-3 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-700">Chapters ({chapters.length})</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={onCreate}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Chapter
          </Button>
        </div>
        {chapters.length === 0 ? (
          <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-500 text-center">
            No chapters yet. Click "Add Chapter" to create one.
          </div>
        ) : (
          <div className="space-y-2">
            {chapters
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-slate-900 text-sm">{chapter.name}</h5>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        chapter.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {chapter.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {chapter.order !== undefined && (
                        <span className="text-xs text-slate-500">Order: {chapter.order}</span>
                      )}
                    </div>
                    {chapter.description && (
                      <p className="text-xs text-slate-600 mt-1">{chapter.description}</p>
                    )}
                    {/* Summary for Chapter */}
                    <div className="mt-2 p-2 bg-white rounded border border-slate-200">
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">{chapterPostCounts?.get(chapter.id) || 0}</span> Post{(chapterPostCounts?.get(chapter.id) || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(chapter)}
                      className="text-slate-600 hover:text-slate-900 hover:bg-slate-200 h-7 w-7 p-0"
                      title="Edit chapter"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(chapter)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                      title="Delete chapter"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  const createSubCategoryMutation = useMutation({
    mutationFn: (data: typeof subCategoryFormData) => {
      if (!id) {
        throw new Error('Parent category ID is required');
      }
      // Validate that selectedCategory is actually a parent (not a sub-category)
      if (selectedCategory && selectedCategory.parentCategoryId !== null && selectedCategory.parentCategoryId !== undefined) {
        throw new Error('Cannot create sub-categories under a sub-category. Maximum depth is 2 levels: parent → sub-category.');
      }
      return postsApi.createWallCategory({
        name: data.name,
        description: data.description || undefined,
        categoryFor: selectedCategory?.categoryFor || selectedCategory?.metadata?.categoryFor || undefined,
        parentCategoryId: id, // Ensure parentCategoryId is set to the parent's ID
        isActive: data.status === 'active',
      });
    },
    onSuccess: async () => {
      showToast('Sub-category created successfully', 'success');
      setIsCreateSubCategoryDialogOpen(false);
      setSubCategoryFormData({ name: '', description: '', status: 'active' });
      
      // Invalidate and refetch to get updated counts
      await queryClient.invalidateQueries({ queryKey: ['wall-categories'] });
      await queryClient.refetchQueries({ queryKey: ['wall-categories', 'sub-categories', id] });
      await queryClient.refetchQueries({ queryKey: ['wall-categories', 'parents'] });
    },
    onError: (error: any) => {
      console.error('Error creating sub-category:', error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to create sub-category';
      showToast(message, 'error');
    },
  });

  const deleteSubCategoryMutation = useMutation({
    mutationFn: (subCategoryId: string) => postsApi.deleteWallCategory(subCategoryId),
    onSuccess: async () => {
      showToast('Sub-category deleted successfully', 'success');
      
      // Invalidate and refetch to get updated counts
      await queryClient.invalidateQueries({ queryKey: ['wall-categories'] });
      await queryClient.refetchQueries({ queryKey: ['wall-categories', 'sub-categories', id] });
      await queryClient.refetchQueries({ queryKey: ['wall-categories', 'parents'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to delete sub-category';
      showToast(message, 'error');
    },
  });

  const handleDeleteSubCategory = (subCategory: WallCategory) => {
    const hasPosts = (subCategory.postCount || 0) > 0;
    
    let message = `Are you sure you want to delete "${subCategory.name}"?`;
    if (hasPosts) {
      message += `\n\n⚠️ This sub-category has ${subCategory.postCount} post${subCategory.postCount === 1 ? '' : 's'}. `;
      message += '\n\nIf this sub-category has posts, the deletion will fail and nothing will be removed.';
    }
    
    if (window.confirm(message)) {
      deleteSubCategoryMutation.mutate(subCategory.id);
    }
  };

  const handleCreateSubCategory = () => {
    if (!subCategoryFormData.name.trim()) {
      showToast('Please enter a sub-category name', 'error');
      return;
    }
    createSubCategoryMutation.mutate(subCategoryFormData);
  };

  const editSubCategoryMutation = useMutation({
    mutationFn: async (payload: { id: string; updates: Partial<WallCategory> }) => {
      return postsApi.updateWallCategory(payload.id, payload.updates);
    },
    onSuccess: async () => {
      showToast('Sub-category updated successfully', 'success');
      setIsEditSubCategoryDialogOpen(false);
      setEditingSubCategory(null);
      // Invalidate and refetch to get updated counts
      await queryClient.invalidateQueries({ queryKey: ['wall-categories'] });
      await queryClient.refetchQueries({ queryKey: ['wall-categories', 'sub-categories', id] });
      await queryClient.refetchQueries({ queryKey: ['wall-categories', 'parents'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to update sub-category';
      showToast(message, 'error');
    },
  });

  const openEditSubCategoryDialog = (subCategory: WallCategory) => {
    setEditingSubCategory(subCategory);
    setEditSubCategoryFormData({
      name: subCategory.name || '',
      description: subCategory.description || '',
      status: subCategory.isActive ? 'active' : 'inactive',
    });
    setIsEditSubCategoryDialogOpen(true);
  };

  const handleEditSubCategorySave = () => {
    if (!editingSubCategory) return;
    if (!editSubCategoryFormData.name.trim()) {
      showToast('Please enter a sub-category name', 'error');
      return;
    }

    const updates: Partial<WallCategory> = {};
    if (editSubCategoryFormData.name !== editingSubCategory.name) {
      updates.name = editSubCategoryFormData.name.trim();
    }
    if ((editSubCategoryFormData.description || '') !== (editingSubCategory.description || '')) {
      updates.description = editSubCategoryFormData.description || '';
    }
    const newIsActive = editSubCategoryFormData.status === 'active';
    if (newIsActive !== editingSubCategory.isActive) {
      updates.isActive = newIsActive;
    }

    if (Object.keys(updates).length === 0) {
      showToast('No changes to save', 'info');
      return;
    }

    editSubCategoryMutation.mutate({ id: editingSubCategory.id, updates });
  };

  // Chapter mutations
  const createChapterMutation = useMutation({
    mutationFn: (data: typeof chapterFormData & { subCategoryId: string }) => {
      return cmsApi.createChapter({
        name: data.name,
        description: data.description || undefined,
        subCategoryId: data.subCategoryId,
        isActive: data.status === 'active',
        order: data.order ? parseInt(data.order, 10) : undefined,
      });
    },
    onSuccess: async (_, variables) => {
      showToast('Chapter created successfully', 'success');
      setIsCreateChapterDialogOpen(false);
      setChapterFormData({ name: '', description: '', status: 'active', order: '' });
      setSelectedSubCategoryForChapter(null);
      // Invalidate and refetch to get updated counts
      await queryClient.invalidateQueries({ queryKey: ['chapters', variables.subCategoryId] });
      await queryClient.invalidateQueries({ queryKey: ['all-chapters', id] });
      await queryClient.invalidateQueries({ queryKey: ['chapter-post-counts'] });
      await queryClient.refetchQueries({ queryKey: ['chapters', variables.subCategoryId] });
      await queryClient.refetchQueries({ queryKey: ['all-chapters', id] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to create chapter';
      showToast(message, 'error');
    },
  });

  const updateChapterMutation = useMutation({
    mutationFn: (payload: { id: string; updates: {
      name?: string;
      description?: string;
      isActive?: boolean;
      order?: number;
    } }) => {
      return cmsApi.updateChapter(payload.id, payload.updates);
    },
    onSuccess: async (_, variables) => {
      showToast('Chapter updated successfully', 'success');
      setIsEditChapterDialogOpen(false);
      const subCatId = editingChapter?.subCategoryId;
      setEditingChapter(null);
      if (subCatId) {
        // Invalidate and refetch to get updated counts
        await queryClient.invalidateQueries({ queryKey: ['chapters', subCatId] });
        await queryClient.invalidateQueries({ queryKey: ['all-chapters', id] });
        await queryClient.invalidateQueries({ queryKey: ['chapter-post-counts'] });
        await queryClient.refetchQueries({ queryKey: ['chapters', subCatId] });
        await queryClient.refetchQueries({ queryKey: ['all-chapters', id] });
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to update chapter';
      showToast(message, 'error');
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: (chapterId: string) => cmsApi.deleteChapter(chapterId),
    onSuccess: async (_, chapterId) => {
      showToast('Chapter deleted successfully', 'success');
      const subCatId = editingChapter?.subCategoryId;
      if (subCatId) {
        // Invalidate and refetch to get updated counts
        await queryClient.invalidateQueries({ queryKey: ['chapters', subCatId] });
        await queryClient.invalidateQueries({ queryKey: ['all-chapters', id] });
        await queryClient.invalidateQueries({ queryKey: ['chapter-post-counts'] });
        await queryClient.invalidateQueries({ queryKey: ['wall-categories'] });
        await queryClient.refetchQueries({ queryKey: ['chapters', subCatId] });
        await queryClient.refetchQueries({ queryKey: ['all-chapters', id] });
        await queryClient.refetchQueries({ queryKey: ['wall-categories', 'parents'] });
      }
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to delete chapter';
      showToast(message, 'error');
    },
  });

  const handleCreateChapter = () => {
    if (!chapterFormData.name.trim()) {
      showToast('Please enter a chapter name', 'error');
      return;
    }
    if (!selectedSubCategoryForChapter) {
      showToast('Please select a sub-category', 'error');
      return;
    }
    createChapterMutation.mutate({
      ...chapterFormData,
      subCategoryId: selectedSubCategoryForChapter,
    });
  };

  const handleEditChapter = () => {
    if (!editChapterFormData.name.trim()) {
      showToast('Please enter a chapter name', 'error');
      return;
    }
    if (!editingChapter) return;

    const updates = {
      name: editChapterFormData.name,
      description: editChapterFormData.description || undefined,
      isActive: editChapterFormData.status === 'active',
      order: editChapterFormData.order ? parseInt(editChapterFormData.order, 10) : undefined,
    };

    updateChapterMutation.mutate({ id: editingChapter.id, updates });
  };

  const handleDeleteChapter = (chapter: Chapter) => {
    if (window.confirm(`Are you sure you want to delete "${chapter.name}"?`)) {
      deleteChapterMutation.mutate(chapter.id);
    }
  };

  const openCreateChapterDialog = (subCategoryId: string) => {
    setSelectedSubCategoryForChapter(subCategoryId);
    setChapterFormData({ name: '', description: '', status: 'active', order: '' });
    setIsCreateChapterDialogOpen(true);
  };

  const openEditChapterDialog = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setEditChapterFormData({
      name: chapter.name || '',
      description: chapter.description || '',
      status: chapter.isActive ? 'active' : 'inactive',
      order: chapter.order?.toString() || '',
    });
    setIsEditChapterDialogOpen(true);
  };

  const toggleSubCategoryExpansion = (subCategoryId: string) => {
    const newExpanded = new Set(expandedSubCategories);
    if (newExpanded.has(subCategoryId)) {
      newExpanded.delete(subCategoryId);
    } else {
      newExpanded.add(subCategoryId);
    }
    setExpandedSubCategories(newExpanded);
  };

  if (!selectedCategory) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading category...</p>
          </div>
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
              onClick={() => navigate('/dashboard/wall-categories')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {selectedCategory.name} &gt; Sub-categories
              </h1>
              <p className="text-slate-600 mt-1">
                Manage sub-categories for this parent category
              </p>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => setIsCreateSubCategoryDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Sub-Category
          </Button>
        </div>

        {/* Category Info Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Tag className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedCategory.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedCategory.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedCategory.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  {selectedCategory.description || 'No description'}
                </p>
                {(selectedCategory.categoryFor || selectedCategory.metadata?.categoryFor) && (
                  <p className="text-xs text-slate-500 mb-1">
                    For: {selectedCategory.categoryFor || selectedCategory.metadata?.categoryFor}
                  </p>
                )}
                {/* Summary Section */}
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-1">Summary</p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">{subCategories.length}</span> Sub-Category{subCategories.length !== 1 ? 'ies' : ''} |{' '}
                    <span className="font-medium">{allChaptersData?.length || 0}</span> Chapter{(allChaptersData?.length || 0) !== 1 ? 's' : ''} |{' '}
                    <span className="font-medium">{selectedCategory.postCount || 0}</span> Post{(selectedCategory.postCount || 0) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sub-Categories List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Sub-Categories</CardTitle>
            <CardDescription>
              {isLoadingSubCategories 
                ? 'Loading sub-categories...'
                : subCategories.length === 0 
                  ? 'No sub-categories yet. Create one to get started.'
                  : `${subCategories.length} sub-categor${subCategories.length === 1 ? 'y' : 'ies'}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSubCategories ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
              </div>
            ) : subCategories.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Tag className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="text-sm">No sub-categories found</p>
                <p className="text-xs mt-1">Click "Create Sub-Category" to add one</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subCategories.map((subCategory: WallCategory) => (
                  <div key={subCategory.id}>
                    <div
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSubCategoryExpansion(subCategory.id)}
                        className="p-1 h-8 w-8"
                        title={expandedSubCategories.has(subCategory.id) ? 'Collapse chapters' : 'Expand chapters'}
                      >
                        {expandedSubCategories.has(subCategory.id) ? (
                          <ChevronDown className="h-4 w-4 text-slate-600" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-600" />
                        )}
                      </Button>
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md">
                        <Tag className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-slate-900">{subCategory.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            subCategory.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {subCategory.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {subCategory.description || 'No description'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                          <span>{subCategory.postCount || 0} posts</span>
                          <span>{chapterCountMap.get(subCategory.id) || 0} chapters</span>
                        </div>
                        {/* Summary for Sub-Category */}
                        <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200">
                          <p className="text-xs text-slate-600">
                            <span className="font-medium">{chapterCountMap.get(subCategory.id) || 0}</span> Chapter{(chapterCountMap.get(subCategory.id) || 0) !== 1 ? 's' : ''} |{' '}
                            <span className="font-medium">{subCategory.postCount || 0}</span> Post{(subCategory.postCount || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dashboard/wall-categories/${id}/sub-categories/${subCategory.id}`)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="View articles in this sub-category"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditSubCategoryDialog(subCategory)}
                          className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          disabled={editSubCategoryMutation.isPending}
                          title="Edit sub-category"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubCategory(subCategory)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deleteSubCategoryMutation.isPending}
                          title="Delete sub-category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <SubCategoryChapters
                      subCategoryId={subCategory.id}
                      onEdit={openEditChapterDialog}
                      onDelete={handleDeleteChapter}
                      onCreate={() => openCreateChapterDialog(subCategory.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Sub-Category Dialog */}
        <Dialog open={isCreateSubCategoryDialogOpen} onOpenChange={setIsCreateSubCategoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Sub-Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Parent Category</label>
                <Input
                  value={selectedCategory.name}
                  disabled
                  className="mt-1 bg-slate-50"
                />
                <p className="text-xs text-slate-500 mt-1">This sub-category will be created under "{selectedCategory.name}"</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name *</label>
                <Input
                  placeholder="Enter sub-category name"
                  value={subCategoryFormData.name}
                  onChange={(e) => setSubCategoryFormData({ ...subCategoryFormData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Input
                  placeholder="Enter sub-category description (optional)"
                  value={subCategoryFormData.description}
                  onChange={(e) => setSubCategoryFormData({ ...subCategoryFormData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status *</label>
                <select
                  value={subCategoryFormData.status}
                  onChange={(e) => setSubCategoryFormData({ ...subCategoryFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateSubCategoryDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateSubCategory} 
                className="bg-blue-600"
                disabled={createSubCategoryMutation.isPending}
              >
                {createSubCategoryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Sub-Category'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Sub-Category Dialog */}
        <Dialog open={isEditSubCategoryDialogOpen} onOpenChange={setIsEditSubCategoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Sub-Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Parent Category</label>
                <Input
                  value={selectedCategory.name}
                  disabled
                  className="mt-1 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name *</label>
                <Input
                  placeholder="Enter sub-category name"
                  value={editSubCategoryFormData.name}
                  onChange={(e) =>
                    setEditSubCategoryFormData({ ...editSubCategoryFormData, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Input
                  placeholder="Enter sub-category description (optional)"
                  value={editSubCategoryFormData.description}
                  onChange={(e) =>
                    setEditSubCategoryFormData({
                      ...editSubCategoryFormData,
                      description: e.target.value,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status *</label>
                <select
                  value={editSubCategoryFormData.status}
                  onChange={(e) =>
                    setEditSubCategoryFormData({
                      ...editSubCategoryFormData,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditSubCategoryDialogOpen(false);
                  setEditingSubCategory(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSubCategorySave}
                className="bg-blue-600"
                disabled={editSubCategoryMutation.isPending}
              >
                {editSubCategoryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Chapter Dialog */}
        <Dialog open={isCreateChapterDialogOpen} onOpenChange={setIsCreateChapterDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Chapter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Sub-Category</label>
                <Input
                  value={subCategories.find(sc => sc.id === selectedSubCategoryForChapter)?.name || ''}
                  disabled
                  className="mt-1 bg-slate-50"
                />
                <p className="text-xs text-slate-500 mt-1">
                  This chapter will be created under "{subCategories.find(sc => sc.id === selectedSubCategoryForChapter)?.name}"
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name *</label>
                <Input
                  placeholder="Enter chapter name"
                  value={chapterFormData.name}
                  onChange={(e) => setChapterFormData({ ...chapterFormData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Input
                  placeholder="Enter chapter description (optional)"
                  value={chapterFormData.description}
                  onChange={(e) => setChapterFormData({ ...chapterFormData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Order</label>
                <Input
                  type="number"
                  placeholder="Order (optional, auto-assigned if not provided)"
                  value={chapterFormData.order}
                  onChange={(e) => setChapterFormData({ ...chapterFormData, order: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Lower numbers appear first. If not provided, the next available order will be used.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status *</label>
                <select
                  value={chapterFormData.status}
                  onChange={(e) => setChapterFormData({ ...chapterFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateChapterDialogOpen(false);
                setSelectedSubCategoryForChapter(null);
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateChapter}
                className="bg-blue-600"
                disabled={createChapterMutation.isPending}
              >
                {createChapterMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Chapter'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Chapter Dialog */}
        <Dialog open={isEditChapterDialogOpen} onOpenChange={setIsEditChapterDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Chapter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Sub-Category</label>
                <Input
                  value={subCategories.find(sc => sc.id === editingChapter?.subCategoryId)?.name || ''}
                  disabled
                  className="mt-1 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Name *</label>
                <Input
                  placeholder="Enter chapter name"
                  value={editChapterFormData.name}
                  onChange={(e) => setEditChapterFormData({ ...editChapterFormData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Input
                  placeholder="Enter chapter description (optional)"
                  value={editChapterFormData.description}
                  onChange={(e) => setEditChapterFormData({ ...editChapterFormData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Order</label>
                <Input
                  type="number"
                  placeholder="Order"
                  value={editChapterFormData.order}
                  onChange={(e) => setEditChapterFormData({ ...editChapterFormData, order: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Lower numbers appear first.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Status *</label>
                <select
                  value={editChapterFormData.status}
                  onChange={(e) => setEditChapterFormData({ ...editChapterFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditChapterDialogOpen(false);
                  setEditingChapter(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditChapter}
                className="bg-blue-600"
                disabled={updateChapterMutation.isPending}
              >
                {updateChapterMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
