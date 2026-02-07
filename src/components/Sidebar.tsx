import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Building2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import api from '../lib/api';

export default function Sidebar() {
  const { role, signOut } = useAuth();
  const location = useLocation();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isSubjectsExpanded, setIsSubjectsExpanded] = useState(true);

  useEffect(() => {
    if (role === 'student') {
        fetchStudentSubjects();
    }
  }, [role]);

  const fetchStudentSubjects = async () => {
    try {
        const { data } = await api.get('/student/subjects');
        setSubjects(data);
    } catch (error) {
        console.error("Failed to fetch subjects for sidebar", error);
    }
  };

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
    // Class Routine removed, will be replaced by dynamic subjects
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
    <div className="h-screen w-64 bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 overflow-hidden">
      <div className="p-6 h-20 border-b border-gray-50 flex flex-col justify-center">
        <h1 className="text-lg font-bold flex items-center gap-2 text-gray-900 font-display">
          <div className="p-1.5 bg-gray-50 rounded-lg">
            <GraduationCap className="w-5 h-5 text-gray-900" />
          </div>
          <span className="tracking-tight">College <span className="text-gray-400">SIS</span></span>
        </h1>
        <p className="text-[9px] text-gray-400 mt-0.5 uppercase font-bold tracking-[0.2em]">{role} Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to.split('/').length === 2}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 tracking-tight",
              isActive 
                ? "bg-gray-100 text-gray-900 font-bold" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            {({ isActive }) => (
              <>
                <link.icon size={18} className={clsx(isActive ? "text-gray-900" : "text-gray-400")} />
                <span className="text-sm">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {role === 'student' && (
            <div className="mt-4 pt-4 border-t border-gray-50">
                <button 
                    onClick={() => setIsSubjectsExpanded(!isSubjectsExpanded)}
                    className="flex items-center justify-between w-full px-4 py-2 text-gray-500 hover:text-gray-900 transition mb-1"
                >
                    <div className="flex items-center gap-3">
                        <BookOpen size={18} className="text-gray-400" />
                        <span className="text-sm font-semibold tracking-tight">My Subjects</span>
                    </div>
                    {isSubjectsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                
                {isSubjectsExpanded && (
                    <div className="space-y-0.5 ml-4 pl-4 border-l border-gray-50">
                        {subjects.map(subject => (
                            <NavLink
                                key={subject.id}
                                to={`/student/subject/${subject.id}`}
                                className={({ isActive }) => clsx(
                                    "block px-3 py-2 rounded-lg text-xs font-medium transition-all truncate tracking-tight",
                                    isActive || location.pathname.includes(`/student/subject/${subject.id}`)
                                        ? "bg-gray-100 text-gray-900 font-bold" 
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                )}
                            >
                                {subject.name}
                            </NavLink>
                        ))}
                        {subjects.length === 0 && (
                            <div className="px-3 py-2 text-[10px] text-gray-400 italic">No subjects enrolled</div>
                        )}
                    </div>
                )}
            </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-50 z-10">
        <button 
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 tracking-tight font-medium"
        >
          <LogOut size={18} />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
