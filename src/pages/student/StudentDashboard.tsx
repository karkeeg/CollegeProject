import { useEffect, useState } from 'react';
import api from '../../lib/api';
// import { useAuth } from '../../lib/auth';
import {
  Calendar,
  BookOpen,
  Award,
  User,
  Bell,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface StudentData {
  id: string;
  rollNo: number;
  studentCode: string;
  currentSemesterId: number;
  profile?: { fullName: string; email: string };
  semester?: { name: string };
}

interface Subject {
  id: number;
  code: string;
  name: string;
  creditHours: number;
}

interface DashboardStats {
  attendancePercentage: number;
  sgpa: number;
  totalClasses: number;
  attendedClasses: number;
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ attendancePercentage: 0, sgpa: 0, totalClasses: 0, attendedClasses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  async function fetchStudentData() {
    setLoading(true);
    try {
      const [profileRes, subjectsRes, statsRes, noticesRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/subjects'),
        api.get('/student/dashboard-stats'),
        api.get('/notices')
      ]);

      setStudent(profileRes.data);
      setSubjects(subjectsRes.data);
      setStats(statsRes.data);
      setNotices(noticesRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  }



// ... (imports)

// ... (inside component)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner text="Loading profile..." />
      </div>
    );
  }

  if (!student) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-2xl border border-red-100 mt-8">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
         <User size={40} className="text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">Access Restricted or Profile Missing</h2>
      <p className="text-slate-500 mt-2 max-w-sm">
        We couldn't load your profile. This usually happens if you haven't been assigned as a Student or if there is a permission error in the database.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{student.profile?.fullName}</h1>
        <p className="text-gray-500">{student.semester?.name || 'No Semester'} • Roll No: {student.rollNo}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         {/* Attendance */}
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
               <Calendar size={24} />
            </div>
            <div>
               <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Attendance</p>
               <p className="text-2xl font-bold text-gray-900">{stats.attendancePercentage}%</p>
            </div>
         </div>

         {/* SGPA */}
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
               <Award size={24} />
            </div>
            <div>
               <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Current SGPA</p>
               <p className="text-2xl font-bold text-gray-900">{stats.sgpa > 0 ? stats.sgpa.toFixed(2) : 'N/A'}</p>
            </div>
         </div>

         {/* Enrolled Courses */}
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
               <BookOpen size={24} />
            </div>
            <div>
               <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Courses</p>
               <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
            </div>
         </div>

         {/* Quick Actions */}
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="flex gap-2">
               <Link to="/student/attendance" className="p-2 bg-gray-50 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Attendance">
                  <Calendar size={18} />
               </Link>
               <Link to="/student/results" className="p-2 bg-gray-50 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors" title="Results">
                  <Award size={18} />
               </Link>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Notices Section */}
        <div className="lg:col-span-2">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <Bell size={20} className="text-indigo-600" />
                 Latest Announcements
              </h2>
              <Link to="/student/notices" className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
                 View All <ArrowRight size={14} />
              </Link>
           </div>
           
           <div className="space-y-4">
              {notices.length === 0 ? (
                 <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
                    <p className="text-gray-500 text-sm">No new announcements at the moment.</p>
                 </div>
              ) : (
                 notices.map((notice) => (
                    <div key={notice.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group">
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{notice.title}</h3>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(notice.createdAt).toLocaleDateString()}</span>
                       </div>
                       <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{notice.content}</p>
                    </div>
                 ))
              )}
           </div>
        </div>

        {/* Courses Section (Sidebar style on grid) */}
        <div>
            <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-600" />
                    Enrolled Courses
                </h2>
            </div>
            <div className="space-y-3">
                {subjects.slice(0, 5).map((subject) => (
                    <div key={subject.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="font-bold text-gray-900 text-sm">{subject.name}</p>
                            <p className="text-[10px] font-mono text-gray-400 uppercase">{subject.code}</p>
                        </div>
                        <div className="text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded">
                            {subject.creditHours} CH
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="mb-6">
         <h2 className="text-lg font-bold text-gray-900">Active Curriculum</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-500 transition-all">
             <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {subject.code}
                </span>
                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold text-gray-600">
                   {subject.creditHours} CREDITS
                </span>
             </div>
             <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {subject.name}
             </h3>
          </div>
        ))}
      </div>
    </div>
  );
}
