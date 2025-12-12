import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If allowedRoles is specified, check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    const userType = user?.userType || user?.user_type || 'ADMIN';
    if (!allowedRoles.includes(userType)) {
      // Redirect based on role
      if (userType === 'COMPANY') {
        return <Navigate to="/recruiter/dashboard" />;
      }
      return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
}

