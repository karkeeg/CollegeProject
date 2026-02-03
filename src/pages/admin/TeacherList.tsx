import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Search, Trash2, Edit, Upload } from 'lucide-react';
import Modal from '../../components/Modal';
import TeacherForm from './TeacherForm';
import BulkUploadModal from '../../components/admin/BulkUploadModal';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Teacher {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  qualification: string;
  email: string;
  program?: {
    code: string;
    name: string;
  };
}

interface Program {
  id: number;
  code: string;
  name: string;
}

export default function TeacherList() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  useEffect(() => {
    fetchTeachers();
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    try {
      const { data } = await api.get('/programs');
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
    }
  }

  async function fetchTeachers() {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/teachers');
      
      const formattedData = data.map((item: any) => ({
        ...item,
        fullName: item.profile?.fullName || 'N/A',
        email: item.profile?.email || 'N/A'
      }));

      setTeachers(formattedData);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
      if (!teacherToDelete) return;
      try {
          await api.delete(`/admin/teachers/${teacherToDelete.id}`);
          
          setTeachers(prev => prev.filter(t => t.id !== teacherToDelete.id));
          toast.success("Teacher deleted successfully");
      } catch (err: any) {
          toast.error("Failed to delete teacher: " + (err.response?.data?.error || err.message));
      } finally {
          setTeacherToDelete(null);
      }
  };

  const handleEdit = (teacher: Teacher) => {
      setEditingTeacher(teacher);
      setIsFormOpen(true);
  };

  const handleAdd = () => {
      setEditingTeacher(null);
      setIsFormOpen(true);
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = selectedProgram ? teacher.program?.code === selectedProgram : true;
    return matchesSearch && matchesProgram;
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
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
                <Plus size={20} />
                Add Teacher
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search teachers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Filter:</span>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-sm font-medium"
            >
              <option value="">All Programs</option>
              {programs.map(prog => (
                <option key={prog.id} value={prog.code}>{prog.code}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4 border-b border-gray-200">Employee ID</th>
                <th className="px-6 py-4 border-b border-gray-200">Name</th>
                <th className="px-6 py-4 border-b border-gray-200">Program</th>
                <th className="px-6 py-4 border-b border-gray-200">Department</th>
                <th className="px-6 py-4 border-b border-gray-200">Email</th>
                <th className="px-6 py-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 flex justify-center w-full"><LoadingSpinner /></td></tr>
              ) : filteredTeachers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No teachers found.</td></tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{teacher.employeeId}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{teacher.fullName}</td>
                    <td className="px-6 py-4">
                      {teacher.program ? (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[10px] font-bold uppercase">
                          {teacher.program.code}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px]">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{teacher.department}</td>
                    <td className="px-6 py-4 text-gray-500">{teacher.email}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(teacher)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => setTeacherToDelete(teacher)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
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
        title={editingTeacher ? "Edit Teacher" : "Add New Teacher"}
      >
        <TeacherForm 
          initialData={editingTeacher}
          onCheckCompletion={() => {
            setIsFormOpen(false);
            setTimeout(fetchTeachers, 500); 
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      {teacherToDelete && (
         <Modal isOpen={!!teacherToDelete} onClose={() => setTeacherToDelete(null)} title="Delete Teacher">
            <div className="p-4">
                <p className="text-slate-600 mb-6">
                    Are you sure you want to delete <strong>{teacherToDelete.fullName}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setTeacherToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete Permanently</button>
                </div>
            </div>
         </Modal>
      )}

      {/* Bulk Upload Modal */}
      <BulkUploadModal 
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={fetchTeachers}
        type="teachers"
      />
    </div>
  );
}
