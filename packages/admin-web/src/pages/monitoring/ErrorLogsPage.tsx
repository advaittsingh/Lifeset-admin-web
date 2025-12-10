import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { AlertCircle, Search, RefreshCw, Loader2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { monitoringApi } from '../../services/api/monitoring';
import { useToast } from '../../contexts/ToastContext';

export default function ErrorLogsPage() {
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['error-logs', limit, offset],
    queryFn: () => monitoringApi.getErrorLogs(limit, offset),
  });

  const errors = data?.errors || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const filteredErrors = errors.filter((error: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      error.eventType?.toLowerCase().includes(search) ||
      error.user?.email?.toLowerCase().includes(search) ||
      error.metadata?.error?.toLowerCase().includes(search) ||
      JSON.stringify(error.metadata || {}).toLowerCase().includes(search)
    );
  });

  const getSeverityColor = (error: any) => {
    if (error.eventType?.includes('CRASH')) return 'bg-red-500';
    if (error.eventType?.includes('ERROR')) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Error Logs</h1>
            <p className="text-slate-600 mt-1">View and analyze system errors and exceptions</p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Errors</p>
                  <p className="text-3xl font-bold text-slate-900">{total}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Crashes</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {errors.filter((e: any) => e.eventType?.includes('CRASH')).length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Showing</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {offset + 1}-{Math.min(offset + limit, total)}
                  </p>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search errors by type, user, or error message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredErrors.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6 text-center py-12">
              <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No errors found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredErrors.map((error: any) => (
              <Card key={error.id} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <Badge className={getSeverityColor(error)} variant="default">
                        {error.eventType || 'ERROR'}
                      </Badge>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {error.user?.email || error.user?.mobile || 'Unknown User'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(error.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {error.ipAddress && (
                      <p className="text-xs text-slate-500">{error.ipAddress}</p>
                    )}
                  </div>

                  {error.metadata && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(error.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {error.userAgent && (
                    <p className="text-xs text-slate-500 mt-2">User Agent: {error.userAgent}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(Math.min(total - limit, offset + limit))}
                disabled={offset + limit >= total}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}





