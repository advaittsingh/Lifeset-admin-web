import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Plus, Edit, Trash2, Loader2, Building2, Users, BookOpen, Eye, MapPin, Mail, Phone, Search, CheckCircle2, XCircle } from 'lucide-react';
import { institutesApi } from '../../services/api/institutes';
import { useToast } from '../../contexts/ToastContext';

export default function InstitutesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    // Faculty Head Details
    facultyHeadName: '',
    facultyHeadEmail: '',
    facultyHeadContact: '',
    facultyHeadStatus: 'Active',
    // Institute Details
    name: '',
    pincode: '',
    district: '',
    city: '',
    state: '',
    address: '',
    canAffiliateCourse: false, // Checkbox for course affiliation
  });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['institutes', searchTerm],
    queryFn: () => institutesApi.getInstitutes({ search: searchTerm || undefined }),
    retry: 1,
  });

  // Log errors for debugging
  React.useEffect(() => {
    if (error) {
      console.error('Error fetching institutes:', error);
      const axiosError = error as any;
      if (axiosError?.response?.status === 404) {
        console.warn('GET /admin/institutes returned 404 - endpoint might not be implemented yet');
      }
    }
  }, [error]);

  const institutes = Array.isArray(data) ? data : (data?.data || []);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => institutesApi.updateInstitute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutes'] });
      showToast('Educational institution updated successfully', 'success');
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('Error updating institute:', error);
      let errorMessage = 'Failed to update institute';
      
      try {
        const responseData = error?.response?.data;
        if (responseData?.message) {
          if (Array.isArray(responseData.message)) {
            errorMessage = responseData.message.join(', ');
          } else {
            errorMessage = String(responseData.message);
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
      } catch (e) {
        // Keep default message
      }
      
      showToast(errorMessage, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => institutesApi.deleteInstitute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutes'] });
      showToast('Educational institution deleted successfully', 'success');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      console.error('Error deleting institute:', error);
      let errorMessage = 'Failed to delete institute';
      
      try {
        const responseData = error?.response?.data;
        if (responseData?.message) {
          if (Array.isArray(responseData.message)) {
            errorMessage = responseData.message.join(', ');
          } else {
            errorMessage = String(responseData.message);
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
      } catch (e) {
        // Keep default message
      }
      
      showToast(errorMessage, 'error');
    },
  });

  const totalInstitutes = institutes.length;
  const activeInstitutes = institutes.filter((i: any) => i.isActive !== false).length;
  const totalStudents = institutes.reduce((sum: number, i: any) => sum + (i._count?.students || 0), 0);
  const totalCourses = institutes.reduce((sum: number, i: any) => sum + (i._count?.courses || 0), 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Educational Institutions</h1>
            <p className="text-slate-600 mt-1">Manage educational institutions and colleges</p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            onClick={() => navigate('/institutes/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Educational Institution
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Educational Institutions</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{totalInstitutes}</p>
                </div>
                <Building2 className="h-10 w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Active</p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1">{activeInstitutes}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-emerald-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Students</p>
                  <p className="text-2xl font-bold text-purple-900 mt-1">{totalStudents}</p>
                </div>
                <Users className="h-10 w-10 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Total Courses</p>
                  <p className="text-2xl font-bold text-orange-900 mt-1">{totalCourses}</p>
                </div>
                <BookOpen className="h-10 w-10 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl">All Educational Institutions</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search educational institutions by name, city, or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-80 pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-red-600 mb-2">Error loading institutes</p>
                <p className="text-sm text-slate-600">
                  {(error as any)?.response?.status === 404 
                    ? 'Endpoint not found. Please check if the backend GET /admin/institutes is implemented.'
                    : 'Please check the console for details.'}
                </p>
              </div>
            ) : institutes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-slate-400 mb-4" />
                <p className="text-slate-600 mb-2">No educational institutions found</p>
                <p className="text-sm text-slate-500">Create your first educational institution to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {institutes.map((institute: any) => (
                  <Card 
                    key={institute.id} 
                    className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                    <CardContent className="pt-6 pb-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
                              <Building2 className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-slate-900 break-words">{institute.name}</h3>
                              {institute.type && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                                  {institute.type}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Location */}
                          <div className="flex items-start gap-2 text-sm text-slate-600 mb-3">
                            <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="break-words">
                              {institute.city && institute.state 
                                ? `${institute.city}, ${institute.state}`
                                : institute.city || institute.state || 'Location not specified'}
                            </span>
                          </div>

                          {/* Contact Info */}
                          {(institute.email || institute.phone) && (
                            <div className="space-y-1 mb-3 text-xs text-slate-500">
                              {institute.email && (
                                <div className="flex items-start gap-2">
                                  <Mail className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span className="break-words break-all">{institute.email}</span>
                                </div>
                              )}
                              {institute.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 flex-shrink-0" />
                                  <span className="break-words">{institute.phone}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="mb-4">
                            {institute.isActive !== false ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                                <CheckCircle2 className="h-3 w-3" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                                <XCircle className="h-3 w-3" />
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="p-1.5 rounded-md bg-blue-100">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Students</p>
                            <p className="text-sm font-semibold text-slate-900">{institute._count?.students || 0}</p>
                          </div>
                        </div>
                        <div className="w-px h-8 bg-slate-300"></div>
                        <div className="flex items-center gap-2 flex-1">
                          <div className="p-1.5 rounded-md bg-purple-100">
                            <BookOpen className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Courses</p>
                            <p className="text-sm font-semibold text-slate-900">{institute._count?.courses || 0}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[100px] hover:bg-blue-50 hover:border-blue-300"
                          onClick={() => navigate(`/institutes/${institute.id}/dashboard`)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          Dashboard
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[100px] hover:bg-purple-50 hover:border-purple-300"
                          onClick={() => navigate(`/institutes/${institute.id}/courses`)}
                        >
                          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                          Courses
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-indigo-50 hover:border-indigo-300"
                          onClick={() => navigate(`/institutes/${institute.id}/landing`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-amber-50 hover:border-amber-300"
                          onClick={() => {
                            setSelectedItem(institute);
                            setFormData({
                              facultyHeadName: institute.facultyHeadName || '',
                              facultyHeadEmail: institute.email || institute.facultyHeadEmail || '',
                              facultyHeadContact: institute.phone || institute.facultyHeadContact || '',
                              facultyHeadStatus: institute.isActive !== false ? 'Active' : 'Inactive',
                              name: institute.name || '',
                              pincode: institute.pincode || '',
                              district: institute.district || '',
                              city: institute.city || '',
                              state: institute.state || '',
                              address: institute.address || '',
                              canAffiliateCourse: institute.canAffiliateCourse || false,
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          onClick={() => {
                            setSelectedItem(institute);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Educational Institution</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Faculty Head Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Faculty Head Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Name *</label>
                    <Input 
                      value={formData.facultyHeadName} 
                      onChange={(e) => setFormData({ ...formData, facultyHeadName: e.target.value })} 
                      placeholder="Enter faculty head name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Email Id *</label>
                    <Input 
                      type="email" 
                      value={formData.facultyHeadEmail} 
                      onChange={(e) => setFormData({ ...formData, facultyHeadEmail: e.target.value })} 
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Contact Number *</label>
                    <Input 
                      value={formData.facultyHeadContact} 
                      onChange={(e) => setFormData({ ...formData, facultyHeadContact: e.target.value })} 
                      placeholder="Enter contact number"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
                    <Select 
                      value={formData.facultyHeadStatus} 
                      onChange={(e) => setFormData({ ...formData, facultyHeadStatus: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Institute Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Educational Institution Details</h3>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Educational Institution Name *</label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="Enter institute name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Pincode</label>
                    <Input 
                      value={formData.pincode} 
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} 
                      placeholder="Enter pincode"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">District</label>
                    <Input 
                      value={formData.district} 
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })} 
                      placeholder="Enter district"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">City</label>
                    <Input 
                      value={formData.city} 
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })} 
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">State</label>
                    <Input 
                      value={formData.state} 
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })} 
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Address</label>
                  <Textarea 
                    value={formData.address} 
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                    rows={3}
                    placeholder="Enter full address"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="canAffiliateCourse"
                    checked={formData.canAffiliateCourse}
                    onChange={(e) => setFormData({ ...formData, canAffiliateCourse: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="canAffiliateCourse" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Can Affiliate a Course
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => {
                  // Prepare data for API - map form fields to backend expected format
                  const apiData = {
                    name: formData.name,
                    email: formData.facultyHeadEmail,
                    phone: formData.facultyHeadContact,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    district: formData.district,
                    address: formData.address,
                    canAffiliateCourse: formData.canAffiliateCourse,
                    // Additional fields that backend might need
                    facultyHeadName: formData.facultyHeadName,
                    facultyHeadEmail: formData.facultyHeadEmail,
                    facultyHeadContact: formData.facultyHeadContact,
                    isActive: formData.facultyHeadStatus === 'Active',
                  };
                  updateMutation.mutate({ id: selectedItem?.id, data: apiData });
                }}
                disabled={
                  updateMutation.isPending || 
                  !formData.name || 
                  !formData.facultyHeadName || 
                  !formData.facultyHeadEmail || 
                  !formData.facultyHeadContact
                }
              >
                {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Educational Institution</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-600 mb-2">
                Are you sure you want to delete <strong>{selectedItem?.name}</strong>?
              </p>
              <p className="text-sm text-slate-500">
                This action cannot be undone. All associated courses and data will be permanently deleted.
              </p>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedItem(null);
                }}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedItem?.id) {
                    deleteMutation.mutate(selectedItem.id);
                  }
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

