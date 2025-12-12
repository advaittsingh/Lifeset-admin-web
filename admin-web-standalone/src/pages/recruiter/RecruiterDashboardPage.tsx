import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Loader2, Briefcase, FileText, UserCheck, UserX, Clock, TrendingUp } from 'lucide-react';
import { recruiterApi } from '../../services/api/recruiter';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RecruiterDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['recruiter-dashboard'],
    queryFn: () => recruiterApi.getDashboard(),
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  const dashboard = data?.data || data;
  const stats = dashboard?.stats || {};

  const statCards = [
    { label: 'Total Jobs', value: stats.totalJobs || 0, icon: Briefcase, color: 'bg-blue-500' },
    { label: 'Active Jobs', value: stats.activeJobs || 0, icon: FileText, color: 'bg-green-500' },
    { label: 'Total Applications', value: stats.totalApplications || 0, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Pending', value: stats.pendingApplications || 0, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Shortlisted', value: stats.shortlisted || 0, icon: UserCheck, color: 'bg-emerald-500' },
    { label: 'Rejected', value: stats.rejected || 0, icon: UserX, color: 'bg-red-500' },
  ];

  const applicationStatusData = [
    { name: 'Pending', value: stats.pendingApplications || 0 },
    { name: 'Shortlisted', value: stats.shortlisted || 0 },
    { name: 'Rejected', value: stats.rejected || 0 },
  ];

  const COLORS = ['#fbbf24', '#10b981', '#ef4444'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recruiter Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of your recruitment activities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, idx) => (
            <Card key={idx} className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={applicationStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.recentApplications?.slice(0, 5).map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">{app.user?.email || 'N/A'}</p>
                      <p className="text-sm text-slate-500">{app.jobPost?.jobTitle || 'N/A'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-800' :
                      app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

