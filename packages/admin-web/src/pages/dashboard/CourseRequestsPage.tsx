import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { FileText, ArrowLeft, CheckCircle2, XCircle, Clock, Search, Filter, GraduationCap, Building2 } from 'lucide-react';

export default function CourseRequestsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Mock data - replace with actual API call
  const requests = [
    {
      id: '1',
      type: 'Course',
      name: 'B.Tech Computer Science',
      institute: 'ABC Engineering College',
      requestedBy: 'Dr. John Doe',
      status: 'pending',
      requestedAt: '2025-11-28',
      description: 'Request to add new B.Tech CS course with updated curriculum',
    },
    {
      id: '2',
      type: 'Specialization',
      name: 'Data Science Specialization',
      institute: 'XYZ University',
      requestedBy: 'Prof. Jane Smith',
      status: 'pending',
      requestedAt: '2025-11-27',
      description: 'New specialization program in Data Science',
    },
    {
      id: '3',
      type: 'Course',
      name: 'MBA Finance',
      institute: 'Business School',
      requestedBy: 'Dr. Robert Brown',
      status: 'approved',
      requestedAt: '2025-11-25',
      description: 'MBA program with Finance specialization',
    },
  ];

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.institute.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || req.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'approved': return CheckCircle2;
      case 'rejected': return XCircle;
      default: return Clock;
    }
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
              <h1 className="text-3xl font-bold text-slate-900">Course / Specialization Requests</h1>
              <p className="text-slate-600 mt-1">Review and manage course and specialization requests</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-5 md:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Requests</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500 shadow-md">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.pending}</p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-500 shadow-md">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.approved}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500 shadow-md">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.rejected}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-500 shadow-md">
                  <XCircle className="h-6 w-6 text-white" />
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
                    placeholder="Search by course name or institute..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-600" />
                <div className="flex gap-2">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
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
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const StatusIcon = getStatusIcon(request.status);

                return (
                  <Card
                    key={request.id}
                    className="border-0 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                          request.type === 'Course' 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                            : 'bg-gradient-to-br from-purple-500 to-purple-600'
                        } shadow-md`}>
                          {request.type === 'Course' ? (
                            <GraduationCap className="h-6 w-6 text-white" />
                          ) : (
                            <Building2 className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{request.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(request.status)}`}>
                              <StatusIcon className="h-3 w-3 inline mr-1" />
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                              {request.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              <span>{request.institute}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>Requested by: {request.requestedBy}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(request.requestedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mb-4">{request.description}</p>
                          {request.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filteredRequests.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No requests found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}





















