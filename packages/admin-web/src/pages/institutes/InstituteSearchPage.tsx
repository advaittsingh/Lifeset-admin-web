import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Loader2, Building2, MapPin, Users, BookOpen, Search } from 'lucide-react';
import { institutesApi } from '../../services/api/institutes';

export default function InstituteSearchPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    state: '',
    type: '',
    page: 1,
    limit: 20,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['institute-search', filters],
    queryFn: () => institutesApi.searchInstitutes(filters),
  });

  const result = data?.data || data;
  const institutes = result?.data || [];
  const pagination = result?.pagination;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Institute Search</h1>
          <p className="text-slate-600 mt-1">Search and explore institutes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <Input
                placeholder="City"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              />
              <Input
                placeholder="State"
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
              />
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-3 py-2 border border-slate-200 rounded-md"
              >
                <option value="">All Types</option>
                <option value="UNIVERSITY">University</option>
                <option value="COLLEGE">College</option>
                <option value="INSTITUTE">Institute</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Results {pagination && `(${pagination.total} found)`}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {institutes.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    No institutes found
                  </div>
                ) : (
                  institutes.map((institute: any) => (
                    <Card
                      key={institute.id}
                      className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => navigate(`/institutes/${institute.id}/dashboard`)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{institute.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <MapPin className="h-3 w-3" />
                              <span>{institute.city}, {institute.state}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{institute._count?.students || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{institute._count?.courses || 0}</span>
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

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {filters.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

