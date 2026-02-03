import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { BookOpen, ArrowRight, Users, GraduationCap, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AssignedSubject {
  id: number;
  subjectId: number;
  academicYear: number;
  subject?: {
    code: string;
    name: string;
    semesterId: number;
    semester?: {
      name: string;
    };
  };
}

export default function TeacherDashboard() {
  const { user, role } = useAuth();
  const [assignments, setAssignments] = useState<AssignedSubject[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    setLoading(true);
    try {
      const [assignRes, noticesRes] = await Promise.all([
        api.get('/teacher/assignments'),
        api.get('/notices')
      ]);
      setAssignments(assignRes.data);
      setNotices(noticesRes.data.slice(0, 3));
      
      // Calculate total students (mock or from data if available)
      setTotalStudents(0); 
    } catch (error) {
       console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back, {user?.fullName || 'Teacher'}</h1>
        <p className="text-gray-500">Academic Year 2024 • {role} Panel</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Active Classes */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5">
           <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <BookOpen size={24} />
           </div>
           <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Active Classes</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
           </div>
        </div>

        {/* Total Students */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5">
           <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Users size={24} />
           </div>
           <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
           </div>
        </div>

        {/* Semesters */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5">
           <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <GraduationCap size={24} />
           </div>
           <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Teaching In</p>
              <p className="text-2xl font-bold text-gray-900">{Array.from(new Set(assignments.map(a => a.subject?.semesterId).filter(Boolean))).length} Semesters</p>
           </div>
        </div>
      </div>

      <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                 <Bell size={20} className="text-indigo-600" />
                 Latest Announcements
              </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {notices.length === 0 ? (
                 <div className="col-span-full bg-white p-8 rounded-xl border border-dashed border-gray-300 text-center">
                    <p className="text-gray-500 text-sm">No new announcements at the moment.</p>
                 </div>
              ) : (
                 notices.map((notice) => (
                    <div key={notice.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group">
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-sm">{notice.title}</h3>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(notice.createdAt).toLocaleDateString()}</span>
                       </div>
                       <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{notice.content}</p>
                    </div>
                 ))
              )}
          </div>
      </div>

      <div className="mb-6 mt-10">
         <h2 className="text-lg font-bold text-gray-900">My Assigned Subjects</h2>
      </div>
      
      {assignments.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
            <BookOpen size={40} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-gray-900 font-semibold text-lg">No Assignments Yet</h3>
            <p className="text-gray-500 mt-1">You haven't been assigned to any subjects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-500 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {assignment.subject?.semester?.name}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  {assignment.subject?.code}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {assignment.subject?.name}
              </h3>
              <p className="text-gray-500 text-sm mb-6">Academic Year {assignment.academicYear}</p>

              <div className="mt-auto">
                <Link 
                    to={`/teacher/subject/${assignment.subjectId}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all"
                >
                    Manage Class <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
