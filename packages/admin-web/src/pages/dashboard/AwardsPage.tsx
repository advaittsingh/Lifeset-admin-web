import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Plus, Search, Loader2, Edit, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../contexts/ToastContext';
import { institutesApi } from '../../services/api/institutes';

export default function AwardsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Fetch course categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ['course-master-categories-for-awards'],
    queryFn: () => institutesApi.getCourseMasterData(),
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent auto-refresh
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);

  // Fetch awarded data - ensure we're calling the correct endpoint
  const { data, isLoading } = useQuery({
    queryKey: ['awarded-list', selectedCategoryId, searchTerm, page, itemsPerPage],
    queryFn: async () => {
      const result = await institutesApi.getAwardedData(selectedCategoryId || undefined);
      // Ensure we're getting awarded data, not course master data
      if (Array.isArray(result)) {
        return result;
      }
      return result?.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds - prevent auto-refresh
  });

  const awardedItems = Array.isArray(data) ? data : (data?.data || []);

  // Filter by search term
  const filteredItems = awardedItems.filter((item: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(search) ||
      item.courseCategory?.name?.toLowerCase().includes(search) ||
      item.id?.toString().includes(search)
    );
  });

  // Paginate
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => institutesApi.deleteAwarded(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['awarded-list'] });
      queryClient.invalidateQueries({ queryKey: ['awarded-for-specialisation-filter'] });
      showToast('Awarded deleted successfully', 'success');
    },
    onError: () => showToast('Failed to delete awarded', 'error'),
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/dashboard/awards/edit/${id}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Awarded List</h1>
          <p className="text-slate-600 mt-1">Manage awarded categories (e.g., BTech, MTech)</p>
        </div>

        {/* Controls Bar */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Awarded List</CardTitle>
              <div className="flex items-center gap-3">
                {/* Course Category Filter */}
                <div className="relative">
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value);
                      setPage(1);
                    }}
                    className="appearance-none px-4 py-2 pr-8 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Items per page dropdown */}
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="appearance-none px-4 py-2 pr-8 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10 w-64"
                  />
                </div>

                {/* Add New button */}
                <Button
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold shadow-lg"
                  onClick={() => navigate('/dashboard/awards/create')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">ID</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Course Category</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Specialisations</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-500">
                            No awarded items found
                          </td>
                        </tr>
                      ) : (
                        paginatedItems.map((item: any, index: number) => {
                          const displayId = item.id || (totalItems - startIndex - index);
                          const itemName = item.name || 'N/A';
                          const categoryName = item.courseCategory?.name || 'Uncategorized';
                          const specialisationCount = item._count?.specialisations || 0;
                          const isActive = item.isActive !== false;

                          return (
                            <tr
                              key={item.id || index}
                              className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                            >
                              <td className="py-3 px-4 text-sm text-slate-900 font-medium">{displayId}</td>
                              <td className="py-3 px-4 text-sm text-slate-700">{itemName}</td>
                              <td className="py-3 px-4 text-sm text-slate-600">{categoryName}</td>
                              <td className="py-3 px-4 text-sm text-slate-600">{specialisationCount}</td>
                              <td className="py-3 px-4">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                    isActive
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEdit(item.id)}
                                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id, itemName)}
                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors"
                                    title="Delete"
                                    disabled={deleteMutation.isPending}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    {totalItems > 0 ? (
                      <>
                        {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
                      </>
                    ) : (
                      '0 items'
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="border-slate-300"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={
                            page === pageNum
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500'
                              : 'border-slate-300'
                          }
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || totalPages === 0}
                      className="border-slate-300"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
