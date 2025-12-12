import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, AlertTriangle, Users, Activity, Smartphone, TrendingUp } from 'lucide-react';
import { monitoringApi } from '../../services/api/monitoring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AppMonitoringPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['app-metrics'],
    queryFn: () => monitoringApi.getAppMetrics(),
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const metrics = data?.data || data;

  const featureUsageData = metrics?.featureUsage?.map((f: any) => ({
    name: f.feature,
    value: f.count,
  })) || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">App Monitoring</h1>
            <p className="text-slate-600 mt-1">Monitor app crashes, feature usage, and user activity</p>
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
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Crashes</p>
                      <p className="text-3xl font-bold text-slate-900">{metrics?.crashes || 0}</p>
                      <p className="text-xs text-slate-500 mt-1">Last 10 errors</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Active Users</p>
                      <p className="text-3xl font-bold text-slate-900">{metrics?.activeUsers || 0}</p>
                      <p className="text-xs text-slate-500 mt-1">Currently online</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Users</p>
                      <p className="text-3xl font-bold text-slate-900">{metrics?.totalUsers || 0}</p>
                      <p className="text-xs text-slate-500 mt-1">Active accounts</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Features Tracked</p>
                      <p className="text-3xl font-bold text-slate-900">{metrics?.featureUsage?.length || 0}</p>
                      <p className="text-xs text-slate-500 mt-1">Last 7 days</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Usage Chart */}
            {featureUsageData.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Feature Usage (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={featureUsageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Recent Crashes */}
            {metrics?.recentCrashes && metrics.recentCrashes.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Crashes/Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics.recentCrashes.map((crash: any) => (
                      <div key={crash.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-red-900">{crash.eventType}</p>
                            <p className="text-sm text-slate-600 mt-1">
                              {crash.metadata ? JSON.stringify(crash.metadata).substring(0, 100) : 'No details'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(crash.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Version Distribution */}
            {metrics?.versionDistribution && metrics.versionDistribution.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Version Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {metrics.versionDistribution.map((version: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold">v{version.version}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{version.users || 0} users</p>
                          <p className="text-xs text-slate-500">{version.percent || 0}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

