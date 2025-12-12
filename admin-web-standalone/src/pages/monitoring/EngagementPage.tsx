import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, Bell, TrendingUp, DollarSign, Activity, Zap } from 'lucide-react';
import { monitoringApi } from '../../services/api/monitoring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function EngagementPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['engagement-metrics'],
    queryFn: () => monitoringApi.getEngagementMetrics(),
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const metrics = data?.data || data;

  const notificationData = [
    { name: 'Read', value: metrics?.notifications?.read || 0 },
    { name: 'Unread', value: metrics?.notifications?.unread || 0 },
  ];

  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Engagement Analytics</h1>
            <p className="text-slate-600 mt-1">Monitor notifications, ads, and user engagement</p>
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
            {/* Notifications */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Notification Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-slate-600">Total</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.notifications?.total || 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-slate-600">Sent (24h)</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.notifications?.sent24h || 0}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      <p className="text-sm text-slate-600">Read</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.notifications?.read || 0}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm text-slate-600">Read Rate</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.notifications?.readRate?.toFixed(1) || 0}%</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={notificationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {notificationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Ads Performance */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Ads Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-slate-600">Impressions</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.adsPerformance?.impressions || 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-slate-600">Clicks</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.adsPerformance?.clicks || 0}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <p className="text-sm text-slate-600">CTR</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.adsPerformance?.ctr?.toFixed(2) || 0}%</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm text-slate-600">Revenue</p>
                    </div>
                    <p className="text-2xl font-bold">₹{metrics?.adsPerformance?.revenue || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Streak Insights */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Streak Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-slate-600">Active Streaks</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.streakInsights?.activeStreaks || 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-slate-600">Avg Streak Length</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.streakInsights?.avgStreakLength || 0} days</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-purple-600" />
                      <p className="text-sm text-slate-600">Longest Streak</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.streakInsights?.longestStreak || 0} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

