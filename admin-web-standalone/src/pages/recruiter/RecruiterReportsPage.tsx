import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Loader2, FileText, Download } from 'lucide-react';
import { recruiterApi } from '../../services/api/recruiter';

export default function RecruiterReportsPage() {
  const [reportType, setReportType] = useState<'jobs' | 'applications'>('jobs');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '', jobId: '' });

  const { data: jobReports, isLoading: jobsLoading } = useQuery({
    queryKey: ['job-reports', filters],
    queryFn: () => recruiterApi.getJobReports(filters),
    enabled: reportType === 'jobs',
  });

  const { data: applicationReports, isLoading: appsLoading } = useQuery({
    queryKey: ['application-reports', filters],
    queryFn: () => recruiterApi.getApplicationReports(filters),
    enabled: reportType === 'applications',
  });

  const isLoading = jobsLoading || appsLoading;
  const reports = reportType === 'jobs' ? (jobReports?.data || jobReports || []) : (applicationReports?.data || applicationReports?.data || []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Recruiter Reports</h1>
          <p className="text-slate-600 mt-1">View detailed reports and analytics</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Reports</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={reportType === 'jobs' ? 'default' : 'outline'}
                  onClick={() => setReportType('jobs')}
                >
                  Job Reports
                </Button>
                <Button
                  variant={reportType === 'applications' ? 'default' : 'outline'}
                  onClick={() => setReportType('applications')}
                >
                  Application Reports
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-3 gap-4">
              <Input
                type="date"
                placeholder="Start Date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
              {reportType === 'applications' && (
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border border-slate-200 rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {reportType === 'jobs' && reports.map((job: any) => (
                  <Card key={job.id} className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{job.jobTitle}</h3>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500">Views</p>
                              <p className="font-semibold">{job.views || 0}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Applications</p>
                              <p className="font-semibold">{job.applicationStats?.total || 0}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Application Rate</p>
                              <p className="font-semibold">{job.applicationRate || 0}%</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Shortlist Rate</p>
                              <p className="font-semibold">{job.shortlistRate || 0}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {reportType === 'applications' && reports.map((app: any) => (
                  <Card key={app.id} className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{app.user?.email || 'N/A'}</h3>
                          <p className="text-sm text-slate-600 mb-2">{app.jobPost?.jobTitle || 'N/A'}</p>
                          <span className={`px-2 py-1 rounded text-xs ${
                            app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-800' :
                            app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

