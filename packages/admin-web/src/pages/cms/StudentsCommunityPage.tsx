import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { CheckCircle, XCircle, Trash2, Loader2, Users } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';
import { useToast } from '../../contexts/ToastContext';

export default function StudentsCommunityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModerateDialogOpen, setIsModerateDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [moderateAction, setModerateAction] = useState<'approve' | 'reject' | 'delete'>('approve');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['community-posts', searchTerm],
    queryFn: () => cmsApi.getCommunityPosts({ search: searchTerm || undefined }),
  });

  const posts = Array.isArray(data) ? data : (data?.data || []);

  const moderateMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' | 'delete' }) =>
      cmsApi.moderateCommunityPost(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      showToast('Post moderated successfully', 'success');
      setIsModerateDialogOpen(false);
    },
    onError: () => showToast('Failed to moderate post', 'error'),
  });

  const handleModerate = (post: any, action: 'approve' | 'reject' | 'delete') => {
    setSelectedPost(post);
    setModerateAction(action);
    setIsModerateDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Students Community</h1>
            <p className="text-slate-600 mt-1">Moderate community posts</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Community Posts</CardTitle>
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No posts found</div>
                ) : (
                  posts.map((post: any) => (
                    <Card key={post.id} className="border-0 shadow-lg">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-4 w-4 text-blue-600" />
                              <h3 className="font-semibold">{post.title}</h3>
                              <span className={`px-2 py-1 rounded text-xs ${
                                post.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {post.isActive ? 'Approved' : 'Pending'}
                              </span>
                            </div>
                            <p className="text-slate-600 mb-2">{post.description}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span>Likes: {post._count?.likes || 0}</span>
                              <span>Comments: {post._count?.comments || 0}</span>
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!post.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200"
                                onClick={() => handleModerate(post, 'approve')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200"
                              onClick={() => handleModerate(post, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleModerate(post, 'delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isModerateDialogOpen} onOpenChange={setIsModerateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {moderateAction === 'approve' && 'Approve Post'}
                {moderateAction === 'reject' && 'Reject Post'}
                {moderateAction === 'delete' && 'Delete Post'}
              </DialogTitle>
            </DialogHeader>
            <p className="text-slate-600">
              Are you sure you want to {moderateAction} "{selectedPost?.title}"?
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModerateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className={moderateAction === 'delete' ? 'bg-red-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}
                onClick={() => moderateMutation.mutate({ id: selectedPost?.id, action: moderateAction })}
                disabled={moderateMutation.isPending}
              >
                {moderateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  moderateAction.charAt(0).toUpperCase() + moderateAction.slice(1)
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

