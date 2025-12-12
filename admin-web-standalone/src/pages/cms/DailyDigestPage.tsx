import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Loader2, Calendar } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';

export default function DailyDigestPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['daily-digests', searchTerm],
    queryFn: () => cmsApi.getDailyDigests({ search: searchTerm || undefined }),
  });

  const digests = Array.isArray(data) ? data : (data?.data || []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Daily Digest</h1>
            <p className="text-slate-600 mt-1">Create and manage daily digests</p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => navigate('/cms/daily-digest/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Digest
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily Digests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {digests.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No digests found</div>
                ) : (
                  digests.map((digest: any) => (
                    <Card key={digest.id} className="border-0 shadow-lg">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <h3 className="font-semibold">{digest.title}</h3>
                            </div>
                            <p className="text-slate-600 mb-2">{digest.description}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(digest.createdAt).toLocaleDateString()}
                            </p>
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

      </div>
    </AdminLayout>
  );
}

