import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { ArrowLeft, BookOpen, Folder, Calendar, Clock, HelpCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MaterialsList from '../../components/MaterialsList';
import StudentQuizListView from '../../components/student/StudentQuizListView';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const StudentScheduleView = ({ subjectId }: { subjectId: number }) => {
    const [routines, setRoutines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoutines();
    }, [subjectId]);

    const fetchRoutines = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/student/routine');
            // Filter routines for this subject
            const subjectRoutines = data.filter((r: any) => r.subject.id === subjectId);
            setRoutines(subjectRoutines);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load schedule");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="py-12 flex justify-center"><LoadingSpinner /></div>;

    if (routines.length === 0) return (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No classes scheduled for this subject.</p>
        </div>
    );

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="text-indigo-600" size={20} />
                    Class Schedule
                </h2>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Weekly Routine</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routines.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((routine) => (
                    <div key={routine.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={clsx(
                                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                                    routine.dayOfWeek === new Date().getDay() ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"
                                )}>
                                    {DAYS[routine.dayOfWeek]}
                                </span>
                                {routine.dayOfWeek === new Date().getDay() && <span className="text-[10px] text-indigo-600 font-bold animate-pulse">TODAY</span>}
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 font-bold">
                                <Clock size={16} className="text-gray-400" />
                                <span>{routine.startTime} - {routine.endTime}</span>
                            </div>
                            {routine.room && <div className="mt-1 text-xs text-gray-400">Room: {routine.room}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function StudentSubjectDetails() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subject, setSubject] = useState<any>(null);
  
  const activeTab = searchParams.get('tab') || 'materials';

  useEffect(() => {
    if (subjectId) fetchSubjectDetails();
  }, [subjectId]);

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  async function fetchSubjectDetails() {
    try {
      const { data } = await api.get(`/student/subjects`);
      const found = data.find((s: any) => s.id === parseInt(subjectId!));
      
      if (found) {
        setSubject(found);
      } else {
        toast.error("Subject not found");
        navigate('/student');
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load subject details");
    }
  }

  if (!subject) return (
    <div className="min-h-screen flex items-center justify-center">
       <LoadingSpinner text="Loading subject..." />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <Link 
           to="/student"
           className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium mb-2 transition"
        >
            <ArrowLeft size={16} /> Back to Dashboard
        </Link>  
        <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <BookOpen size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
                <div className="flex items-center gap-3 mt-1 text-gray-500 text-sm">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded font-semibold">{subject.code}</span>
                    <span>•</span>
                    <span className="font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">{subject.creditHours} Credits</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-8 overflow-x-auto">
         <button 
           onClick={() => setActiveTab('materials')}
           className={clsx(
               "pb-3 px-4 font-medium text-sm flex items-center gap-2 transition relative whitespace-nowrap",
               activeTab === 'materials' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-900"
           )}
         >
            <Folder size={18} /> Class Materials
         </button>
         <button 
           onClick={() => setActiveTab('schedule')}
           className={clsx(
               "pb-3 px-4 font-medium text-sm flex items-center gap-2 transition relative whitespace-nowrap",
               activeTab === 'schedule' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-900"
           )}
         >
            <Calendar size={18} /> Class Schedule
         </button>
         <button 
           onClick={() => setActiveTab('quiz')}
           className={clsx(
               "pb-3 px-4 font-medium text-sm flex items-center gap-2 transition relative whitespace-nowrap",
               activeTab === 'quiz' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-900"
           )}
         >
            <HelpCircle size={18} /> Quiz
         </button>
      </div>

      <div className="min-h-[400px]">
          {activeTab === 'materials' && (
              <div key="materials">
                  <MaterialsList subjectId={subject.id} userRole="STUDENT" />
              </div>
          )}
          {activeTab === 'schedule' && (
              <div key="schedule">
                  <StudentScheduleView subjectId={subject.id} />
              </div>
          )}
          {activeTab === 'quiz' && (
              <div key="quiz">
                  <StudentQuizListView subjectId={subject.id} subjectName={subject.name} />
              </div>
          )}
      </div>
    </div>
  );
}
