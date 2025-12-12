import { Link, useLocation } from 'react-router-dom';
import { useRef, useEffect, useLayoutEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Bell,
  Settings,
  LogOut,
  BarChart3,
  Shield,
  ChevronRight,
  Newspaper,
  HelpCircle,
  Brain,
  Users as UsersIcon,
  Building2,
  BookOpen,
  TrendingUp,
  Calendar,
  Search,
  Server,
  Activity,
  Globe,
  Zap,
  GraduationCap,
      Award,
      FolderOpen,
      Megaphone,
      AlertCircle
    } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

// Core Management - Essential admin functions
const coreMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Users', path: '/users' },
  { icon: FileText, label: 'Posts', path: '/posts' },
  { icon: Megaphone, label: 'Sponsor Ads', path: '/sponsor-ads' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
];

// Jobs & Opportunities - All job-related content
const jobsMenuItems = [
  { icon: Briefcase, label: 'Job Postings', path: '/jobs' },
  { icon: Award, label: 'Govt Vacancies', path: '/cms/govt-vacancies' },
];

const monitoringMenuItems = [
      { icon: Server, label: 'Server', path: '/monitoring/server' },
      { icon: Activity, label: 'App', path: '/monitoring/app' },
      { icon: Globe, label: 'Web', path: '/monitoring/web' },
      { icon: TrendingUp, label: 'User Behavior', path: '/monitoring/user-behavior' },
      { icon: Zap, label: 'Engagement', path: '/monitoring/engagement' },
      { icon: Activity, label: 'System Health', path: '/monitoring/health' },
      { icon: AlertCircle, label: 'Error Logs', path: '/monitoring/errors' },
    ];

// Content Management - News, articles, and educational content
const contentMenuItems = [
  { icon: Newspaper, label: 'Current Affairs', path: '/cms/current-affairs' },
  { icon: BookOpen, label: 'General Knowledge', path: '/cms/general-knowledge' },
  { icon: Megaphone, label: 'Daily Digest', path: '/cms/daily-digest' },
];

// Learning & Assessment - Quizzes and tests
const learningMenuItems = [
  { icon: HelpCircle, label: 'MCQ', path: '/cms/mcq' },
  { icon: Brain, label: 'Know Yourself', path: '/cms/know-yourself' },
];

// Events & Community - Community features
const communityMenuItems = [
  { icon: Calendar, label: 'College Events', path: '/cms/college-events' },
  { icon: UsersIcon, label: 'Students Community', path: '/cms/community' },
];

const instituteMenuItems = [
  { icon: Building2, label: 'Institutes', path: '/institutes' },
  { icon: GraduationCap, label: 'Course Master', path: '/institutes/course-master' },
  { icon: Award, label: 'Awarded', path: '/dashboard/awards' },
  { icon: BookOpen, label: 'Specialisations', path: '/dashboard/specialisations' },
  { icon: Search, label: 'Search Institutes', path: '/institutes/search' },
];

const recruiterMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/recruiter/dashboard' },
  { icon: FolderOpen, label: 'Reports', path: '/recruiter/reports' },
  { icon: BarChart3, label: 'Analytics', path: '/recruiter/analytics' },
];

const settingsMenuItem = [
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const navRef = useRef<HTMLElement>(null);
  const isScrollingRef = useRef(false);
  
  // Determine user role
  const userType = user?.userType || user?.user_type || 'ADMIN';
  const isAdmin = userType === 'ADMIN' || userType === 'SUPER_ADMIN';
  const isRecruiter = userType === 'COMPANY';

  // Save scroll position to sessionStorage (debounced)
  const handleScroll = () => {
    if (navRef.current && !isScrollingRef.current) {
      const scrollTop = navRef.current.scrollTop;
      sessionStorage.setItem('sidebarScrollPosition', String(scrollTop));
    }
  };

  // Save scroll position before navigation
  useEffect(() => {
    const saveScroll = () => {
      if (navRef.current) {
        sessionStorage.setItem('sidebarScrollPosition', String(navRef.current.scrollTop));
      }
    };

    // Save before component unmounts or route changes
    return () => {
      saveScroll();
    };
  }, [location.pathname]);

  // Restore scroll position immediately after render (before paint)
  useLayoutEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('sidebarScrollPosition');
    if (navRef.current && savedScrollPosition !== null) {
      const scrollPos = Number(savedScrollPosition);
      if (scrollPos > 0) {
        isScrollingRef.current = true;
        // Restore immediately
        navRef.current.scrollTop = scrollPos;
        
        // Also restore after a short delay to catch any late resets
        const restoreScroll = () => {
          if (navRef.current && navRef.current.scrollTop === 0 && scrollPos > 0) {
            navRef.current.scrollTop = scrollPos;
          }
        };
        
        // Multiple attempts to ensure scroll is restored
        setTimeout(restoreScroll, 0);
        setTimeout(restoreScroll, 50);
        setTimeout(restoreScroll, 100);
        
        // Reset flag after a short delay to allow scroll events to resume
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 200);
      }
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-72 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl">
      {/* Header */}
      <div className="flex h-20 items-center border-b border-slate-700/50 px-6 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">LifeSet</h1>
            <p className="text-xs text-slate-400">
              {isRecruiter ? 'Recruiter Portal' : 'Admin Portal'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav 
        ref={navRef}
        className="flex-1 space-y-1 px-4 py-6 overflow-y-auto"
        onScroll={handleScroll}
      >
        {isRecruiter ? (
          /* Recruiter Menu - Only show recruiter-related items */
          <>
            {/* Recruiter Dashboard */}
            <Link
              to="/recruiter/dashboard"
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                location.pathname === '/recruiter/dashboard'
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              )}
            >
              <LayoutDashboard className={cn(
                "h-5 w-5 transition-transform duration-200",
                location.pathname === '/recruiter/dashboard' ? "scale-110" : "group-hover:scale-110"
              )} />
              <span className="flex-1">Dashboard</span>
              {location.pathname === '/recruiter/dashboard' && <ChevronRight className="h-4 w-4" />}
            </Link>

            {/* Recruiter Section */}
            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <p className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Recruiter</p>
              {recruiterMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          /* Admin Menu - Show all admin features, hide recruiter section */
          <>
            {/* Core Management */}
            <div className="mb-2">
              <p className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Core Management</p>
              {coreMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                );
              })}
            </div>

            {/* Jobs & Opportunities */}
            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <p className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Jobs & Opportunities</p>
              {jobsMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                );
              })}
            </div>

            {/* Content Management */}
            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <p className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Content</p>
              {contentMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                );
              })}
            </div>

            {/* Learning & Assessment */}
            <div className="pt-2">
              <p className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Learning</p>
              {learningMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                );
              })}
            </div>

            {/* Events & Community */}
            <div className="pt-2">
              <p className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Community</p>
              {communityMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                );
              })}
            </div>

            {/* Institute Section */}
            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <p className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Institutes</p>
              {instituteMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                );
              })}
            </div>

            {/* Monitoring Section */}
            <div className="pt-4 mt-4 border-t border-slate-700/50">
              <p className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Monitoring</p>
              {monitoringMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    )}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-110"
                    )} />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Settings */}
        {settingsMenuItem.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 mt-4",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive ? "scale-110" : "group-hover:scale-110"
              )} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
        <div className="mb-3 flex items-center gap-3 rounded-lg px-3 py-3 bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
            <span className="text-white font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.email || (isRecruiter ? 'Recruiter' : 'Administrator')}
            </p>
            <p className="text-xs text-slate-400">
              {isRecruiter ? 'Recruiter' : isAdmin ? 'Admin' : userType}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors group"
        >
          <LogOut className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
