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
import { Plus, Edit, Trash2, Loader2, Building2, Users, BookOpen, Eye } from 'lucide-react';
import { institutesApi } from '../../services/api/institutes';
import { useToast } from '../../contexts/ToastContext';

export default function InstitutesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
  });
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['institutes', searchTerm],
    queryFn: () => institutesApi.getInstitutes({ search: searchTerm || undefined }),
  });

  const institutes = Array.isArray(data) ? data : (data?.data || []);

  const createMutation = useMutation({
    mutationFn: (data: any) => institutesApi.createInstitute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutes'] });
      showToast('Institute created successfully', 'success');
      setIsCreateDialogOpen(false);
      setFormData({
        facultyHeadName: '',
        facultyHeadEmail: '',
        facultyHeadContact: '',
        facultyHeadStatus: 'Active',
        name: '',
        pincode: '',
        district: '',
        city: '',
        state: '',
        address: '',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => institutesApi.updateInstitute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutes'] });
      showToast('Institute updated successfully', 'success');
      setIsEditDialogOpen(false);
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Institutes</h1>
            <p className="text-slate-600 mt-1">Manage institutes and colleges</p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Institute
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Institutes</CardTitle>
              <Input
                placeholder="Search institutes..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {institutes.map((institute: any) => (
                  <Card key={institute.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-lg">{institute.name}</h3>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">{institute.city}, {institute.state}</p>
                          <p className="text-xs text-slate-500">{institute.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{institute._count?.students || 0} students</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{institute._count?.courses || 0} courses</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/institutes/${institute.id}/dashboard`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Dashboard
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/institutes/${institute.id}/courses`)}
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          Courses
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/institutes/${institute.id}/landing`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Landing
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(institute);
                            setFormData({
                              facultyHeadName: institute.facultyHeadName || '',
                              facultyHeadEmail: institute.email || institute.facultyHeadEmail || '',
                              facultyHeadContact: institute.phone || institute.facultyHeadContact || '',
                              facultyHeadStatus: institute.isActive ? 'Active' : 'Inactive',
                              name: institute.name || '',
                              pincode: institute.pincode || '',
                              district: institute.district || '',
                              city: institute.city || '',
                              state: institute.state || '',
                              address: institute.address || '',
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialogs */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Institute</DialogTitle>
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
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Institute Details</h3>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Institute Name *</label>
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
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
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
                    // Additional fields that backend might need
                    facultyHeadName: formData.facultyHeadName,
                    facultyHeadEmail: formData.facultyHeadEmail,
                    facultyHeadContact: formData.facultyHeadContact,
                    isActive: formData.facultyHeadStatus === 'Active',
                  };
                  createMutation.mutate(apiData);
                }}
                disabled={
                  createMutation.isPending || 
                  !formData.name || 
                  !formData.facultyHeadName || 
                  !formData.facultyHeadEmail || 
                  !formData.facultyHeadContact
                }
              >
                {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Institute</DialogTitle>
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
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Institute Details</h3>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Institute Name *</label>
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
              </div>
            </div>
            <DialogFooter className="mt-6">
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
      </div>
    </AdminLayout>
  );
}

