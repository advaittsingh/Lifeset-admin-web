import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Download, Upload, FileText, Image as ImageIcon, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { institutesApi } from '../../services/api/institutes';
import { cmsApi } from '../../services/api/cms';
import { postsApi } from '../../services/api/posts';

interface UploadedImage {
  id: number;
  name: string;
  date: string;
}

type UploadType = 'awarded' | 'specialisation' | 'generalKnowledge' | 'mcq' | 'currentAffairs' | 'none';

export default function BulkUploadPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<UploadType>('none');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories and awardeds for CSV parsing
  const { data: categoriesData } = useQuery({
    queryKey: ['course-master-categories'],
    queryFn: () => institutesApi.getCourseMasterData(),
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || []);

  const { data: awardedsData } = useQuery({
    queryKey: ['awarded-list-for-upload'],
    queryFn: () => institutesApi.getAwardedData(),
    enabled: uploadType === 'specialisation',
  });
  const awardeds = Array.isArray(awardedsData) ? awardedsData : (awardedsData?.data || []);

  // Wall categories for GK/Current Affairs mapping
  const { data: wallCategoriesData } = useQuery({
    queryKey: ['wall-categories-for-bulk'],
    queryFn: () => postsApi.getWallCategories(),
  });
  const wallCategories = Array.isArray(wallCategoriesData) ? wallCategoriesData : (wallCategoriesData?.data || []);

  // MCQ categories
  const { data: mcqCategoriesData } = useQuery({
    queryKey: ['mcq-categories-for-bulk'],
    queryFn: () => cmsApi.getMcqCategories(),
  });
  const mcqCategories = Array.isArray(mcqCategoriesData) ? mcqCategoriesData : (mcqCategoriesData?.data || []);

  // Placeholder for uploaded images list (awaiting API wiring)
  const images: UploadedImage[] = [];
  const filteredImages = images.filter((img: UploadedImage) =>
    img.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredImages.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedImages = filteredImages.slice(startIndex, endIndex);

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const handleCsvFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Block selection if no upload type is chosen to avoid confusion
    if (uploadType === 'none') {
      showToast('Please select an upload type first', 'error');
      event.target.value = '';
      return;
    }

    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type === 'text/csv' ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')
      ) {
        setCsvFile(file);
        showToast('CSV file selected', 'success');
      } else {
        showToast('Please select a CSV or Excel file', 'error');
        event.target.value = '';
      }
    }
  };

  const handleImageFilesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const imageFiles = files.filter(file => 
        file.type.startsWith('image/') || 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)
      );
      if (imageFiles.length > 0) {
        setImageFiles(prev => [...prev, ...imageFiles]);
        showToast(`${imageFiles.length} image(s) selected`, 'success');
      } else {
        showToast('Please select image files only', 'error');
      }
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      showToast('Please select a CSV file first', 'error');
      return;
    }

    if (uploadType === 'none') {
      showToast('Please select an upload type', 'error');
      return;
    }

    setUploadingCsv(true);
    try {
      const text = await csvFile.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        showToast('CSV file must have at least a header and one data row', 'error');
        setUploadingCsv(false);
        return;
      }

      const headers = rows[0].map(h => h.toLowerCase().trim());
      const dataRows = rows.slice(1);

      if (uploadType === 'awarded') {
        // Expected headers: name, description (optional), courseCategoryId or courseCategoryName, isActive (optional)
        const categoryNameIndex = headers.findIndex(h => h.includes('category') && h.includes('name'));
        const categoryIdIndex = headers.findIndex(h => h.includes('category') && h.includes('id'));
        const nameIndex = headers.findIndex(h => h === 'name');
        const descIndex = headers.findIndex(h => h.includes('description'));
        const activeIndex = headers.findIndex(h => h.includes('active') || h.includes('isactive'));

        if (nameIndex === -1) {
          showToast('CSV must have a "name" column', 'error');
          setUploadingCsv(false);
          return;
        }

        const uploadData = dataRows
          .filter(row => row[nameIndex]?.trim())
          .map(row => {
            const name = row[nameIndex]?.trim();
            const description = descIndex >= 0 ? row[descIndex]?.trim() : undefined;
            let courseCategoryId = '';

            if (categoryIdIndex >= 0 && row[categoryIdIndex]?.trim()) {
              courseCategoryId = row[categoryIdIndex].trim();
            } else if (categoryNameIndex >= 0 && row[categoryNameIndex]?.trim()) {
              const categoryName = row[categoryNameIndex].trim();
              const category = categories.find((c: any) => c.name.toLowerCase() === categoryName.toLowerCase());
              if (!category) {
                throw new Error(`Category "${categoryName}" not found`);
              }
              courseCategoryId = category.id;
            } else {
              throw new Error('CSV must have either "courseCategoryId" or "courseCategoryName" column');
            }

            const isActive = activeIndex >= 0 
              ? row[activeIndex]?.trim().toLowerCase() === 'true' || row[activeIndex]?.trim().toLowerCase() === '1'
              : true;

            return { name, description, courseCategoryId, isActive };
          });

        const result = await institutesApi.bulkUploadAwarded(uploadData);
        const successCount = result.filter((r: any) => r.success).length;
        const failCount = result.length - successCount;
        showToast(
          `Upload complete: ${successCount} succeeded, ${failCount} failed`,
          failCount > 0 ? 'warning' : 'success'
        );
      } else if (uploadType === 'specialisation') {
        // Expected headers: name, description (optional), awardedId or awardedName, isActive (optional)
        const awardedNameIndex = headers.findIndex(h => h.includes('awarded') && h.includes('name'));
        const awardedIdIndex = headers.findIndex(h => h.includes('awarded') && h.includes('id'));
        const nameIndex = headers.findIndex(h => h === 'name');
        const descIndex = headers.findIndex(h => h.includes('description'));
        const activeIndex = headers.findIndex(h => h.includes('active') || h.includes('isactive'));

        if (nameIndex === -1) {
          showToast('CSV must have a "name" column', 'error');
          setUploadingCsv(false);
          return;
        }

        const uploadData = dataRows
          .filter(row => row[nameIndex]?.trim())
          .map(row => {
            const name = row[nameIndex]?.trim();
            const description = descIndex >= 0 ? row[descIndex]?.trim() : undefined;
            let awardedId = '';

            if (awardedIdIndex >= 0 && row[awardedIdIndex]?.trim()) {
              awardedId = row[awardedIdIndex].trim();
            } else if (awardedNameIndex >= 0 && row[awardedNameIndex]?.trim()) {
              const awardedName = row[awardedNameIndex].trim();
              const awarded = awardeds.find((a: any) => a.name.toLowerCase() === awardedName.toLowerCase());
              if (!awarded) {
                throw new Error(`Awarded "${awardedName}" not found`);
              }
              awardedId = awarded.id;
            } else {
              throw new Error('CSV must have either "awardedId" or "awardedName" column');
            }

            const isActive = activeIndex >= 0 
              ? row[activeIndex]?.trim().toLowerCase() === 'true' || row[activeIndex]?.trim().toLowerCase() === '1'
              : true;

            return { name, description, awardedId, isActive };
          });

        const result = await institutesApi.bulkUploadSpecialisation(uploadData);
        const successCount = result.filter((r: any) => r.success).length;
        const failCount = result.length - successCount;
        showToast(
          `Upload complete: ${successCount} succeeded, ${failCount} failed`,
          failCount > 0 ? 'warning' : 'success'
        );
      } else if (uploadType === 'generalKnowledge') {
        const titleIndex = headers.findIndex(h => h === 'title');
        const descIndex = headers.findIndex(h => h === 'description');
        const categoryIdIndex = headers.findIndex(h => h.includes('categoryid'));
        const categoryNameIndex = headers.findIndex(h => h.includes('category') && h.includes('name'));
        const fullArticleIndex = headers.findIndex(h => h.includes('fullarticle') || h.includes('full_article'));
        const subCategoryIndex = headers.findIndex(h => h.includes('subcategory'));
        const sectionIndex = headers.findIndex(h => h === 'section');
        const countryIndex = headers.findIndex(h => h === 'country');
        const imageIndex = headers.findIndex(h => h.includes('image'));

        if (titleIndex === -1 || descIndex === -1) {
          showToast('CSV must have "title" and "description" columns', 'error');
          setUploadingCsv(false);
          return;
        }

        const results: { success: boolean }[] = [];
        for (const row of dataRows) {
          try {
            const title = row[titleIndex]?.trim();
            if (!title) continue;
            const description = row[descIndex]?.trim() || '';
            let categoryId = '';

            if (categoryIdIndex >= 0 && row[categoryIdIndex]?.trim()) {
              categoryId = row[categoryIdIndex].trim();
            } else if (categoryNameIndex >= 0 && row[categoryNameIndex]?.trim()) {
              const categoryName = row[categoryNameIndex].trim();
              const found = wallCategories.find((c: any) => c.name?.toLowerCase() === categoryName.toLowerCase());
              if (found) categoryId = found.id;
            }

            await cmsApi.createGeneralKnowledge({
              title,
              description,
              categoryId: categoryId || undefined,
              images: imageIndex >= 0 && row[imageIndex]?.trim() ? [row[imageIndex].trim()] : [],
              metadata: {
                fullArticle: fullArticleIndex >= 0 ? row[fullArticleIndex]?.trim() : '',
                category: categoryNameIndex >= 0 ? row[categoryNameIndex]?.trim() : '',
                subCategory: subCategoryIndex >= 0 ? row[subCategoryIndex]?.trim() : '',
                section: sectionIndex >= 0 ? row[sectionIndex]?.trim() : '',
                country: countryIndex >= 0 ? row[countryIndex]?.trim() : '',
              },
            });
            results.push({ success: true });
          } catch (error) {
            results.push({ success: false });
          }
        }
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;
        showToast(`Upload complete: ${successCount} succeeded, ${failCount} failed`, failCount > 0 ? 'warning' : 'success');
      } else if (uploadType === 'currentAffairs') {
        const titleIndex = headers.findIndex(h => h === 'title');
        const descIndex = headers.findIndex(h => h === 'description');
        const categoryIdIndex = headers.findIndex(h => h.includes('categoryid'));
        const categoryNameIndex = headers.findIndex(h => h.includes('category') && h.includes('name'));
        const subCategoryIndex = headers.findIndex(h => h.includes('subcategory'));
        const sectionIndex = headers.findIndex(h => h === 'section');
        const countryIndex = headers.findIndex(h => h === 'country');
        const imageIndex = headers.findIndex(h => h.includes('image'));

        if (titleIndex === -1 || descIndex === -1) {
          showToast('CSV must have "title" and "description" columns', 'error');
          setUploadingCsv(false);
          return;
        }

        const results: { success: boolean }[] = [];
        for (const row of dataRows) {
          try {
            const title = row[titleIndex]?.trim();
            if (!title) continue;
            const description = row[descIndex]?.trim() || '';
            let categoryId = '';

            if (categoryIdIndex >= 0 && row[categoryIdIndex]?.trim()) {
              categoryId = row[categoryIdIndex].trim();
            } else if (categoryNameIndex >= 0 && row[categoryNameIndex]?.trim()) {
              const categoryName = row[categoryNameIndex].trim();
              const found = wallCategories.find((c: any) => c.name?.toLowerCase() === categoryName.toLowerCase());
              if (found) categoryId = found.id;
            }

            await cmsApi.createCurrentAffair({
              title,
              description,
              categoryId: categoryId || undefined,
              images: imageIndex >= 0 && row[imageIndex]?.trim() ? [row[imageIndex].trim()] : [],
              metadata: {
                subCategoryId: subCategoryIndex >= 0 ? row[subCategoryIndex]?.trim() : '',
                section: sectionIndex >= 0 ? row[sectionIndex]?.trim() : '',
                country: countryIndex >= 0 ? row[countryIndex]?.trim() : '',
                fullArticle: '',
              },
            });
            results.push({ success: true });
          } catch (error) {
            results.push({ success: false });
          }
        }
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;
        showToast(`Upload complete: ${successCount} succeeded, ${failCount} failed`, failCount > 0 ? 'warning' : 'success');
      } else if (uploadType === 'mcq') {
        const questionIndex = headers.findIndex(h => h === 'question');
        const explanationIndex = headers.findIndex(h => h.includes('explanation'));
        const categoryIdIndex = headers.findIndex(h => h.includes('categoryid'));
        const categoryNameIndex = headers.findIndex(h => h.includes('category') && h.includes('name'));
        const correctIndex = headers.findIndex(h => h.includes('correct'));
        const optionIndexes = headers
          .map((h, idx) => ({ h, idx }))
          .filter(entry => entry.h.startsWith('option'));

        if (questionIndex === -1 || optionIndexes.length < 2 || correctIndex === -1) {
          showToast('MCQ CSV needs question, option1/2..., and correctAnswer columns', 'error');
          setUploadingCsv(false);
          return;
        }

        const results: { success: boolean }[] = [];
        for (const row of dataRows) {
          try {
            const question = row[questionIndex]?.trim();
            if (!question) continue;
            const options = optionIndexes
              .sort((a, b) => a.h.localeCompare(b.h))
              .map(entry => row[entry.idx]?.trim())
              .filter(opt => opt);
            if (options.length < 2) continue;

            const correctRaw = row[correctIndex]?.trim();
            const correctAnswer = correctRaw ? Number(correctRaw) - 1 : 0;
            let categoryId = '';

            if (categoryIdIndex >= 0 && row[categoryIdIndex]?.trim()) {
              categoryId = row[categoryIdIndex].trim();
            } else if (categoryNameIndex >= 0 && row[categoryNameIndex]?.trim()) {
              const catName = row[categoryNameIndex].trim();
              const found = mcqCategories.find((c: any) => c.name?.toLowerCase() === catName.toLowerCase());
              if (found) categoryId = found.id;
            }

            await cmsApi.createMcqQuestion({
              question,
              options: options.map((opt, idx) => ({ text: opt, isCorrect: idx === correctAnswer })),
              correctAnswer,
              categoryId: categoryId || undefined,
              explanation: explanationIndex >= 0 ? row[explanationIndex]?.trim() : undefined,
            });
            results.push({ success: true });
          } catch (error) {
            results.push({ success: false });
          }
        }
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;
        showToast(`Upload complete: ${successCount} succeeded, ${failCount} failed`, failCount > 0 ? 'warning' : 'success');
      }

      setCsvFile(null);
      setUploadType('none');
    } catch (error: any) {
      showToast(error.message || 'CSV upload failed. Please try again.', 'error');
    } finally {
      setUploadingCsv(false);
    }
  };

  const handleImageUpload = async () => {
    if (imageFiles.length === 0) {
      showToast('Please select image files first', 'error');
      return;
    }

    setUploadingImages(true);
    try {
      // Simulate upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      showToast(`${imageFiles.length} image(s) uploaded successfully!`, 'success');
      setImageFiles([]);
    } catch (error) {
      showToast('Image upload failed. Please try again.', 'error');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDownloadSample = (type: string) => {
    showToast(`Downloading ${type} sample CSV...`, 'info');
    // In production, this would download the actual template file
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bulk Upload Post</h1>
          </div>
        </div>

        {/* Sample CSV Buttons */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Sample CSV Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => handleDownloadSample('Job')}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Job Sample CSV
              </Button>
              <Button
                onClick={() => handleDownloadSample('Event')}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Event Sample CSV
              </Button>
              <Button
                onClick={() => handleDownloadSample('Q&A')}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Q&A csv
              </Button>
              <Button
                onClick={() => handleDownloadSample('Review')}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Review csv
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upload Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* CSV Upload */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload CSV (Awarded/Specialisation/Content)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Upload Type</label>
                <select
                  value={uploadType}
                  onChange={(e) => {
                    setUploadType(e.target.value as UploadType);
                    setCsvFile(null);
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">Select type...</option>
                  <option value="awarded">Awarded</option>
                  <option value="specialisation">Specialisation</option>
                  <option value="generalKnowledge">General Knowledge</option>
                  <option value="currentAffairs">Current Affairs</option>
                  <option value="mcq">MCQ</option>
                </select>
              </div>
              <div>
                <input
                  ref={csvInputRef}
                  type="file"
                  id="csv-upload"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleCsvFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={() => {
                    if (uploadType === 'none') {
                      showToast('Please select an upload type first', 'error');
                      return;
                    }
                    csvInputRef.current?.click();
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                <p className="text-sm text-slate-600 mt-2">
                  {csvFile ? csvFile.name : 'no file selected'}
                </p>
                {uploadType === 'awarded' && (
                  <p className="text-xs text-slate-500 mt-1">
                    CSV format: name, description (optional), courseCategoryId or courseCategoryName, isActive (optional)
                  </p>
                )}
                {uploadType === 'specialisation' && (
                  <p className="text-xs text-slate-500 mt-1">
                    CSV format: name, description (optional), awardedId or awardedName, isActive (optional)
                  </p>
                )}
              </div>
              <Button
                onClick={handleCsvUpload}
                disabled={!csvFile || uploadingCsv || uploadType === 'none'}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              >
                {uploadingCsv ? 'Uploading...' : 'Submit'}
              </Button>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  ref={imageInputRef}
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  multiple
                  onChange={handleImageFilesSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <p className="text-sm text-slate-600 mt-2">
                  {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'no files selected'}
                </p>
              </div>
              <Button
                onClick={handleImageUpload}
                disabled={imageFiles.length === 0 || uploadingImages}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              >
                {uploadingImages ? 'Uploading...' : 'Submit'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upload Image List Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-lg font-semibold">Upload Image list</CardTitle>
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
                    placeholder="Search"
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        ID
                        <span className="text-slate-400">↓</span>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedImages.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-slate-500">
                        No images to display yet
                      </td>
                    </tr>
                  ) : (
                    paginatedImages.map((image: UploadedImage) => (
                      <tr key={image.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 text-slate-900 font-medium">{image.id}</td>
                        <td className="py-3 px-4 text-slate-700">{image.name}</td>
                        <td className="py-3 px-4 text-slate-600">{image.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredImages.length)} of {filteredImages.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="border-slate-300"
                >
                  <ChevronLeft className="h-4 w-4" />
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
                            ? 'bg-slate-900 hover:bg-slate-800 text-white'
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
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
