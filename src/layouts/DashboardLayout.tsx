import Sidebar from '../components/Sidebar';
import { useAuth } from '../lib/auth';
import { Navigate, Outlet } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function DashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner text="Loading dashboard..." />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64 p-8">
        <Outlet />
      </div>
    </div>
  );
}
