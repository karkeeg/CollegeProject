import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  LogOut, 
  Settings,
  UserCheck,
  Bell,
  Calendar,
  Link as LinkIcon,
  ClipboardList,
  Building2
} from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
  const { role, signOut } = useAuth();

  const links = [
    // Admin Links
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { to: '/admin/students', label: 'Students', icon: Users, roles: ['admin'] },
    { to: '/admin/teachers', label: 'Teachers', icon: GraduationCap, roles: ['admin'] },
    { to: '/admin/subjects', label: 'Subjects', icon: BookOpen, roles: ['admin'] },
    { to: '/admin/assignments', label: 'Assignments', icon: LinkIcon, roles: ['admin'] },
    { to: '/admin/notices', label: 'Notices', icon: Bell, roles: ['admin'] },
    { to: '/admin/routine', label: 'Class Routine', icon: Calendar, roles: ['admin'] },
    { to: '/admin/programs', label: 'Programs', icon: Building2, roles: ['admin'] },
    
    // Teacher Links
    { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard, roles: ['teacher'] },
    { to: '/teacher/classes', label: 'My Classes', icon: Users, roles: ['teacher'] },
    { to: '/teacher/marks', label: 'Marks Entry', icon: FileText, roles: ['teacher'] },
    { to: '/teacher/assignments', label: 'Assignments', icon: ClipboardList, roles: ['teacher'] },

    // Student Links
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, roles: ['student'] },
    { to: '/student/notices', label: 'Notice Board', icon: Bell, roles: ['student'] },
    { to: '/student/routine', label: 'Class Routine', icon: Calendar, roles: ['student'] },
    { to: '/student/assignments', label: 'Assignments', icon: ClipboardList, roles: ['student'] },
    { to: '/student/attendance', label: 'Attendance', icon: UserCheck, roles: ['student'] },
    { to: '/student/results', label: 'Results', icon: FileText, roles: ['student'] },
  ];

  // Common Links
  const commonLinks = [
     { to: `/${role}/profile`, label: 'Profile', icon: Settings, roles: ['admin', 'teacher', 'student'] },
  ];

  const filteredLinks = [...links, ...commonLinks].filter(link => link.roles.includes(role || ''));

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-lg font-bold flex items-center gap-2 text-indigo-600">
          <GraduationCap className="w-7 h-7" />
          <span>College SIS</span>
        </h1>
        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">{role} Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to.split('/').length === 2}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              isActive 
                ? "bg-indigo-50 text-indigo-600 font-bold" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <link.icon size={18} />
            <span className="text-sm">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
