import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface AssignedSubject {
  id: number;
  subject: {
    id: number;
    name: string;
    code: string;
    semester: {
      name: string;
    };
  };
}

export default function MarksEntry() {
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
      <LoadingSpinner text="Loading subjects..." />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Marks Entry</h1>
        <p className="text-gray-500">Select a subject to enter or update student marks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <Link 
            key={assignment.id} 
            to={`/teacher/subject/${assignment.subject.id}?tab=marks`}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all flex flex-col group"
          >
            <div className="flex justify-between items-start mb-4">
               <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  {assignment.subject.code}
               </span>
               <span className="text-[10px] bg-emerald-50 px-2 py-1 rounded font-bold text-emerald-600 uppercase">
                  {assignment.subject.semester.name}
               </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 leading-tight mb-6 group-hover:text-indigo-600 transition-colors">
               {assignment.subject.name}
            </h3>

            <div className="mt-auto pt-4 flex items-center justify-between text-indigo-600">
               <div className="flex items-center gap-2">
                  <FileText size={18} />
                  <span className="text-sm font-semibold">Enter Marks</span>
               </div>
               <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}

        {assignments.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-900">No subjects assigned</h3>
            <p className="text-gray-500">You need assigned subjects to enter marks.</p>
          </div>
        )}
      </div>
    </div>
  );
}
