import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, FileText, Users, Activity, TrendingUp, Globe } from 'lucide-react';
import { monitoringApi } from '../../services/api/monitoring';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function WebMonitoringPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['web-metrics'],
    queryFn: () => monitoringApi.getWebMetrics(),
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const metrics = data?.data || data;

  const trafficData = metrics?.trafficSummary?.last7Days?.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sessions: day.sessions,
    users: day.users,
  })) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Web Monitoring</h1>
            <p className="text-slate-600 mt-1">Monitor CMS activity, admin logs, and traffic</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Activity className={`mr-2 h-4 w-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* CMS Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>CMS Activity (Last 24 Hours)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-slate-600">Posts Created</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics?.cmsActivity?.postsCreated || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-slate-600">Posts Updated</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {metrics?.cmsActivity?.postsUpdated || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      <p className="text-sm text-slate-600">Users Created</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {metrics?.cmsActivity?.usersCreated || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm text-slate-600">Jobs Created</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {metrics?.cmsActivity?.jobsCreated || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Summary */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Traffic Summary (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Total Sessions</p>
                    <p className="text-2xl font-bold">{metrics?.trafficSummary?.total?.sessions || 0}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Total New Users</p>
                    <p className="text-2xl font-bold">{metrics?.trafficSummary?.total?.users || 0}</p>
                  </div>
                </div>
                {trafficData.length > 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trafficData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="sessions" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="users" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Admin Logs */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Admin Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics?.adminLogs && metrics.adminLogs.length > 0 ? (
                    metrics.adminLogs.slice(0, 20).map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">{log.eventType}</p>
                          <p className="text-sm text-slate-600">
                            {log.user?.email || 'System'} • {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">No admin logs found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

