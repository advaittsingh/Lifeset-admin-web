import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Loader2, Calendar } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';

export default function CollegeEventsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['college-events', searchTerm],
    queryFn: () => cmsApi.getCollegeEvents({ search: searchTerm || undefined }),
  });

  const events = Array.isArray(data) ? data : (data?.data || []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">College Events</h1>
            <p className="text-slate-600 mt-1">Manage college events</p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => navigate('/cms/college-events/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Events</CardTitle>
              <Input
                placeholder="Search events..."
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
                {events.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No events found</div>
                ) : (
                  events.map((event: any) => (
                    <Card key={event.id} className="border-0 shadow-lg">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <h3 className="font-semibold">{event.title}</h3>
                            </div>
                            <p className="text-slate-600 mb-2">{event.description}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(event.createdAt).toLocaleDateString()}
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

