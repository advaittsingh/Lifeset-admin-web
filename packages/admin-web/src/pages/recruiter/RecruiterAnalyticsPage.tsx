import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Loader2, TrendingUp, MapPin, Briefcase } from 'lucide-react';
import { recruiterApi } from '../../services/api/recruiter';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RecruiterAnalyticsPage() {
  const { data: candidateAnalytics, isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidate-analytics'],
    queryFn: () => recruiterApi.getCandidateAnalytics(),
  });

  const { data: jobPerformance, isLoading: performanceLoading } = useQuery({
    queryKey: ['job-performance'],
    queryFn: () => recruiterApi.getJobPerformance(),
  });

  const isLoading = candidatesLoading || performanceLoading;
  const analytics = candidateAnalytics?.data || candidateAnalytics;
  const performance = jobPerformance?.data || jobPerformance;

  const skillData = analytics?.skillDistribution?.slice(0, 10).map((item: any) => ({
    name: item.skill,
    count: item.count,
  })) || [];

  const locationData = analytics?.locationDistribution?.map((item: any) => ({
    name: item.location,
    count: item.count,
  })) || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recruiter Analytics</h1>
          <p className="text-slate-600 mt-1">Detailed analytics and insights</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Top Skills Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={skillData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Location Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={locationData.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {locationData.slice(0, 5).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Experience Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      <p className="font-semibold">Fresher</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">
                      {analytics?.experienceDistribution?.fresher || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <p className="font-semibold">Experienced</p>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      {analytics?.experienceDistribution?.experienced || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Job Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performance?.map((job: any) => (
                    <div key={job.id} className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="font-semibold mb-2">{job.title}</h3>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Views</p>
                          <p className="font-semibold">{job.views}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Applications</p>
                          <p className="font-semibold">{job.applications}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Application Rate</p>
                          <p className="font-semibold">{job.applicationRate}%</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Shortlist Rate</p>
                          <p className="font-semibold">{job.shortlistRate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

