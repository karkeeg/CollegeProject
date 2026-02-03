import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { UserPlus, Search, Trash2, Edit, Upload } from 'lucide-react';
import Modal from '../../components/Modal';
import StudentForm from './StudentForm';
import BulkUploadModal from '../../components/admin/BulkUploadModal';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SemesterSelector from '../../components/common/SemesterSelector';

interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  rollNo: number;
  regNo: string;
  phone: string;
  email: string;
  currentSemesterId: number;
  programId: number;
  semester?: {
    name: string;
  };
  program?: {
    code: string;
    name: string;
  };
}

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string | number>('');
  const [selectedSemester, setSelectedSemester] = useState<string | number>('');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Delete State
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/students');
      
      const formattedData = data.map((item: any) => ({
        ...item,
        fullName: item.profile?.fullName || 'N/A',
        email: item.profile?.email || 'N/A'
      }));

      setStudents(formattedData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
      if (!studentToDelete) return;

      try {
          await api.delete(`/admin/students/${studentToDelete.id}`);
          setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
          toast.success("Student deleted successfully");
      } catch (err: any) {
          toast.error("Failed to delete student: " + (err.response?.data?.error || err.message));
      } finally {
          setStudentToDelete(null);
      }
  };

  const handleEdit = (student: Student) => {
      setEditingStudent(student);
      setIsFormOpen(true);
  };

  const handleAdd = () => {
      setEditingStudent(null);
      setIsFormOpen(true);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = selectedProgram ? student.programId === Number(selectedProgram) : true;
    const matchesSemester = selectedSemester ? student.currentSemesterId === Number(selectedSemester) : true;
    return matchesSearch && matchesProgram && matchesSemester;
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowBulkModal(true)}
                className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition font-bold"
            >
                <Upload size={18} />
                Bulk Import
            </button>
            <button 
                onClick={handleAdd}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
            >
                <UserPlus size={20} />
                Add Student
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
            />
          </div>
          
          <SemesterSelector 
            selectedProgramId={selectedProgram}
            selectedSemesterId={selectedSemester}
            onProgramChange={(pid) => setSelectedProgram(pid)}
            onSemesterChange={(sid) => setSelectedSemester(sid)}
            stacked={false}
            required={false}
            placeholderProgram="All Programs"
            placeholderSemester="All Semesters"
            className="flex-1"
            labelClassName="hidden" // Hide labels for filter bar
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4 border-b border-gray-200">Student Code</th>
                <th className="px-6 py-4 border-b border-gray-200">Name</th>
                <th className="px-6 py-4 border-b border-gray-200">Program</th>
                <th className="px-6 py-4 border-b border-gray-200">Semester</th>
                <th className="px-6 py-4 border-b border-gray-200">Email</th>
                <th className="px-6 py-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 flex justify-center w-full"><LoadingSpinner /></td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No students found.</td></tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{student.studentCode}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{student.fullName}</td>
                    <td className="px-6 py-4">
                      {student.program ? (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] font-bold uppercase">
                          {student.program.code}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[10px] font-bold uppercase">
                        {student.semester?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{student.email}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(student)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => setStudentToDelete(student)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        title={editingStudent ? "Edit Student" : "Add New Student"}
      >
        <StudentForm 
          initialData={editingStudent}
          onCheckCompletion={() => {
            setIsFormOpen(false);
            setTimeout(fetchStudents, 500); // Delay refresh
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
         <Modal isOpen={!!studentToDelete} onClose={() => setStudentToDelete(null)} title="Delete Student">
            <div className="p-4">
                <p className="text-slate-600 mb-6">
                    Are you sure you want to delete <strong>{studentToDelete.fullName}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setStudentToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete Permanently</button>
                </div>
            </div>
         </Modal>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal 
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={fetchStudents}
        type="students"
      />
    </div>
  );
}
