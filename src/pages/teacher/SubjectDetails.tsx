import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import api from '../../lib/api';
import { ArrowLeft, UserCheck, FileText, Users, Save, Plus, X, Search, CheckSquare, Square, Calendar, Clock, Trash2, Edit, Folder, Brain } from 'lucide-react'; 
import clsx from 'clsx';
import toast from 'react-hot-toast'; 
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MaterialsList from '../../components/MaterialsList';
import QuizView from '../../components/teacher/QuizView';
 

// Sub-components
const EnrollmentModal = ({ 
    subjectId, 
    onClose, 
    onEnroll 
}: { 
    subjectId: number, 
    onClose: () => void, 
    onEnroll: () => void 
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    
    // Simple debounce implementation directly since we might not have a hook file
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAvailableStudents();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchAvailableStudents = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/teacher/subject/${subjectId}/available-students`, {
                params: { query: searchQuery }
            });
            setStudents(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load available students");
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleBulkEnroll = async () => {
        if (selectedIds.length === 0) return;
        setEnrolling(true);
        try {
            await api.post('/teacher/students/enroll-bulk', {
                subjectId,
                studentIds: selectedIds
            });
            toast.success(`Successfully enrolled ${selectedIds.length} students`);
            onEnroll();
            onClose();
        } catch (error) {
            toast.error("Failed to enroll students");
            console.error(error);
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-teal-700 text-white">
                    <div>
                        <h3 className="font-bold text-lg">Manage Enrollment</h3>
                        <p className="text-teal-100 text-xs">Search and add students to this class</p>
                    </div>
                    <button onClick={onClose} className="text-teal-100 hover:text-white transition bg-teal-800/50 p-1 rounded-full hover:bg-teal-800">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition shadow-sm text-sm"
                            placeholder="Search available students by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
                            <LoadingSpinner /> 
                            <span className="text-xs">Searching directory...</span>
                        </div>
                    ) : students.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                             <div className="flex justify-between items-center px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <span>Student Details</span>
                                <span>{selectedIds.length} Selected</span>
                             </div>
                             {students.map(student => {
                                const isDisabled = student.isEnrolled;
                                
                                return (
                                <div 
                                    key={student.id} 
                                    onClick={() => !isDisabled && toggleSelection(student.id)}
                                    className={clsx(
                                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                        isDisabled 
                                            ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed" 
                                            : "cursor-pointer hover:shadow-md",
                                        !isDisabled && selectedIds.includes(student.id) 
                                            ? "bg-teal-50 border-teal-200" 
                                            : !isDisabled && "bg-white border-gray-100 hover:border-teal-100"
                                    )}
                                >
                                    <div className={clsx(
                                        "text-teal-600 transition-transform duration-200", 
                                        !isDisabled && selectedIds.includes(student.id) ? "scale-110" : "scale-100 opacity-50"
                                    )}>
                                        {isDisabled ? (
                                            <div className="bg-gray-200 text-gray-500 rounded p-0.5" title="Already Enrolled">
                                                <CheckSquare size={20} />
                                            </div>
                                        ) : selectedIds.includes(student.id) ? (
                                            <CheckSquare size={20} fill="currentColor" className="text-teal-100" />
                                        ) : (
                                            <Square size={20} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-800">{student.profile.fullName}</h4>
                                            {isDisabled && (
                                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded border border-green-200">
                                                    ENROLLED
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span className="font-mono bg-gray-100 px-1.5 rounded">{student.studentCode}</span>
                                            <span>•</span>
                                            <span>{student.profile.email}</span>
                                        </div>
                                    </div>
                                </div>
                             )})}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            <Users size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No eligible students found.</p>
                            <p className="text-xs mt-1">Try adjusting your search query.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        {students.length} students found
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition">
                            Cancel
                        </button>
                        <button 
                            onClick={handleBulkEnroll}
                            disabled={selectedIds.length === 0 || enrolling}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition shadow-lg shadow-teal-200 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                        >
                            {enrolling ? <LoadingSpinner /> : (
                                <>
                                    <Plus size={18} />
                                    Assign {selectedIds.length > 0 ? selectedIds.length : ''} Students
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StudentListView = ({ subjectId }: { subjectId: number }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  
  const fetchStudents = async () => {
      // Logic unchanged, just fetches enrolled students
      if (!subjectId) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/teacher/subject/${subjectId}/students`);
        setStudents(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load students");
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchStudents();
  }, [subjectId]);

  if (loading && !students.length) return <div className="p-12 flex justify-center"><LoadingSpinner /></div>;

  return (
    <>
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
         <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-700">Enrolled Students ({students.length})</h3>
            <button 
                onClick={() => setShowEnrollModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition shadow-sm"
            >
                <Plus size={16} /> Manage Enrollment
            </button>
         </div>
         <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
               <tr>
                 <th className="px-6 py-4">Roll No</th>
                 <th className="px-6 py-4">Name</th>
                 <th className="px-6 py-4">Student ID</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {students.map(s => (
                   <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                       <td className="px-6 py-4 font-mono text-gray-500">{s.rollNo || '-'}</td>
                       <td className="px-6 py-4 font-bold text-gray-900">{s.profile?.fullName}</td>
                       <td className="px-6 py-4 text-gray-500 font-mono text-xs">{s.studentCode}</td>
                   </tr>
               ))}
               {students.length === 0 && (
                   <tr><td colSpan={3} className="p-10 text-center text-gray-500">No students enrolled yet. Click 'Manage Enrollment' to add students.</td></tr>
               )}
            </tbody>
         </table>
    </div>

    {showEnrollModal && (
        <EnrollmentModal 
            subjectId={subjectId} 
            onClose={() => setShowEnrollModal(false)} 
            onEnroll={fetchStudents} 
        />
    )}
    </>
  );
};

const AttendanceView = ({ semesterId, subjectId }: { semesterId: number, subjectId: number }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudentsAndAttendance();
  }, [semesterId, date]);

  async function fetchStudentsAndAttendance() {
    setLoading(true);
    try {
      const studentRes = await api.get(`/teacher/class-students/${semesterId}`);
      setStudents(studentRes.data);

      const attendanceRes = await api.get(`/teacher/attendance`, {
        params: { subjectId, date }
      });
      
      const statusMap: Record<string, string> = {};
      attendanceRes.data.forEach((record: any) => {
        statusMap[record.studentId] = record.status;
      });
      setAttendanceData(statusMap);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    setLoading(true);
    const upsertData = students.map(student => ({
      studentId: student.id,
      subjectId: subjectId,
      date: date,
      status: attendanceData[student.id] || 'present' 
    }));

    try {
      await api.post('/teacher/attendance', upsertData);
      toast.success("Attendance saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save attendance.");
    } finally {
      setLoading(false);
    }
  };

  const markAll = (status: string) => {
    const newMap: Record<string, string> = {};
    students.forEach(s => newMap[s.id] = status);
    setAttendanceData(newMap);
    toast.success(`Marked all as ${status}`);
  };

  if (loading && students.length === 0) return <div className="p-12 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div className="flex items-center gap-3">
           <label className="font-bold text-gray-700 text-sm">Attendance Date:</label>
           <input 
             type="date" 
             value={date}
             onChange={(e) => setDate(e.target.value)}
             className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
           />
        </div>
        <div className="flex gap-2">
            <button onClick={() => markAll('present')} className="text-xs px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-600 hover:text-white font-bold transition-all border border-green-100">Mark All Present</button>
            <button onClick={() => markAll('absent')} className="text-xs px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-600 hover:text-white font-bold transition-all border border-red-100">Mark All Absent</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 mb-6">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-4">Roll No</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {students.map((student) => (
               <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                 <td className="px-6 py-4 font-mono text-gray-500">{student.rollNo}</td>
                 <td className="px-6 py-4 font-bold text-gray-900">{student.profile?.fullName}</td>
                 <td className="px-6 py-4">
                   <div className="flex justify-center gap-2">
                      {['present', 'absent', 'late'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student.id, status)}
                          className={clsx(
                            "px-3 py-1 rounded-lg text-[10px] font-bold capitalize border transition-all transform active:scale-95",
                            (attendanceData[student.id] || 'present') === status
                              ? status === 'present' ? "bg-green-600 text-white border-green-600 shadow-sm"
                                : status === 'absent' ? "bg-red-600 text-white border-red-600 shadow-sm"
                                : "bg-amber-500 text-white border-amber-500 shadow-sm"
                              : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:text-gray-600"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                   </div>
                 </td>
               </tr>
             ))}
             {students.length === 0 && (
                <tr><td colSpan={3} className="p-10 text-center text-gray-500">No students found.</td></tr>
             )}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-gray-100">
         <button 
           onClick={saveAttendance}
           disabled={loading}
           className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100"
         >
            {loading ? <span>Saving...</span> : <><Save size={18} /> Save Attendance</>}
         </button>
      </div>
    </div>
  );
};

const MarksView = ({ semesterId, subjectId }: { semesterId: number, subjectId: number }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState('Terminal');

  useEffect(() => {
    fetchStudentsAndMarks();
  }, [semesterId, examType]);

  async function fetchStudentsAndMarks() {
    setLoading(true);
    try {
      const studentRes = await api.get(`/teacher/class-students/${semesterId}`);
      setStudents(studentRes.data);

      const marksRes = await api.get(`/teacher/marks`, {
        params: { subjectId, examType }
      });
      
      const marksMap: Record<string, any> = {};
      marksRes.data.forEach((record: any) => {
        marksMap[record.studentId] = {
           internal: record.internalMarks,
           practical: record.practicalMarks,
           final: record.finalMarks
        };
      });
      setMarksData(marksMap);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleMarkChange = (studentId: string, field: 'internal' | 'practical' | 'final', value: string) => {
    const numValue = parseFloat(value);
    if (numValue < 0) return; 
    
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value === '' ? 0 : numValue
      }
    }));
  };

  const calculateTotal = (sId: string) => {
    const m = marksData[sId] || {};
    return (m.internal || 0) + (m.practical || 0) + (m.final || 0);
  };

  const calculateGrade = (total: number) => {
     if (total >= 90) return 'A+';
     if (total >= 80) return 'A';
     if (total >= 70) return 'B+';
     if (total >= 60) return 'B';
     if (total >= 50) return 'C+';
     if (total >= 40) return 'C';
     return 'F';
  };

  const saveMarks = async () => {
    const invalidMarks = students.some(s => {
        const m = marksData[s.id] || {};
        const i = m.internal || 0;
        const p = m.practical || 0;
        const f = m.final || 0;
        return i > 100 || p > 100 || f > 100;
    });

    if (invalidMarks) {
        toast.error("Some marks exceed 100. Please check inputs.");
        return;
    }

    setLoading(true);
    const upsertData = students.map(student => {
       const m = marksData[student.id] || {};
       const total = calculateTotal(student.id);
       return {
          studentId: student.id,
          subjectId: subjectId,
          internalMarks: m.internal || 0,
          practicalMarks: m.practical || 0,
          finalMarks: m.final || 0,
          gradeLetter: calculateGrade(total)
       };
    });

    try {
      await api.post(`/teacher/marks?examType=${examType}`, upsertData);
      toast.success("Marks saved successfully!");
      fetchStudentsAndMarks(); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to save marks.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && students.length === 0) return <div className="p-12 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <FileText size={18} />
              Marks Sheet
          </h3>
          <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Exam Type:</label>
              <select
                 value={examType}
                 onChange={(e) => setExamType(e.target.value)}
                 className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold shadow-sm"
              >
                  <option value="Terminal">Terminal Exam</option>
                  <option value="Board">Board Exam</option>
                  <option value="UnitTest">Unit Test</option>
                  <option value="Assessment">Internal Assessment</option>
              </select>
          </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 mb-6 transition-all">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-4">Roll No</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4 w-24 text-center">Internal</th>
              <th className="px-6 py-4 w-24 text-center">Practical</th>
              <th className="px-6 py-4 w-24 text-center">Final</th>
              <th className="px-6 py-4 w-20 text-center">Total</th>
              <th className="px-6 py-4 w-20 text-center">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
             {students.map((student) => {
               const m = marksData[student.id] || {};
               const total = calculateTotal(student.id);
                const grade = calculateGrade(total);
               return (
                 <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                   <td className="px-6 py-4 text-gray-500 font-mono text-xs">{student.rollNo}</td>
                   <td className="px-6 py-4 font-bold text-gray-900">{student.profile?.fullName}</td>
                   <td className="px-6 py-4 text-center">
                      <input 
                         type="number" 
                         min="0" max="100"
                         className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs font-bold text-center"
                         value={m.internal || ''}
                         onChange={(e) => handleMarkChange(student.id, 'internal', e.target.value)}
                         placeholder="0"
                      />
                   </td>
                   <td className="px-6 py-4 text-center">
                      <input 
                         type="number" 
                         min="0" max="100"
                         className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs font-bold text-center"
                         value={m.practical || ''}
                         onChange={(e) => handleMarkChange(student.id, 'practical', e.target.value)}
                         placeholder="0"
                      />
                   </td>
                   <td className="px-6 py-4 text-center">
                      <input 
                         type="number" 
                         min="0" max="100"
                         className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs font-bold text-center"
                         value={m.final || ''}
                         onChange={(e) => handleMarkChange(student.id, 'final', e.target.value)}
                         placeholder="0"
                      />
                   </td>
                   <td className="px-6 py-4 font-bold text-gray-700 text-center">
                      {total}
                   </td>
                   <td className="px-6 py-4 text-center">
                      <span className={clsx(
                        "px-2 py-1 rounded-lg text-[10px] font-bold w-10 inline-block text-center",
                        grade !== 'F' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                      )}>
                        {grade}
                      </span>
                   </td>
                 </tr>
               );
             })}
             {students.length === 0 && (
                <tr><td colSpan={7} className="p-10 text-center text-gray-500">No students found.</td></tr>
             )}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between pt-4 border-t border-gray-100 items-center">
         <p className="text-xs text-gray-400 italic">* Changes are saved for the selected Exam Type only.</p>
         <button 
           onClick={saveMarks}
           disabled={loading}
           className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100"
         >
            {loading ? <span>Saving...</span> : <><Save size={18} /> Save Marks</>}
         </button>
      </div>
    </div>
  );
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const ScheduleView = ({ subjectId, semesterId }: { subjectId: number, semesterId: number }) => {
    const [routines, setRoutines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoutine, setEditingRoutine] = useState<any>(null);

    const fetchRoutines = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/routines', { params: { semesterId } });
            setRoutines(data.filter((r: any) => r.subjectId === subjectId));
        } catch (error) {
            console.error(error);
            toast.error("Failed to load schedule");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutines();
    }, [subjectId, semesterId]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this class schedule?")) return;
        try {
            await api.delete(`/teacher/routines/${id}`);
            toast.success("Schedule deleted");
            fetchRoutines();
        } catch (error) {
            toast.error("Failed to delete schedule");
        }
    };

    const handleSave = async (payload: any) => {
        try {
            if (editingRoutine) {
                await api.put(`/teacher/routines/${editingRoutine.id}`, { ...payload, subjectId, semesterId });
                toast.success("Schedule updated");
            } else {
                await api.post('/teacher/routines', { ...payload, subjectId, semesterId });
                toast.success("Schedule added");
            }
            setIsModalOpen(false);
            fetchRoutines();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save schedule");
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Class Schedule (Sun-Fri)</h2>
                <button 
                  onClick={() => { setEditingRoutine(null); setIsModalOpen(true); }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold text-sm shadow-lg shadow-indigo-100"
                >
                    <Plus size={18} /> Add Time Slot
                </button>
            </div>

            {loading ? (
                <div className="py-12 flex justify-center"><LoadingSpinner /></div>
            ) : routines.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl">
                    <Calendar size={40} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-gray-500 text-sm">No schedule defined for this subject.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {routines.map((routine) => (
                        <div key={routine.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center group hover:bg-white hover:shadow-md transition">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">{DAYS[routine.dayOfWeek]}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 font-bold">
                                    <Clock size={16} className="text-gray-400" />
                                    <span>{routine.startTime} - {routine.endTime}</span>
                                </div>
                                {routine.room && <div className="mt-1 text-xs text-gray-400">Room: {routine.room}</div>}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button 
                                    onClick={() => { setEditingRoutine(routine); setIsModalOpen(true); }}
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                >
                                    <Edit size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(routine.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <RoutineModal 
                    initialData={editingRoutine} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSave} 
                />
            )}
        </div>
    );
};

const RoutineModal = ({ initialData, onClose, onSave }: { initialData: any, onClose: () => void, onSave: (p: any) => void }) => {
    const [formData, setFormData] = useState({
        dayOfWeek: initialData?.dayOfWeek ?? 0,
        startTime: initialData?.startTime ?? '',
        endTime: initialData?.endTime ?? '',
        room: initialData?.room ?? ''
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-indigo-700 text-white">
                    <h3 className="font-bold text-lg">{initialData ? 'Edit Schedule' : 'Add Time Slot'}</h3>
                    <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Day of Week</label>
                        <select 
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm font-medium"
                            value={formData.dayOfWeek}
                            onChange={(e) => setFormData({...formData, dayOfWeek: parseInt(e.target.value)})}
                        >
                            {DAYS.map((day, idx) => (
                                <option key={day} value={idx}>{day}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Start Time</label>
                            <input 
                                type="time" 
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                                value={formData.startTime}
                                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">End Time</label>
                            <input 
                                type="time" 
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                                value={formData.endTime}
                                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Room (Optional)</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                            placeholder="e.g. 101, Lab A"
                            value={formData.room}
                            onChange={(e) => setFormData({...formData, room: e.target.value})}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button onClick={onClose} className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition font-bold text-sm">Cancel</button>
                        <button 
                            onClick={() => onSave(formData)}
                            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold text-sm shadow-lg shadow-indigo-100"
                        >
                            {initialData ? 'Update' : 'Add Schedule'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function SubjectDetails() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subject, setSubject] = useState<any>(null);
  const activeTab = searchParams.get('tab') || 'students';

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (subjectId) fetchSubjectDetails();
  }, [subjectId]);

  async function fetchSubjectDetails() {
    try {
      const { data } = await api.get(`/teacher/assignments`);
      // Find this specific subject's data from assignments 
      // (or we can add a specific endpoint if needed, but assignments has some info)
      const assignment = data.find((a: any) => a.subjectId === parseInt(subjectId!));
      if (assignment) {
        setSubject(assignment.subject);
      } else {
        // Fallback or specific FETCH
        const res = await api.get(`/subjects/${subjectId}`);
        setSubject(res.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load subject details");
    }
  }

  if (!subject) return (
    <div className="min-h-screen flex items-center justify-center">
       <LoadingSpinner text="Loading..."/>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-6">
        <button 
           onClick={() => navigate('/teacher/classes')}
           className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium mb-2 transition"
        >
            <ArrowLeft size={16} /> Back to My Classes
        </button>  
        <div>
            <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-gray-500 text-sm">
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded font-semibold">{subject.code}</span>
                <span>•</span>
                <span className="font-medium">{subject.semester?.name}</span>
            </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200 mb-8">
         <button 
           onClick={() => setActiveTab('students')}
           className={clsx(
               "pb-3 px-4 font-medium text-sm flex items-center gap-2 transition relative",
               activeTab === 'students' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-900"
           )}
         >
            <Users size={18} /> Students
         </button>
         <button 
           onClick={() => setActiveTab('attendance')}
           className={clsx(
               "pb-3 px-4 font-medium text-sm flex items-center gap-2 transition relative",
               activeTab === 'attendance' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-900"
           )}
         >
            <UserCheck size={18} /> Attendance
         </button>
         <button 
           onClick={() => setActiveTab('marks')}
           className={clsx(
               "pb-3 px-4 font-medium text-sm flex items-center gap-2 transition relative",
               activeTab === 'marks' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-900"
           )}
         >
            <FileText size={18} /> Marks
         </button>
         <button 
           onClick={() => setActiveTab('schedule')}
           className={clsx(
               "pb-3 px-4 font-medium text-sm flex items-center gap-2 transition relative",
               activeTab === 'schedule' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-900"
           )}
         >
            <Calendar size={18} /> Schedule
         </button>
         <button 
           onClick={() => setActiveTab('materials')}
           className={clsx(
               "pb-3 px-4 font-medium text-sm flex items-center gap-2 transition relative",
               activeTab === 'materials' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-900"
           )}
         >
            <Folder size={18} /> Class Materials
         </button>
         <button 
           onClick={() => setActiveTab('quizzes')}
           className={clsx(
               "pb-3 px-4 font-medium text-sm flex items-center gap-2 transition relative",
               activeTab === 'quizzes' ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-900"
           )}
         >
            <Brain size={18} /> Quizzes
         </button>
      </div>

      <div>
          {activeTab === 'students' && <StudentListView subjectId={subject.id} />}
          {activeTab === 'attendance' && <AttendanceView semesterId={subject.semesterId} subjectId={subject.id} />}
          {activeTab === 'marks' && <MarksView semesterId={subject.semesterId} subjectId={subject.id} />}
          {activeTab === 'schedule' && <ScheduleView semesterId={subject.semesterId} subjectId={subject.id} />}
          {activeTab === 'materials' && <MaterialsList subjectId={subject.id} userRole="TEACHER" />}
          {activeTab === 'quizzes' && <QuizView subjectId={subject.id} />}
      </div>
    </div>
  );
}
