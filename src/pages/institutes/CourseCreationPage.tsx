import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Select } from '../../components/ui/select';
import { Plus, Edit, Trash2, Loader2, BookOpen, ArrowLeft } from 'lucide-react';
import { institutesApi } from '../../services/api/institutes';
import { useToast } from '../../contexts/ToastContext';

export default function CourseCreationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
  });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['institute-courses', id],
    queryFn: () => institutesApi.getCoursesByInstitute(id!),
    enabled: !!id,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['course-categories'],
    queryFn: () => institutesApi.getCourseMasterData(),
  });

  const courses = Array.isArray(coursesData) ? coursesData : (coursesData?.data || []);
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);


  const updateMutation = useMutation({
    mutationFn: ({ id: courseId, data }: { id: string; data: any }) => institutesApi.updateCourse(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institute-courses'] });
      showToast('Course updated successfully', 'success');
      setIsEditDialogOpen(false);
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/institutes')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Course Management</h1>
              <p className="text-slate-600 mt-1">Create and manage courses for this institute</p>
            </div>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => navigate(`/institutes/${id}/courses/create`)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course: any) => (
                  <Card key={course.id} className="border-0 shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <h3 className="font-semibold">{course.name}</h3>
                          </div>
                          {course.category && (
                            <p className="text-sm text-slate-500 mb-2">{course.category.name}</p>
                          )}
                          {course.description && (
                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">{course.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCourse(course);
                              setFormData({
                                name: course.name,
                                categoryId: course.categoryId || '',
                                description: course.description || '',
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Course Name *</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Category *</label>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                onClick={() => updateMutation.mutate({
                  id: selectedCourse?.id,
                  data: formData,
                })}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

