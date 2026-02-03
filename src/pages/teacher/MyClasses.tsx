import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { BookOpen, Users, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface AssignedSubject {
  id: number;
  subject: {
    id: number;
    name: string;
    code: string;
    semesterId: number;
    semester: {
      name: string;
    };
  };
}

export default function MyClasses() {
  const [assignments, setAssignments] = useState<AssignedSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    try {
      const { data } = await api.get('/teacher/assignments');
      setAssignments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <LoadingSpinner text="Loading your classes..." />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-500">Manage attendance and marks for your assigned subjects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-500 transition-all flex flex-col group">
            <div className="flex justify-between items-start mb-4">
               <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {assignment.subject.code}
               </span>
               <span className="text-[10px] bg-indigo-50 px-2 py-1 rounded font-bold text-indigo-600 uppercase">
                  {assignment.subject.semester.name}
               </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-6">
               {assignment.subject.name}
            </h3>

            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex gap-3">
                <Link 
                  to={`/teacher/subject/${assignment.subject.id}`}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                  title="Attendance"
                >
                  <Calendar size={18} />
                </Link>
                <Link 
                  to={`/teacher/subject/${assignment.subject.id}`}
                  className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                  title="Marks Entry"
                >
                  <Users size={18} />
                </Link>
              </div>
              
              <Link 
                to={`/teacher/subject/${assignment.subject.id}`}
                className="flex items-center gap-1 text-sm font-bold text-indigo-600 group-hover:translate-x-1 transition-transform"
              >
                View Details <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}

        {assignments.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No classes assigned</h3>
            <p className="text-gray-500">You don't have any subjects assigned for this semester yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
