import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Users, FileText, Briefcase, TrendingUp, ArrowUp, ArrowDown, Activity, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { analyticsApi } from '../../services/api/analytics';
import { usersApi } from '../../services/api/users';
import { postsApi } from '../../services/api/posts';
import { jobsApi } from '../../services/api/jobs';

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsApi.getOverview(),
  });

  const { data: userGrowth, isLoading: growthLoading } = useQuery({
    queryKey: ['analytics-user-growth', 'month'],
    queryFn: () => analyticsApi.getUserGrowth('month'),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users-count'],
    queryFn: () => usersApi.getAll({ limit: 1 }),
  });

  const { data: postsData } = useQuery({
    queryKey: ['posts-count'],
    queryFn: () => postsApi.getAll({ limit: 1 }),
  });

  const { data: jobsData } = useQuery({
    queryKey: ['jobs-count'],
    queryFn: () => jobsApi.getAll({ limit: 1 }),
  });

  const stats = [
    {
      name: 'Total Users',
      value: overview?.totalUsers?.toString() || usersData?.pagination?.total?.toString() || '0',
      change: overview?.newUsers ? `+${overview.newUsers}` : '+0',
      icon: Users,
      trend: 'up',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Active Posts',
      value: overview?.totalPosts?.toString() || postsData?.pagination?.total?.toString() || '0',
      change: '+0',
      icon: FileText,
      trend: 'up',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      name: 'Job Listings',
      value: overview?.totalJobs?.toString() || jobsData?.pagination?.total?.toString() || '0',
      change: '+0',
      icon: Briefcase,
      trend: 'up',
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      name: 'Growth Rate',
      value: overview?.engagementRate ? `${overview.engagementRate}%` : '0%',
      change: '+0%',
      icon: TrendingUp,
      trend: 'up',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  // Generate activity data from user growth
  const activityData = userGrowth?.map((item: any, index: number) => ({
    day: item.period || `Day ${index + 1}`,
    logins: item.active || 0,
    posts: Math.floor((item.users || 0) * 0.1),
  })) || [];

  const recentActivity = [
    { user: 'System', action: 'Platform initialized', time: 'Just now', type: 'system' },
  ];

  if (overviewLoading || growthLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-slate-700">All systems operational</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isPositive = stat.trend === 'up';

            return (
              <Card key={stat.name} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {stat.name}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                  <p className={`text-xs flex items-center gap-1 ${
                    isPositive ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )}
                    <span className="font-semibold">{stat.change}</span>
                    <span className="text-slate-500">from last month</span>
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-semibold">User Growth</CardTitle>
              <CardDescription>Monthly user and active user trends</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowth || []}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
                  <Area type="monotone" dataKey="active" stroke="#10b981" fillOpacity={1} fill="url(#colorActive)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-semibold">Weekly Activity</CardTitle>
              <CardDescription>Daily logins and posts overview</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="logins" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="posts" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <CardDescription>Latest actions from users across the platform</CardDescription>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                      {activity.user.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{activity.user}</p>
                    <p className="text-sm text-slate-600">{activity.action}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {activity.type}
                    </span>
                    <span className="text-xs text-slate-400">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
