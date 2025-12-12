import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, FileText, Briefcase, TrendingUp, ArrowUp, ArrowDown, Activity, Loader2, AlertCircle, Smartphone, GraduationCap, Award, BookOpen, Building2, UserPlus, MessageSquare, Upload, ArrowRight, Clock, Zap, Target, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { analyticsApi } from '../../services/api/analytics';
import { usersApi } from '../../services/api/users';
import { postsApi } from '../../services/api/posts';
import { jobsApi } from '../../services/api/jobs';
import { useNavigate } from 'react-router-dom';

// Enhanced StatBox Component - matches admin panel design
function StatBox({ value, label, icon: Icon, onClick, highlight }: { value: number; label: string; icon: any; onClick?: () => void; highlight?: boolean }) {
  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center rounded-xl overflow-hidden border transition-all duration-200 ${
        highlight 
          ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100/50 shadow-md' 
          : 'border-slate-200 bg-white hover:border-slate-300'
      } ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : ''}`}
    >
      <div className={`flex-1 px-5 py-4 flex items-center justify-center ${highlight ? 'bg-yellow-400/10' : 'bg-white'}`}>
        <span className={`text-3xl font-bold ${highlight ? 'text-yellow-600' : 'text-slate-900'}`}>{value.toLocaleString()}</span>
      </div>
      <div className={`flex-1 px-5 py-4 flex items-center justify-between ${
        highlight ? 'bg-yellow-400' : 'bg-gradient-to-r from-slate-50 to-slate-100'
      }`}>
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`p-1.5 rounded-lg ${highlight ? 'bg-white/20' : 'bg-slate-200'}`}>
              <Icon className={`h-4 w-4 ${highlight ? 'text-white' : 'text-slate-600'}`} />
            </div>
          )}
          <span className={`text-sm font-semibold ${highlight ? 'text-white' : 'text-slate-700'}`}>{label}</span>
        </div>
        {onClick && (
          <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
            highlight ? 'text-white' : 'text-slate-500'
          }`} />
        )}
      </div>
    </div>
  );
}

// Enhanced ActionBox Component - matches admin panel design
function ActionBox({ label, icon: Icon, onClick, variant = 'primary' }: { label: string; icon: any; onClick?: () => void; variant?: 'primary' | 'secondary' }) {
  const isPrimary = variant === 'primary';
  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
        isPrimary
          ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 via-yellow-100/80 to-yellow-50 hover:shadow-lg hover:border-yellow-500'
          : 'border-blue-400 bg-gradient-to-br from-blue-50 via-blue-100/80 to-blue-50 hover:shadow-lg hover:border-blue-500'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${
          isPrimary ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 'bg-gradient-to-br from-blue-500 to-blue-600'
        }`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className={`text-sm font-semibold ${isPrimary ? 'text-slate-900' : 'text-slate-800'}`}>{label}</span>
      </div>
      <ArrowRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
        isPrimary ? 'text-yellow-600' : 'text-blue-600'
      }`} />
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => analyticsApi.getOverview(),
    retry: 1,
  });

  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsApi.getDashboardStats(),
    retry: 1,
  });

  const { data: userGrowth, isLoading: growthLoading, error: growthError } = useQuery({
    queryKey: ['analytics-user-growth', 'month'],
    queryFn: () => analyticsApi.getUserGrowth('month'),
    retry: 1,
  });

  const { data: usersData, error: usersError } = useQuery({
    queryKey: ['users-count'],
    queryFn: () => usersApi.getAll({ limit: 1 }),
    retry: 1,
  });

  const { data: postsData, error: postsError } = useQuery({
    queryKey: ['posts-count'],
    queryFn: () => postsApi.getAll({ limit: 1 }),
    retry: 1,
  });

  const { data: jobsData, error: jobsError } = useQuery({
    queryKey: ['jobs-count'],
    queryFn: () => jobsApi.getAll({ limit: 1 }),
    retry: 1,
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

  const hasError = overviewError || growthError || usersError || postsError || jobsError || statsError;
  const errorMessage = (overviewError as any)?.response?.data?.message || 
                       (overviewError as any)?.message || 
                       (growthError as any)?.message ||
                       (statsError as any)?.message ||
                       'Failed to load dashboard data. Please check if the backend is running.';

  if (overviewLoading || growthLoading || statsLoading) {
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
                  <p className="font-semibold">Failed to load dashboard</p>
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
        {/* Header Section */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-slate-600 mt-1.5 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Activity className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">All systems operational</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isPositive = stat.trend === 'up';

            return (
              <Card key={stat.name} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-[1.02] bg-white">
                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -mr-20 -mt-20 group-hover:opacity-10 transition-opacity`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    {stat.name}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl ${stat.bgColor} shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</div>
                  <p className={`text-xs flex items-center gap-1.5 ${
                    isPositive ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <ArrowUp className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5" />
                    )}
                    <span className="font-bold">{stat.change}</span>
                    <span className="text-slate-500 font-medium">from last month</span>
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-50/50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">User Growth</CardTitle>
                    <CardDescription className="text-slate-600">Monthly user and active user trends</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowth || []}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="active" stroke="#10b981" fillOpacity={1} fill="url(#colorActive)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-emerald-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Weekly Activity</CardTitle>
                  <CardDescription className="text-slate-600">Daily logins and posts overview</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="logins" fill="#3b82f6" radius={[12, 12, 0, 0]} />
                  <Bar dataKey="posts" fill="#10b981" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* LifeSet Panel - Enhanced Design */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-yellow-50/20 to-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-blue-400/5 pointer-events-none" />
          <CardHeader className="border-b border-slate-200/50 bg-gradient-to-r from-yellow-50/50 via-white to-blue-50/50 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl blur-lg opacity-50" />
                  <div className="relative p-3 rounded-2xl bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-xl">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                    LifeSet Panel
                  </CardTitle>
                  <CardDescription className="text-slate-600 font-medium">
                    Platform statistics, categories, and management tools
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-blue-50 rounded-xl border border-yellow-200/50">
                <Activity className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-semibold text-slate-700">Live Data</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8 relative z-10">
            {/* All Blocks in Course Request Style */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {/* App Installed */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                <div className="relative p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/50 hover:border-blue-300 transition-all cursor-pointer" onClick={() => navigate('/dashboard/app-installed')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                        <Smartphone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">
                          {dashboardStats?.lifesetPanel?.appInstalled || 0}
                        </div>
                        <div className="text-sm font-semibold text-slate-700">No Of App Installed</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Course Categories */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                <div className="relative p-5 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/50 hover:border-emerald-300 transition-all cursor-pointer" onClick={() => navigate('/institutes/course-master')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">
                          {dashboardStats?.lifesetPanel?.courseCategories || 0}
                        </div>
                        <div className="text-sm font-semibold text-slate-700">Course Categorys</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Awards */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                <div className="relative p-5 rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-50/50 hover:border-amber-300 transition-all cursor-pointer" onClick={() => navigate('/dashboard/awards')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-md">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">
                          {dashboardStats?.lifesetPanel?.awards || 0}
                        </div>
                        <div className="text-sm font-semibold text-slate-700">Awardeds</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300 pointer-events-none" />
                <div 
                  className="relative p-5 rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-50/50 hover:border-purple-300 transition-all cursor-pointer" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/dashboard/specialisations');
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">
                          {dashboardStats?.lifesetPanel?.specializations || 0}
                        </div>
                        <div className="text-sm font-semibold text-slate-700">Specializations</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Wall Categories */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                <div className="relative p-5 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer" onClick={() => navigate('/dashboard/wall-categories')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">
                          {dashboardStats?.lifesetPanel?.wallCategories || 0}
                        </div>
                        <div className="text-sm font-semibold text-slate-700">Wall Categorys</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
              </div>

              {/* Bulk Upload */}
              <div className="relative group md:col-span-2">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                <div className="relative p-5 rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-50/50 hover:border-yellow-300 transition-all cursor-pointer" onClick={() => navigate('/dashboard/bulk-upload')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-md">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 mb-1">Bulk Upload</div>
                        <div className="text-sm font-semibold text-slate-700">Upload multiple records at once</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
              </div>

              {/* Institutes/Counsellors */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-400 to-slate-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                <div className="relative p-5 rounded-xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-slate-50/50 hover:border-slate-300 transition-all cursor-pointer" onClick={() => navigate('/institutes')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 shadow-md">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900 mb-1">Institutes</div>
                        <div className="text-sm font-semibold text-slate-700">Counsellors</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-600" />
                  </div>
                </div>
              </div>

              {/* Course / Spe Request */}
              <div className="relative group lg:col-span-2">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                <div className="relative p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50/50 hover:border-blue-300 transition-all cursor-pointer" onClick={() => navigate('/dashboard/course-requests')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-slate-900 mb-1">
                          {dashboardStats?.lifesetPanel?.courseSpeRequest || 0}
                        </div>
                        <div className="text-sm font-semibold text-slate-700">Course / Spe Request</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {dashboardStats?.lifesetPanel?.courseSpeRequest > 0 && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">
                          New
                        </span>
                      )}
                      <ArrowRight className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panels Grid - 2 columns */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Institutes Panel */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Institutes Panel</CardTitle>
                  <CardDescription className="text-slate-600">Educational institutions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <StatBox
                  value={dashboardStats?.institutesPanel?.institutes || 0}
                  label="Institutes"
                  icon={Building2}
                  onClick={() => navigate('/institutes')}
                />
                <StatBox
                  value={dashboardStats?.institutesPanel?.institutesNewRequest || 0}
                  label="Institutes New Request"
                  icon={Building2}
                  onClick={() => navigate('/institutes')}
                  highlight={dashboardStats?.institutesPanel?.institutesNewRequest > 0}
                />
              </div>
            </CardContent>
          </Card>

          {/* Members Panel */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-purple-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Members Panel</CardTitle>
                  <CardDescription className="text-slate-600">Platform members</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <StatBox
                  value={dashboardStats?.membersPanel?.members || 0}
                  label="Members"
                  icon={Users}
                  onClick={() => navigate('/users')}
                />
                <StatBox
                  value={dashboardStats?.membersPanel?.invitedMembers || 0}
                  label="Invited Members"
                  icon={UserPlus}
                  onClick={() => navigate('/users')}
                  highlight={dashboardStats?.membersPanel?.invitedMembers > 0}
                />
              </div>
            </CardContent>
          </Card>

          {/* Students Panel - Optimized */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-emerald-50/30 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-transparent to-blue-400/5 pointer-events-none" />
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-emerald-50/50 via-white to-blue-50/50 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl blur-lg opacity-30" />
                    <div className="relative p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Students Panel</CardTitle>
                    <CardDescription className="text-slate-600">Student management and analytics</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/users')}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
              {/* Main Stats Grid */}
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                  <div className="relative p-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/50 hover:border-emerald-300 transition-all cursor-pointer" onClick={() => navigate('/users?type=STUDENT')}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                      {dashboardStats?.studentsPanel?.students || 0}
                    </div>
                    <div className="text-sm font-semibold text-slate-700">Total Students</div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                  <div className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    dashboardStats?.studentsPanel?.studentsNewRequest > 0
                      ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-50/50 hover:border-yellow-400'
                      : 'border-slate-200 bg-gradient-to-br from-slate-50 to-slate-50/50 hover:border-slate-300'
                  }`} onClick={() => navigate('/users?type=STUDENT&status=pending')}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg shadow-md ${
                        dashboardStats?.studentsPanel?.studentsNewRequest > 0
                          ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-br from-slate-500 to-slate-600'
                      }`}>
                        <UserPlus className="h-5 w-5 text-white" />
                      </div>
                      {dashboardStats?.studentsPanel?.studentsNewRequest > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">
                          New
                        </span>
                      )}
                      <ArrowRight className={`h-4 w-4 ${
                        dashboardStats?.studentsPanel?.studentsNewRequest > 0 ? 'text-yellow-600' : 'text-slate-600'
                      }`} />
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${
                      dashboardStats?.studentsPanel?.studentsNewRequest > 0 ? 'text-yellow-600' : 'text-slate-900'
                    }`}>
                      {dashboardStats?.studentsPanel?.studentsNewRequest || 0}
                    </div>
                    <div className="text-sm font-semibold text-slate-700">New Requests</div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300" />
                  <div className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    dashboardStats?.studentsPanel?.studentsQueries > 0
                      ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-50/50 hover:border-blue-400'
                      : 'border-slate-200 bg-gradient-to-br from-slate-50 to-slate-50/50 hover:border-slate-300'
                  }`} onClick={() => navigate('/dashboard/course-requests')}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg shadow-md ${
                        dashboardStats?.studentsPanel?.studentsQueries > 0
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-slate-500 to-slate-600'
                      }`}>
                        <MessageSquare className="h-5 w-5 text-white" />
                      </div>
                      {dashboardStats?.studentsPanel?.studentsQueries > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200">
                          {dashboardStats?.studentsPanel?.studentsQueries}
                        </span>
                      )}
                      <ArrowRight className={`h-4 w-4 ${
                        dashboardStats?.studentsPanel?.studentsQueries > 0 ? 'text-blue-600' : 'text-slate-600'
                      }`} />
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${
                      dashboardStats?.studentsPanel?.studentsQueries > 0 ? 'text-blue-600' : 'text-slate-900'
                    }`}>
                      {dashboardStats?.studentsPanel?.studentsQueries || 0}
                    </div>
                    <div className="text-sm font-semibold text-slate-700">Queries</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-600">Quick Actions</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/users?type=STUDENT')}
                      className="text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    >
                      Manage Students
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/analytics')}
                      className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      View Analytics
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Companies Panel */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-amber-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-md">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Companies Panel</CardTitle>
                  <CardDescription className="text-slate-600">Company profiles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <StatBox
                  value={dashboardStats?.companiesPanel?.companies || 0}
                  label="Companies"
                  icon={Briefcase}
                  onClick={() => navigate('/jobs')}
                />
                <StatBox
                  value={dashboardStats?.companiesPanel?.companiesNewRequest || 0}
                  label="Companies New Request"
                  icon={Briefcase}
                  onClick={() => navigate('/jobs')}
                  highlight={dashboardStats?.companiesPanel?.companiesNewRequest > 0}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Panel */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50/30">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-white">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Referral Panel</CardTitle>
                <CardDescription className="text-slate-600">Referral program statistics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <ActionBox
                label="Manage Panel"
                icon={BarChart3}
                onClick={() => navigate('/analytics')}
                variant="secondary"
              />
              <StatBox
                value={dashboardStats?.referralPanel?.referralStudents || 0}
                label="Referral Students"
                icon={Users}
                highlight={dashboardStats?.referralPanel?.referralStudents > 0}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-md">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Recent Activity</CardTitle>
                  <CardDescription className="text-slate-600">Latest actions from users across the platform</CardDescription>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                View all →
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30 transition-all duration-200 border border-slate-100 hover:border-slate-200 hover:shadow-sm group">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
                      {activity.user.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{activity.user}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{activity.action}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                      {activity.type}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{activity.time}</span>
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
