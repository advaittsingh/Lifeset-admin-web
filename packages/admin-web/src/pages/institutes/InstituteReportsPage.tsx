import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Loader2, Download, Users } from 'lucide-react';
import { institutesApi } from '../../services/api/institutes';

export default function InstituteReportsPage() {
  const { id } = useParams<{ id: string }>();
  const [filters, setFilters] = useState({ courseId: '', startDate: '', endDate: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['institute-reports', id, filters],
    queryFn: () => institutesApi.getInstituteReports(id!, filters),
    enabled: !!id,
  });

  const reports = data?.data || data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student Reports</h1>
          <p className="text-slate-600 mt-1">Generate and view student reports</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Report Filters</CardTitle>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
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
              <Input
                placeholder="Course ID (optional)"
                value={filters.courseId}
                onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Total Students: {reports?.total || 0}</h3>
                </div>

                {reports?.byCourse && Object.entries(reports.byCourse).map(([courseName, students]: [string, any]) => (
                  <Card key={courseName} className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {courseName} ({Array.isArray(students) ? students.length : 0} students)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Array.isArray(students) && students.map((student: any) => (
                          <div key={student.id} className="p-3 bg-slate-50 rounded-lg">
                            <p className="font-medium">{student.user?.email || 'N/A'}</p>
                            <p className="text-sm text-slate-600">
                              {student.user?.mobile || 'N/A'} • Joined: {new Date(student.user?.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
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

