import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Loader2, Users, BookOpen, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { institutesApi } from '../../services/api/institutes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function InstituteDashboardPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['institute-dashboard', id],
    queryFn: () => institutesApi.getInstituteDashboard(id!),
    enabled: !!id,
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

  const stats = [
    {
      label: 'Total Students',
      value: dashboard?.stats?.totalStudents || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Students',
      value: dashboard?.stats?.activeStudents || 0,
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      label: 'Total Courses',
      value: dashboard?.stats?.totalCourses || 0,
      icon: BookOpen,
      color: 'bg-purple-500',
    },
    {
      label: 'Inactive Students',
      value: dashboard?.stats?.inactiveStudents || 0,
      icon: UserX,
      color: 'bg-red-500',
    },
  ];

  const chartData = dashboard?.studentsByCourse?.map((item: any) => ({
    name: item.courseName,
    students: item.studentCount,
  })) || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Institute Dashboard</h1>
          <p className="text-slate-600 mt-1">Student statistics and insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
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
              <CardTitle>Students by Course</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.recentStudents?.slice(0, 5).map((student: any) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium">{student.user?.email || 'N/A'}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(student.user?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
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

