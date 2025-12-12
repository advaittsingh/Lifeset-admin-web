import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Smartphone, ArrowLeft, Download, Search, TrendingUp, Users, Calendar, Filter } from 'lucide-react';
import { usersApi } from '../../services/api/users';

export default function AppInstalledPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['app-users', searchTerm, filter],
    queryFn: () => usersApi.getAll({
      limit: 100,
      search: searchTerm,
      userType: 'STUDENT', // App users are typically students
    }),
  });

  const users = usersData?.data || [];
  const filteredUsers = users.filter((user: any) => {
    if (filter === 'active') return user.isActive;
    if (filter === 'inactive') return !user.isActive;
    return true;
  });

  const stats = {
    total: users.length,
    active: users.filter((u: any) => u.isActive).length,
    inactive: users.filter((u: any) => !u.isActive).length,
    withMobile: users.filter((u: any) => u.mobile).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">App Installed</h1>
              <p className="text-slate-600 mt-1">Users who have installed the LifeSet mobile app</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-5 md:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Installs</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500 shadow-md">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.active}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500 shadow-md">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">With Mobile</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.withMobile}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500 shadow-md">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Inactive</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.inactive}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-500 shadow-md">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by email or mobile..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-600" />
                <div className="flex gap-2">
                  {(['all', 'active', 'inactive'] as const).map((f) => (
                    <Button
                      key={f}
                      variant={filter === f ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(f)}
                      className={filter === f ? 'bg-blue-600' : ''}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No users found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {user.email?.charAt(0).toUpperCase() || user.mobile?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {user.email || user.mobile || 'No contact info'}
                      </p>
                      <p className="text-sm text-slate-600">
                        {user.mobile && `Mobile: ${user.mobile}`}
                        {user.email && user.mobile && ' • '}
                        {user.email && `Email: ${user.email}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}





















