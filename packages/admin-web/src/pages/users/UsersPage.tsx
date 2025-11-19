import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Users, Search, Filter, UserCheck, UserX, Mail, Loader2, AlertCircle } from 'lucide-react';
import { usersApi, User } from '../../services/api/users';
import { useToast } from '../../contexts/ToastContext';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users', searchTerm, userTypeFilter],
    queryFn: async () => {
      try {
        const result = await usersApi.getAll({
          search: searchTerm || undefined,
          userType: userTypeFilter !== 'all' ? userTypeFilter : undefined,
        });
        return result;
      } catch (err: any) {
        console.error('Error fetching users:', err);
        throw err;
      }
    },
  });

  // Handle response structure: result is { data: users[], pagination: {...} }
  const users = Array.isArray(usersData) ? usersData : (usersData?.data || []);
  const stats = {
    total: users.length,
    active: users.filter((u: User) => u.isActive).length,
    new: users.filter((u: User) => {
      const created = new Date(u.createdAt);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return created > monthAgo;
    }).length,
    inactive: users.filter((u: User) => !u.isActive).length,
  };

  const activateMutation = useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('User activated successfully', 'success');
    },
    onError: () => showToast('Failed to activate user', 'error'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('User deactivated successfully', 'success');
    },
    onError: () => showToast('Failed to deactivate user', 'error'),
  });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      STUDENT: 'bg-blue-100 text-blue-800',
      COMPANY: 'bg-green-100 text-green-800',
      COLLEGE: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-red-100 text-red-800',
      AMS: 'bg-amber-100 text-amber-800',
      FACULTY: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getUserName = (user: User) => {
    if (user.studentProfile) {
      return `${user.studentProfile.firstName} ${user.studentProfile.lastName}`;
    }
    if (user.companyProfile) {
      return user.companyProfile.companyName;
    }
    if (user.collegeProfile) {
      return user.collegeProfile.collegeName;
    }
    return user.email?.split('@')[0] || 'User';
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p>Failed to load users. Please try again.</p>
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
            <h1 className="text-3xl font-bold text-slate-900">Users</h1>
            <p className="text-slate-600 mt-1">Manage all platform users</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
              <p className="text-xs text-slate-500 mt-1">All registered users</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{stats.active}</div>
              <p className="text-xs text-slate-500 mt-1">{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">New This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.new}</div>
              <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.inactive}</div>
              <p className="text-xs text-slate-500 mt-1">{stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}% of total</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">All Users</CardTitle>
                <CardDescription>Search and manage users</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="STUDENT">Student</option>
                  <option value="COMPANY">Company</option>
                  <option value="COLLEGE">College</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">User</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Joined</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user: User) => (
                        <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                {getUserName(user).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{getUserName(user)}</p>
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {user.email || user.mobile || 'No contact'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(user.userType)}`}>
                              {user.userType}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`flex items-center gap-1 text-sm ${
                              user.isActive ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {user.isActive ? (
                                <UserCheck className="h-4 w-4" />
                              ) : (
                                <UserX className="h-4 w-4" />
                              )}
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {user.isActive ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsDialogOpen(true);
                                  }}
                                  disabled={deactivateMutation.isPending}
                                >
                                  <UserX className="h-4 w-4 mr-1" />
                                  Deactivate
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => activateMutation.mutate(user.id)}
                                  disabled={activateMutation.isPending}
                                >
                                  <UserCheck className="h-4 w-4 mr-1" />
                                  Activate
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate User</DialogTitle>
              <DialogDescription>
                Are you sure you want to deactivate {selectedUser && getUserName(selectedUser)}? This will prevent them from accessing the platform.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedUser) {
                    deactivateMutation.mutate(selectedUser.id);
                    setIsDialogOpen(false);
                  }
                }}
                disabled={deactivateMutation.isPending}
              >
                {deactivateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deactivating...
                  </>
                ) : (
                  'Deactivate'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
