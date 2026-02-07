import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
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
    <div className="min-h-screen bg-gray-50/50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
