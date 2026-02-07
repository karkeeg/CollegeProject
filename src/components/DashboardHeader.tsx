import { Bell, User } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function DashboardHeader() {
  const { user, role } = useAuth();
  const location = useLocation();

  // Helper to get Page Title from path
  const getPageTitle = (path: string) => {
    const parts = path.split('/').filter(p => p);
    if (parts.length === 0) return 'Dashboard';
    
    // Custom labels for paths
    const labels: Record<string, string> = {
      'admin': 'Admin Dashboard',
      'teacher': 'Teacher Dashboard',
      'student': 'Student Dashboard',
      'students': 'Student Management',
      'teachers': 'Teacher Management',
      'subjects': 'Subject Management',
      'assignments': 'Assignments',
      'notices': 'Notice Board',
      'routine': 'Class Routine',
      'programs': 'Programs',
      'classes': 'My Classes',
      'marks': 'Marks Entry',
      'attendance': 'Attendance',
      'results': 'Results',
      'profile': 'My Profile'
    };

    const lastPart = parts[parts.length - 1];
    if (labels[lastPart]) return labels[lastPart];
    
    // Fallback: Capitalize and remove hyphens
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
  };

  const title = getPageTitle(location.pathname);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight font-display">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-gray-100"></div>

        {/* Profile Link */}
        <Link 
          to={`/${role}/profile`}
          className="flex items-center gap-3 group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 leading-none group-hover:text-indigo-600 transition-colors">
              {(user as any)?.name || 'User'}
            </p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">
              {role}
            </p>
          </div>
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-indigo-100 group-hover:bg-indigo-50 transition-all">
            {(user as any)?.avatar_url ? (
              <img src={(user as any).avatar_url} alt="Profile" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <User size={20} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
