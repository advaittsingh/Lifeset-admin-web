import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import PostsPage from './pages/posts/PostsPage';
import JobsPage from './pages/jobs/JobsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import SettingsPage from './pages/settings/SettingsPage';

// CMS Pages
import CurrentAffairsPage from './pages/cms/CurrentAffairsPage';
import GeneralKnowledgePage from './pages/cms/GeneralKnowledgePage';
import McqPage from './pages/cms/McqPage';
import KnowYourselfPage from './pages/cms/KnowYourselfPage';
import StudentsCommunityPage from './pages/cms/StudentsCommunityPage';
import DailyDigestPage from './pages/cms/DailyDigestPage';
import CollegeEventsPage from './pages/cms/CollegeEventsPage';
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
          path="/jobs"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <JobsPage />
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
          path="/cms/general-knowledge"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <GeneralKnowledgePage />
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
          path="/cms/college-events"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <CollegeEventsPage />
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

