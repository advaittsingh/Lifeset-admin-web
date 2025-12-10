import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Loader2, AlertCircle, Newspaper } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';
import { useToast } from '../../contexts/ToastContext';

export default function CurrentAffairsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['current-affairs', searchTerm],
    queryFn: async () => {
      try {
        const result = await cmsApi.getCurrentAffairs({ search: searchTerm || undefined });
        // Handle different response structures
        if (Array.isArray(result)) {
          return result;
        }
        if (result?.data && Array.isArray(result.data)) {
          return result.data;
        }
        // If result is an object with nested data
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          return [];
        }
        return [];
      } catch (err: any) {
        console.error('Error fetching current affairs:', err);
        // Return empty array on error instead of throwing
        return [];
      }
    },
  });

  const items = Array.isArray(data) ? data : [];


  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsApi.deleteCurrentAffair(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-affairs'] });
      showToast('Current affair deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
    },
    onError: () => showToast('Failed to delete current affair', 'error'),
  });

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p>Failed to load current affairs</p>
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
            <h1 className="text-3xl font-bold text-slate-900">Current Affairs</h1>
            <p className="text-slate-600 mt-1">Manage current affairs content</p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => navigate('/cms/current-affairs/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Current Affairs</CardTitle>
              <Input
                placeholder="Search..."
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
                {items.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No current affairs found</div>
                ) : (
                  items.map((item: any) => (
                    <Card key={item.id} className="border-0 shadow-lg">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Newspaper className="h-4 w-4 text-blue-600" />
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                            </div>
                            <p className="text-slate-600 mb-2 line-clamp-2">{item.description}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/cms/current-affairs/edit/${item.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsDeleteDialogOpen(true);
                              }}
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


        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Current Affair</DialogTitle>
            </DialogHeader>
            <p className="text-slate-600">
              Are you sure you want to delete "{selectedItem?.title}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(selectedItem?.id)}
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

