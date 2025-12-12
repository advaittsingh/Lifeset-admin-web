import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Loader2, Building2, MapPin, Globe, Mail, Phone, Users, BookOpen, ArrowLeft } from 'lucide-react';
import { institutesApi } from '../../services/api/institutes';

export default function InstituteLandingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['institute-landing', id],
    queryFn: () => institutesApi.getInstituteLandingPage(id!),
    enabled: !!id,
  });

  const institute = data?.data || data;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/institutes')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Institute Landing Page</h1>
            <p className="text-slate-600 mt-1">Preview how the institute appears to students</p>
          </div>
        </div>

        {institute && (
          <div className="space-y-6">
            {/* Hero Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="pt-12 pb-12">
                <div className="flex items-center gap-6">
                  {institute.logo && (
                    <img src={institute.logo} alt={institute.name} className="w-24 h-24 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <h2 className="text-4xl font-bold mb-2">{institute.name}</h2>
                    <div className="flex items-center gap-4 text-blue-100">
                      {institute.city && institute.state && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{institute.city}, {institute.state}</span>
                        </div>
                      )}
                      {institute.type && (
                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{institute.type}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Students</p>
                      <p className="text-2xl font-bold">{institute.stats?.totalStudents || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Total Courses</p>
                      <p className="text-2xl font-bold">{institute.stats?.totalCourses || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Active Courses</p>
                      <p className="text-2xl font-bold">{institute.stats?.activeCourses || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* About */}
            {institute.description && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{institute.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {institute.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      <span>{institute.email}</span>
                    </div>
                  )}
                  {institute.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span>{institute.phone}</span>
                    </div>
                  )}
                  {institute.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-500" />
                      <a href={institute.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {institute.website}
                      </a>
                    </div>
                  )}
                  {institute.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span>{institute.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Courses */}
            {institute.courses && institute.courses.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Available Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {institute.courses.map((course: any) => (
                      <div key={course.id} className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold mb-2">{course.name}</h3>
                        {course.category && (
                          <p className="text-sm text-slate-500 mb-1">{course.category.name}</p>
                        )}
                        {course.duration && (
                          <p className="text-sm text-slate-600">Duration: {course.duration}</p>
                        )}
                        {course.fees && (
                          <p className="text-sm text-slate-600">Fees: ₹{course.fees}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

