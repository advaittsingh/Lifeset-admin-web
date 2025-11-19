import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, TrendingUp, Award, FileText, HelpCircle, Users, Activity } from 'lucide-react';
import { monitoringApi } from '../../services/api/monitoring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function UserBehaviorPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['user-behavior-metrics'],
    queryFn: () => monitoringApi.getUserBehaviorMetrics(),
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const metrics = data?.data || data;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Behavior Analytics</h1>
            <p className="text-slate-600 mt-1">Track user engagement and content performance</p>
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
            {/* Feed Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Personalized Feed Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Total Feeds</p>
                    <p className="text-2xl font-bold">{metrics?.feedStats?.totalFeeds || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Active Feeds</p>
                    <p className="text-2xl font-bold text-green-600">{metrics?.feedStats?.activeFeeds || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Likes</p>
                    <p className="text-2xl font-bold">{metrics?.feedStats?.interactions?.total_likes || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Comments</p>
                    <p className="text-2xl font-bold">{metrics?.feedStats?.interactions?.total_comments || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scorecard Tracking */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Scorecard Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-slate-600">Total Users</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.scorecardTracking?.totalUsers || 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-slate-600">Users with Score</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.scorecardTracking?.usersWithScore || 0}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <p className="text-sm text-slate-600">Average Score</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.scorecardTracking?.avgScore?.toFixed(0) || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Performance */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.contentPerformance?.topPosts && metrics.contentPerformance.topPosts.length > 0 ? (
                    metrics.contentPerformance.topPosts.map((post: any) => (
                      <div key={post.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">{post.title || 'Untitled'}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold text-green-600">{post.likes || 0}</p>
                            <p className="text-xs text-slate-500">Likes</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-blue-600">{post.comments || 0}</p>
                            <p className="text-xs text-slate-500">Comments</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">No content data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* MCQ/GK Analytics */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>MCQ/GK Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-slate-600">Total Questions</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.mcqAnalytics?.totalQuestions || 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-slate-600">Total Attempts</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.mcqAnalytics?.totalAttempts || 0}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <p className="text-sm text-slate-600">Average Score</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.mcqAnalytics?.avgScore?.toFixed(1) || 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Analytics */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Referral Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-slate-600">Total Referrals</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.referralAnalytics?.totalReferrals || 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-slate-600">Active Referrers</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.referralAnalytics?.activeReferrers || 0}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <p className="text-sm text-slate-600">Total Rewards</p>
                    </div>
                    <p className="text-2xl font-bold">₹{metrics?.referralAnalytics?.totalRewards || 0}</p>
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

