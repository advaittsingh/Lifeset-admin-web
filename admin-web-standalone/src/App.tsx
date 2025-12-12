import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import BulkUploadPage from './pages/dashboard/BulkUploadPage';
import AppInstalledPage from './pages/dashboard/AppInstalledPage';
import AwardsPage from './pages/dashboard/AwardsPage';
import CreateAwardPage from './pages/dashboard/CreateAwardPage';
import SpecialisationPage from './pages/dashboard/SpecialisationPage';
import CreateSpecialisationPage from './pages/dashboard/CreateSpecialisationPage';
import WallCategoriesPage from './pages/dashboard/WallCategoriesPage';
import CourseRequestsPage from './pages/dashboard/CourseRequestsPage';
import SponsorAdsPage from './pages/sponsor-ads/SponsorAdsPage';
import AdManagementPage from './pages/sponsor-ads/AdManagementPage';
import UsersPage from './pages/users/UsersPage';
import PostsPage from './pages/posts/PostsPage';
import JobsPage from './pages/jobs/JobsPage';
import CreateJobPage from './pages/jobs/CreateJobPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import SettingsPage from './pages/settings/SettingsPage';

// CMS Pages
import CurrentAffairsPage from './pages/cms/CurrentAffairsPage';
import CreateCurrentAffairPage from './pages/cms/CreateCurrentAffairPage';
import GeneralKnowledgePage from './pages/cms/GeneralKnowledgePage';
import CreateGeneralKnowledgePage from './pages/cms/CreateGeneralKnowledgePage';
import McqPage from './pages/cms/McqPage';
import CreateMcqPage from './pages/cms/CreateMcqPage';
import DailyDigestPage from './pages/cms/DailyDigestPage';
import CreateDailyDigestPage from './pages/cms/CreateDailyDigestPage';
import CollegeEventsPage from './pages/cms/CollegeEventsPage';
import CreateCollegeEventPage from './pages/cms/CreateCollegeEventPage';
import KnowYourselfPage from './pages/cms/KnowYourselfPage';
import StudentsCommunityPage from './pages/cms/StudentsCommunityPage';
import GovtVacanciesPage from './pages/cms/GovtVacanciesPage';

// Institute Pages
import CourseMasterPage from './pages/institutes/CourseMasterPage';
import InstitutesPage from './pages/institutes/InstitutesPage';
import InstituteDashboardPage from './pages/institutes/InstituteDashboardPage';
import InstituteReportsPage from './pages/institutes/InstituteReportsPage';
import CourseCreationPage from './pages/institutes/CourseCreationPage';
import InstituteLandingPage from './pages/institutes/InstituteLandingPage';
import InstituteSearchPage from './pages/institutes/InstituteSearchPage';

// Recruiter Pages
import RecruiterDashboardPage from './pages/recruiter/RecruiterDashboardPage';
import RecruiterReportsPage from './pages/recruiter/RecruiterReportsPage';
import RecruiterAnalyticsPage from './pages/recruiter/RecruiterAnalyticsPage';

// Monitoring Pages
import ServerMonitoringPage from './pages/monitoring/ServerMonitoringPage';
import AppMonitoringPage from './pages/monitoring/AppMonitoringPage';
import WebMonitoringPage from './pages/monitoring/WebMonitoringPage';
import UserBehaviorPage from './pages/monitoring/UserBehaviorPage';
import EngagementPage from './pages/monitoring/EngagementPage';
import SystemHealthPage from './pages/monitoring/SystemHealthPage';
import ErrorLogsPage from './pages/monitoring/ErrorLogsPage';

import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check if user is already authenticated on mount
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      // Auth store will handle this, but we can trigger a check
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Admin Routes - Only accessible to ADMIN role */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bulk-upload"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <BulkUploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/app-installed"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <AppInstalledPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/awards"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <AwardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/awards/create"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateAwardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/awards/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateAwardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialisations"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <SpecialisationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialisations/create"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateSpecialisationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/specialisations/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateSpecialisationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/wall-categories"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <WallCategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/course-requests"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CourseRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <PostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sponsor-ads"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <SponsorAdsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sponsor-ads/manage"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <AdManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sponsor-ads/manage/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <AdManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <JobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/create"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        
        {/* CMS Routes - Only accessible to ADMIN role */}
        <Route
          path="/cms/current-affairs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CurrentAffairsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/current-affairs/create"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateCurrentAffairPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/current-affairs/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateCurrentAffairPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/general-knowledge"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <GeneralKnowledgePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/general-knowledge/create"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateGeneralKnowledgePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/general-knowledge/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateGeneralKnowledgePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/govt-vacancies"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <GovtVacanciesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/mcq"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <McqPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/mcq/create"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateMcqPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/mcq/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateMcqPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/know-yourself"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <KnowYourselfPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/community"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <StudentsCommunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/daily-digest"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <DailyDigestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/daily-digest/create"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateDailyDigestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/daily-digest/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateDailyDigestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/college-events"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CollegeEventsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/college-events/create"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateCollegeEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cms/college-events/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CreateCollegeEventPage />
            </ProtectedRoute>
          }
        />
        
        {/* Institute Routes - Only accessible to ADMIN role */}
        <Route
          path="/institutes/course-master"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CourseMasterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutes"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <InstitutesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutes/:id/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <InstituteDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutes/:id/reports"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <InstituteReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutes/:id/courses"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CourseCreationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutes/:id/landing"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <InstituteLandingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institutes/search"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <InstituteSearchPage />
            </ProtectedRoute>
          }
        />
        
        {/* Recruiter Routes - Only accessible to COMPANY role */}
        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute allowedRoles={['COMPANY']}>
              <RecruiterDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/reports"
          element={
            <ProtectedRoute allowedRoles={['COMPANY']}>
              <RecruiterReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/analytics"
          element={
            <ProtectedRoute allowedRoles={['COMPANY']}>
              <RecruiterAnalyticsPage />
            </ProtectedRoute>
          }
        />
        
        {/* Monitoring Routes - Only accessible to ADMIN role */}
        <Route
          path="/monitoring/server"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <ServerMonitoringPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monitoring/app"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <AppMonitoringPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monitoring/web"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <WebMonitoringPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monitoring/user-behavior"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <UserBehaviorPage />
            </ProtectedRoute>
          }
        />
            <Route
              path="/monitoring/engagement"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <EngagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/monitoring/health"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <SystemHealthPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/monitoring/errors"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <ErrorLogsPage />
                </ProtectedRoute>
              }
            />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              {(() => {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const userType = user?.userType || user?.user_type || 'ADMIN';
                if (userType === 'COMPANY') {
                  return <Navigate to="/recruiter/dashboard" />;
                }
                return <Navigate to="/dashboard" />;
              })()}
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

