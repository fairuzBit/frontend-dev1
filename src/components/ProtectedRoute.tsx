import { Navigate } from 'react-router-dom';
import { useAuth, getRoleLabel, hasRole } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-600">
        Memuat sesi pengguna...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.some((role) => hasRole(user, role));
    
    if (!hasAllowedRole) {
      const primaryRole = getRoleLabel(user);
      if (primaryRole === 'admin') {
        return <Navigate to="/admin" replace />;
      }

      if (primaryRole === 'tutor') {
        return <Navigate to="/tutor" replace />;
      }

      return <Navigate to="/learner" replace />;
    }
  }

  return children;
}
