import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { BarChart3, TrendingUp, Users, Eye, MousePointerClick, Loader2, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsApi } from '../../services/api/analytics';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsApi.getOverview(),
    retry: 1,
  });

  const { data: userGrowth, isLoading: growthLoading, error: growthError } = useQuery({
    queryKey: ['analytics-user-growth', period],
    queryFn: () => analyticsApi.getUserGrowth(period),
    retry: 1,
  });

  const engagementData = [
    { name: 'Posts', value: overview?.totalPosts || 0, color: '#3b82f6' },
    { name: 'Jobs', value: overview?.totalJobs || 0, color: '#10b981' },
    { name: 'Applications', value: overview?.totalApplications || 0, color: '#f59e0b' },
    { name: 'Users', value: overview?.activeUsers || 0, color: '#8b5cf6' },
  ];

  const hasError = overviewError || growthError;
  const errorMessage = (overviewError as any)?.response?.data?.message || 
                       (overviewError as any)?.message || 
                       (growthError as any)?.message ||
                       'Failed to load analytics data. Please check if the backend is running.';

  if (overviewLoading || growthLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (hasError && !overview && !userGrowth) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="border-red-200 bg-red-50 max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Failed to load analytics</p>
                  <p className="text-sm mt-1">{errorMessage}</p>
                  <p className="text-xs mt-2 text-red-600">Make sure the backend server is running on http://localhost:3000</p>
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
            <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-600 mt-1">Platform insights and metrics</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month')}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{overview?.totalUsers || 0}</div>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {overview?.newUsers || 0} new this month
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{overview?.activeUsers || 0}</div>
              <p className="text-xs text-slate-500 mt-1">
                {overview?.totalUsers ? Math.round((overview.activeUsers / overview.totalUsers) * 100) : 0}% of total
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <MousePointerClick className="h-4 w-4" />
                Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{overview?.engagementRate || 0}%</div>
              <p className="text-xs text-slate-500 mt-1">Active user rate</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{overview?.retentionRate || 0}%</div>
              <p className="text-xs text-slate-500 mt-1">User retention rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">User Growth</CardTitle>
              <CardDescription>Monthly user and active user trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Content Distribution</CardTitle>
              <CardDescription>Platform content breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={engagementData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {engagementData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{overview?.totalPosts || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{overview?.totalJobs || 0}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{overview?.totalApplications || 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
