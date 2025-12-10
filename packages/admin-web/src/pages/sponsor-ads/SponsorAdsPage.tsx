import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Edit, Trash2, Search, Loader2, AlertCircle, Image as ImageIcon, Link as LinkIcon, Eye, EyeOff, ExternalLink, TrendingUp } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface SponsorAd {
  id: string;
  sponsorBacklink: string;
  sponsorAdImage: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export default function SponsorAdsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data - replace with actual API call
  const { data: adsData, isLoading } = useQuery({
    queryKey: ['sponsor-ads', searchTerm, currentPage, itemsPerPage],
    queryFn: async () => {
      // This would be an actual API call
      return {
        data: [
          {
            id: '28',
            sponsorBacklink: 'https://wa.me/918630654336?text=Hello%20LifeSet!',
            sponsorAdImage: 'https://via.placeholder.com/150x150?text=Ad+1',
            status: 'active' as const,
            createdAt: '2025-11-20T10:00:00Z',
            updatedAt: '2025-11-20T10:00:00Z',
          },
          {
            id: '24',
            sponsorBacklink: 'https://forms.gle/PLZU8cyCVF8qrxx16',
            sponsorAdImage: 'https://via.placeholder.com/150x150?text=Ad+2',
            status: 'active' as const,
            createdAt: '2025-11-18T14:30:00Z',
            updatedAt: '2025-11-18T14:30:00Z',
          },
        ],
        total: 2,
      };
    },
  });

  const ads = adsData?.data || [];
  const filteredAds = ads.filter((ad: SponsorAd) =>
    ad.sponsorBacklink.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAds = filteredAds.slice(startIndex, endIndex);

  const stats = {
    total: ads.length,
    active: ads.filter((ad: SponsorAd) => ad.status === 'active').length,
    inactive: ads.filter((ad: SponsorAd) => ad.status === 'inactive').length,
  };

  const handleAdManagement = () => {
    navigate('/sponsor-ads/manage');
  };

  const handleEdit = (ad: SponsorAd) => {
    navigate(`/sponsor-ads/edit/${ad.id}`);
  };

  const handleUpdate = () => {
    // This is no longer used as we navigate to edit page
  };

  const handleDelete = (ad: SponsorAd) => {
    if (window.confirm(`Are you sure you want to delete sponsor ad #${ad.id}?`)) {
      showToast('Sponsor ad deleted successfully', 'success');
    }
  };

  const toggleStatus = (ad: SponsorAd) => {
    const newStatus = ad.status === 'active' ? 'inactive' : 'active';
    showToast(`Sponsor ad ${newStatus === 'active' ? 'activated' : 'deactivated'}`, 'success');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Wall Sponsor Ads</h1>
            <p className="text-slate-600 mt-1">Manage sponsor advertisements for the community wall</p>
          </div>
          <Button
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold shadow-lg"
            onClick={handleAdManagement}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Ad Management
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Ads</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500 shadow-md">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Active Ads</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.active}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500 shadow-md">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Inactive Ads</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.inactive}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-500 shadow-md">
                  <EyeOff className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ads Table */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle>All Sponsor Ads</CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-slate-600">entries</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by backlink..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
              </div>
            ) : paginatedAds.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No sponsor ads found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Sponsor Backlink</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Sponsor Ad</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAds.map((ad: SponsorAd) => (
                      <tr key={ad.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 text-slate-900 font-medium">{ad.id}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 max-w-md">
                            <LinkIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <a
                              href={ad.sponsorBacklink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 hover:underline truncate flex items-center gap-1"
                            >
                              {ad.sponsorBacklink}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={ad.sponsorAdImage}
                              alt={`Sponsor ad ${ad.id}`}
                              className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x150?text=No+Image';
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => toggleStatus(ad)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                              ad.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {ad.status === 'active' ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(ad)}
                              className="hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(ad)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {paginatedAds.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAds.length)} of {filteredAds.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-slate-300"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={
                            currentPage === pageNum
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'border-slate-300'
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-slate-300"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}

