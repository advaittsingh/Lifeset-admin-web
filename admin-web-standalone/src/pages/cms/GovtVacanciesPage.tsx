import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Loader2, Briefcase } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';

export default function GovtVacanciesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['govt-vacancies', searchTerm],
    queryFn: () => cmsApi.getGovtVacancies({ search: searchTerm || undefined }),
  });

  const vacancies = Array.isArray(data) ? data : (data?.data || []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Government Vacancies</h1>
            <p className="text-slate-600 mt-1">View and manage government job vacancies</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Vacancies</CardTitle>
              <Input
                placeholder="Search vacancies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {vacancies.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No vacancies found</div>
                ) : (
                  vacancies.map((vacancy: any) => (
                    <Card key={vacancy.id} className="border-0 shadow-lg">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Briefcase className="h-4 w-4 text-blue-600" />
                              <h3 className="font-semibold text-lg">{vacancy.jobTitle || vacancy.post?.title}</h3>
                            </div>
                            <p className="text-slate-600 mb-2">{vacancy.jobDescription || vacancy.post?.description}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              {vacancy.location && <span>📍 {vacancy.location}</span>}
                              {vacancy.salaryMin && vacancy.salaryMax && (
                                <span>💰 ₹{vacancy.salaryMin} - ₹{vacancy.salaryMax}</span>
                              )}
                              <span>{new Date(vacancy.createdAt || vacancy.post?.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

