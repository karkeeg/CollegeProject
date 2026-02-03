import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

import LoadingSpinner from './ui/LoadingSpinner';

interface RequireRoleProps {
  allowedRoles: ('admin' | 'teacher' | 'student')[];
}

export default function RequireRole({ allowedRoles }: RequireRoleProps) {
  const { role, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner text="Verifying access..." />
    </div>
  );

  if (!role || !allowedRoles.includes(role)) {
     // Redirect based on role or to login
     // If logged in but wrong role, maybe to their respective dashboard?
     // For now, simpler: redirect to login or show 403.
     return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
