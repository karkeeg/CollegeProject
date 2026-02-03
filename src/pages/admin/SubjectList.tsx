import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Search, Book, Trash2, Edit } from 'lucide-react';
import Modal from '../../components/Modal';
import SubjectForm from './SubjectForm';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SemesterSelector from '../../components/common/SemesterSelector';

interface Subject {
  id: number;
  code: string;
  name: string;
  creditHours: number;
  fullMarks: number;
  passMarks: number;
  semesterId: number;
  semester?: {
    name: string;
    programId: number;
    program?: {
      code: string;
    };
  };
  assignments?: {
    teacherId: string;
    teacher: {
      profile: {
        fullName: string;
      };
    };
  }[];
}

export default function SubjectList() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string | number>('');
  const [selectedSemester, setSelectedSemester] = useState<string | number>('');
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/subjects');
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!subjectToDelete) return;
    try {
        await api.delete(`/admin/subjects/${subjectToDelete.id}`);
        setSubjects(prev => prev.filter(s => s.id !== subjectToDelete.id));
        toast.success("Subject deleted successfully");
    } catch (err: any) {
        toast.error("Failed to delete subject. It may have associated marks/attendance.");
    } finally {
        setSubjectToDelete(null);
    }
  };

  const handleEdit = (subject: Subject) => {
      setEditingSubject(subject);
      setIsFormOpen(true);
  };

  const handleAdd = () => {
      setEditingSubject(null);
      setIsFormOpen(true);
  };

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = selectedProgram ? subject.semester?.programId === Number(selectedProgram) : true;
    const matchesSemester = selectedSemester ? subject.semesterId === Number(selectedSemester) : true;
    return matchesSearch && matchesProgram && matchesSemester;
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        <button 
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Add Subject
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search subjects..." 
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
            labelClassName="hidden"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4 border-b border-gray-200">Code</th>
                <th className="px-6 py-4 border-b border-gray-200">Subject Name</th>
                <th className="px-6 py-4 border-b border-gray-200">Semester</th>
                <th className="px-6 py-4 border-b border-gray-200">Teacher</th>
                <th className="px-6 py-4 border-b border-gray-200">Credit Hours</th>
                <th className="px-6 py-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 flex justify-center w-full"><LoadingSpinner /></td></tr>
              ) : filteredSubjects.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No subjects found.</td></tr>
              ) : (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 flex items-center gap-2">
                       <Book size={16} className="text-indigo-400" />
                       {subject.code}
                    </td>
                     <td className="px-6 py-4 font-bold text-gray-900">{subject.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] font-bold uppercase w-fit">
                          {subject.semester?.program?.code || 'N/A'}
                        </span>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[10px] font-bold uppercase w-fit">
                          {subject.semester?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium">
                          {subject.assignments?.[0]?.teacher?.profile?.fullName || 'Not Assigned'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{subject.creditHours}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(subject)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => setSubjectToDelete(subject)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
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

      {/* Form Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        title={editingSubject ? "Edit Subject" : "Add New Subject"}
      >
        <SubjectForm 
          initialData={editingSubject}
          onCheckCompletion={() => {
            setIsFormOpen(false);
            fetchSubjects();
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      {subjectToDelete && (
         <Modal isOpen={!!subjectToDelete} onClose={() => setSubjectToDelete(null)} title="Delete Subject">
            <div className="p-4">
                <p className="text-slate-600 mb-6">
                    Are you sure you want to delete <strong>{subjectToDelete.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setSubjectToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete Permanently</button>
                </div>
            </div>
         </Modal>
      )}
    </div>
  );
}
