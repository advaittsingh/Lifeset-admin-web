import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { FileText, Plus, Eye, Heart, MessageSquare, Bookmark, Loader2, Trash2, Edit, X, AlertCircle } from 'lucide-react';
import { postsApi, Post } from '../../services/api/posts';
import { useToast } from '../../contexts/ToastContext';

export default function PostsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [postTypeFilter, setPostTypeFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', postType: 'GENERAL' });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: postsData, isLoading, error } = useQuery({
    queryKey: ['posts', searchTerm, postTypeFilter],
    queryFn: async () => {
      try {
        const result = await postsApi.getAll({
          search: searchTerm || undefined,
          postType: postTypeFilter !== 'all' ? postTypeFilter : undefined,
        });
        return result;
      } catch (err: any) {
        console.error('Error fetching posts:', err);
        throw err;
      }
    },
  });

  // Handle response structure: result is { data: posts[], pagination: {...} }
  const posts = Array.isArray(postsData) ? postsData : (postsData?.data || []);

  const createMutation = useMutation({
    mutationFn: (data: { title: string; description: string; postType: string }) => postsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showToast('Post created successfully', 'success');
      setIsCreateDialogOpen(false);
      setFormData({ title: '', description: '', postType: 'GENERAL' });
    },
    onError: () => showToast('Failed to create post', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Post> }) => postsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showToast('Post updated successfully', 'success');
      setIsEditDialogOpen(false);
    },
    onError: () => showToast('Failed to update post', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showToast('Post deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
    },
    onError: () => showToast('Failed to delete post', 'error'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => postsApi.toggleActive(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showToast('Post status updated', 'success');
    },
    onError: () => showToast('Failed to update post status', 'error'),
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (selectedPost) {
      updateMutation.mutate({ id: selectedPost.id, data: formData });
    }
  };

  const handleDelete = () => {
    if (selectedPost) {
      deleteMutation.mutate(selectedPost.id);
    }
  };

  if (error) {
    const errorMessage = (error as any)?.response?.data?.message || 
                         (error as any)?.message || 
                         'Failed to load posts. Please try again.';
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Failed to load posts</p>
                  <p className="text-sm mt-1">{errorMessage}</p>
                  {(error as any)?.response?.status === 401 && (
                    <p className="text-xs mt-2">Please check your authentication.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Posts</h1>
            <p className="text-slate-600 mt-1">Manage all platform posts and content</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Post
          </Button>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">All Posts</CardTitle>
                <CardDescription>Search and manage posts</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <select
                  value={postTypeFilter}
                  onChange={(e) => setPostTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="JOB">Job</option>
                  <option value="EXAM">Exam</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid gap-6">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No posts found
                  </div>
                ) : (
                  posts.map((post: Post) => (
                    <Card key={post.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {post.postType}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                post.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {post.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                            <CardDescription>{new Date(post.createdAt).toLocaleDateString()}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-600 mb-4 line-clamp-2">{post.description}</p>
                        <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span>{(post as any).views || 0} views</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            <span>{(post as any)._count?.likes || 0} likes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>{(post as any)._count?.comments || 0} comments</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bookmark className="h-4 w-4" />
                            <span>{(post as any)._count?.bookmarks || 0} bookmarks</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPost(post);
                              setFormData({ title: post.title, description: post.description, postType: post.postType });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleActiveMutation.mutate({ id: post.id, isActive: !post.isActive })}
                            disabled={toggleActiveMutation.isPending}
                          >
                            {post.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedPost(post);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription>Add a new post to the platform</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter post description"
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Type</label>
                <select
                  value={formData.postType}
                  onChange={(e) => setFormData({ ...formData, postType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GENERAL">General</option>
                  <option value="JOB">Job</option>
                  <option value="EXAM">Exam</option>
                  <option value="QUIZ">Quiz</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleCreate}
                disabled={createMutation.isPending || !formData.title || !formData.description}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Post'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
              <DialogDescription>Update post information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter post description"
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={handleEdit}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Post'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedPost?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
