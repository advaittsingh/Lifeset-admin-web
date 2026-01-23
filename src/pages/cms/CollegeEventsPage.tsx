import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Loader2, Calendar, MapPin, GraduationCap, Eye, Edit, Trash2 } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';
import { useToast } from '../../contexts/ToastContext';

// Utility function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const plainText = doc.body.textContent || doc.body.innerText || '';
    return plainText.trim();
  } catch (error) {
    return html.replace(/<[^>]*>/g, '').trim();
  }
};

export default function CollegeEventsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['college-events', searchTerm],
    queryFn: () => cmsApi.getCollegeEvents({ search: searchTerm || undefined }),
  });

  const events = Array.isArray(data) ? data : (data?.data || []);

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => cmsApi.deleteCollegeEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['college-events'] });
      showToast('College event deleted successfully', 'success');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete event';
      showToast(String(errorMessage), 'error');
    },
  });

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
                  events.map((event: any) => {
                    const descriptionText = stripHtmlTags(event.description || '');
                    return (
                      <Card key={event.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            {/* Event Image */}
                            {event.imageUrl && (
                              <div className="flex-shrink-0">
                                <img
                                  src={event.imageUrl}
                                  alt={event.title}
                                  className="w-24 h-24 object-cover rounded-lg border border-slate-200"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h3>
                                  
                                  {/* All Event Fields Grid */}
                                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                    {event.collegeId && (
                                      <div className="flex items-center gap-2 text-slate-600">
                                        <GraduationCap className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                        <span className="truncate">College ID: {event.collegeId}</span>
                                      </div>
                                    )}
                                    {event.eventDate && (
                                      <div className="flex items-center gap-2 text-slate-600">
                                        <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                    {event.location && (
                                      <div className="flex items-center gap-2 text-slate-600 col-span-2">
                                        <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                        <span className="truncate">{event.location}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Description - 2-3 lines */}
                                  {descriptionText && (
                                    <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                      <p className="text-sm text-slate-700 line-clamp-3">{descriptionText}</p>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-500">
                                      Created: {new Date(event.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/cms/college-events/edit/${event.id}`)}
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/cms/college-events/edit/${event.id}`)}
                                      >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                          if (confirm('Are you sure you want to delete this event?')) {
                                            deleteMutation.mutate(event.id);
                                          }
                                        }}
                                        disabled={deleteMutation.isPending}
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}

