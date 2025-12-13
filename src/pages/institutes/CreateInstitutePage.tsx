import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { ArrowLeft, Save, Loader2, Building2, User } from 'lucide-react';
import { institutesApi } from '../../services/api/institutes';
import { useToast } from '../../contexts/ToastContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function CreateInstitutePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

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

  const createMutation = useMutation({
    mutationFn: (data: any) => institutesApi.createInstitute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutes'] });
      showToast('Institute created successfully', 'success');
      navigate('/institutes');
    },
    onError: (error: any) => {
      console.error('Error creating institute:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error response (full):', JSON.stringify(error?.response?.data, null, 2));
      console.error('Error status:', error?.response?.status);
      console.error('Error statusText:', error?.response?.statusText);
      console.error('Request URL:', error?.config?.url);
      console.error('Request method:', error?.config?.method);
      console.error('Request data sent:', error?.config?.data);
      console.error('Full error object:', JSON.stringify(error?.response, null, 2));
      
      // Extract error message properly - handle objects
      let errorMessage = 'Failed to create institute';
      
      try {
        if (error?.response?.data) {
          const errorData = error.response.data;
          
          // Handle different error response formats
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData?.message) {
            errorMessage = String(errorData.message);
          } else if (errorData?.error) {
            errorMessage = String(errorData.error);
          } else if (errorData?.code && errorData?.message) {
            errorMessage = `${String(errorData.code)}: ${String(errorData.message)}`;
          } else if (Array.isArray(errorData)) {
            errorMessage = errorData.map((e: any) => String(e?.message || e)).join(', ');
          } else {
            // Try to extract any meaningful message from the object
            const message = errorData?.message || errorData?.error || errorData?.detail;
            errorMessage = message ? String(message) : 'Server error occurred. Please check console for details.';
          }
        } else if (error?.message) {
          errorMessage = String(error.message);
        }
      } catch (e) {
        errorMessage = 'An unexpected error occurred';
      }
      
      // Ensure we always pass a string
      showToast(String(errorMessage), 'error');
    },
  });

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      showToast('Please enter institute name', 'error');
      return;
    }
    if (!formData.facultyHeadName.trim()) {
      showToast('Please enter faculty head name', 'error');
      return;
    }
    if (!formData.facultyHeadEmail.trim()) {
      showToast('Please enter faculty head email', 'error');
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.facultyHeadEmail.trim())) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    if (!formData.facultyHeadContact.trim()) {
      showToast('Please enter faculty head contact number', 'error');
      return;
    }
    // City and state are required by backend (based on Institute interface)
    if (!formData.city?.trim()) {
      showToast('Please enter city', 'error');
      return;
    }
    if (!formData.state?.trim()) {
      showToast('Please enter state', 'error');
      return;
    }

    // Prepare data for API - match backend CreateInstituteDto format exactly
    const apiData = {
      facultyHeadName: formData.facultyHeadName.trim(),
      facultyHeadEmail: formData.facultyHeadEmail.trim(),
      facultyHeadContact: formData.facultyHeadContact.trim(),
      facultyHeadStatus: formData.facultyHeadStatus,
      name: formData.name.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      district: formData.district?.trim() || '',
      pincode: formData.pincode?.trim() || '',
      address: formData.address?.trim() || '',
    };

    console.log('Sending institute data:', JSON.stringify(apiData, null, 2));
    createMutation.mutate(apiData);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/institutes')}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Institutes
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Register New Institute</h1>
              <p className="text-slate-600 mt-1">Add a new institute to the platform</p>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold shadow-lg"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Submit
              </>
            )}
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Side - Faculty Head Details */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-blue-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Faculty Head Details</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
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
            </CardContent>
          </Card>

          {/* Right Side - Institute Details */}
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-indigo-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">Institute Details</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

