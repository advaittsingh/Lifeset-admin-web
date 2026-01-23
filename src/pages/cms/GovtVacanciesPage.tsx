import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Loader2, Briefcase, Plus, MapPin, Calendar, DollarSign, Users, Edit, Trash2, Eye } from 'lucide-react';
import { cmsApi } from '../../services/api/cms';
import { useToast } from '../../contexts/ToastContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';

// Utility function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const plainText = doc.body.textContent || doc.body.innerText || '';
    return plainText.trim();
  } catch (error) {
    return html.replace(/<[^>]*>/g, '').trim();
  }
};

export default function GovtVacanciesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<any>(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['govt-vacancies', searchTerm],
    queryFn: () => cmsApi.getGovtVacancies({ search: searchTerm || undefined }),
  });

  const vacancies = Array.isArray(data) ? data : (data?.data || []);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cmsApi.deleteGovtVacancy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['govt-vacancies'] });
      showToast('Government vacancy deleted successfully', 'success');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete vacancy';
      showToast(errorMessage, 'error');
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Government Vacancies</h1>
            <p className="text-slate-600 mt-1">View and manage government job vacancies</p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => navigate('/cms/govt-vacancies/create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Vacancy
          </Button>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">All Vacancies</CardTitle>
                <CardDescription>Search and manage government job vacancies</CardDescription>
              </div>
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
              <div className="grid gap-6">
                {vacancies.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No vacancies found</div>
                ) : (
                  vacancies.map((vacancy: any) => {
                    const descriptionText = stripHtmlTags(vacancy.description || '');
                    return (
                      <Card key={vacancy.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl mb-2">{vacancy.nameOfPost || vacancy.postName || vacancy.title || 'Government Vacancy'}</CardTitle>
                              <CardDescription className="text-base mb-3">
                                {vacancy.examName && <span>{vacancy.examName}</span>}
                                {vacancy.examLevel && (
                                  <span className="text-slate-500"> • {vacancy.examLevel}</span>
                                )}
                              </CardDescription>
                              
                              {/* All Vacancy Fields Grid */}
                              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                                {vacancy.examLevel && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>Level: {vacancy.examLevel}</span>
                                  </div>
                                )}
                                {vacancy.examName && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{vacancy.examName}</span>
                                  </div>
                                )}
                                {vacancy.firstAnnouncementDate && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>Announced: {new Date(vacancy.firstAnnouncementDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {vacancy.applicationSubmissionLastDate && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>Apply by: {new Date(vacancy.applicationSubmissionLastDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {vacancy.examDate && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>Exam: {new Date(vacancy.examDate).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {vacancy.examFees && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <DollarSign className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>₹{vacancy.examFees}</span>
                                  </div>
                                )}
                                {vacancy.vacanciesSeat && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Users className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>{vacancy.vacanciesSeat} vacancies</span>
                                  </div>
                                )}
                                {vacancy.evaluationExamPattern && (
                                  <div className="flex items-center gap-2 text-slate-600 col-span-2">
                                    <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">Pattern: {vacancy.evaluationExamPattern}</span>
                                  </div>
                                )}
                                {vacancy.cutoff && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>Cutoff: {vacancy.cutoff}</span>
                                  </div>
                                )}
                                {vacancy.ageLimit && (
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Users className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>Age: {vacancy.ageLimit}</span>
                                  </div>
                                )}
                                {vacancy.eligibility && (
                                  <div className="flex items-start gap-2 text-slate-600 col-span-2">
                                    <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-xs line-clamp-1">{vacancy.eligibility}</span>
                                  </div>
                                )}
                                {vacancy.applicationLink && (
                                  <div className="flex items-center gap-2 text-blue-600 col-span-2">
                                    <MapPin className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-xs truncate">Application Link Available</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* Description - 2-3 lines */}
                          {descriptionText && (
                            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <p className="text-sm text-slate-700 line-clamp-3">{descriptionText}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedVacancy(vacancy);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/cms/govt-vacancies/edit/${vacancy.id}`)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this vacancy?')) {
                                  deleteMutation.mutate(vacancy.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVacancy?.nameOfPost || selectedVacancy?.postName || selectedVacancy?.title || 'Government Vacancy'}</DialogTitle>
              <DialogDescription>
                {selectedVacancy?.examName || 'Government Job'}
                {selectedVacancy?.examLevel && ` • ${selectedVacancy.examLevel}`}
              </DialogDescription>
            </DialogHeader>
            {selectedVacancy ? (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedVacancy.examLevel && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Exam Level</h3>
                      <p className="text-slate-600">{selectedVacancy.examLevel}</p>
                    </div>
                  )}
                  {selectedVacancy.examName && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Exam Name</h3>
                      <p className="text-slate-600">{selectedVacancy.examName}</p>
                    </div>
                  )}
                  {selectedVacancy.firstAnnouncementDate && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">First Announcement Date</h3>
                      <p className="text-slate-600">{new Date(selectedVacancy.firstAnnouncementDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedVacancy.applicationSubmissionLastDate && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Application Deadline</h3>
                      <p className="text-slate-600">{new Date(selectedVacancy.applicationSubmissionLastDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedVacancy.examDate && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Exam Date</h3>
                      <p className="text-slate-600">{new Date(selectedVacancy.examDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedVacancy.examFees && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Exam Fees</h3>
                      <p className="text-slate-600">₹{selectedVacancy.examFees}</p>
                    </div>
                  )}
                  {selectedVacancy.vacanciesSeat && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Vacancies</h3>
                      <p className="text-slate-600">{selectedVacancy.vacanciesSeat}</p>
                    </div>
                  )}
                  {selectedVacancy.ageLimit && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Age Limit</h3>
                      <p className="text-slate-600">{selectedVacancy.ageLimit}</p>
                    </div>
                  )}
                  {selectedVacancy.eligibility && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Eligibility</h3>
                      <p className="text-slate-600">{selectedVacancy.eligibility}</p>
                    </div>
                  )}
                  {selectedVacancy.evaluationExamPattern && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Exam Pattern</h3>
                      <p className="text-slate-600">{selectedVacancy.evaluationExamPattern}</p>
                    </div>
                  )}
                  {selectedVacancy.cutoff && (
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Cutoff</h3>
                      <p className="text-slate-600">{selectedVacancy.cutoff}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedVacancy.description && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                    <p className="text-slate-600 whitespace-pre-wrap">{stripHtmlTags(selectedVacancy.description)}</p>
                  </div>
                )}
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

