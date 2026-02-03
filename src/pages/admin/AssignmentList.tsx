import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../../components/Modal';
import AssignmentForm from './AssignmentForm';
import toast from 'react-hot-toast';

interface Assignment {
  id: number;
  teacherId: string;
  subjectId: number;
  academicYear: number;
  teacher?: { fullName: string };
  subject?: { name: string; code: string; semester?: { name: string } };
}

export default function AssignmentList() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/assignments');
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/assignments/${id}`);
      setAssignments(prev => prev.filter(a => a.id !== id));
      toast.success("Assignment deleted successfully");
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error("Failed to delete assignment");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Assignments</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Assign Teacher
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4 border-b border-gray-200">Subject</th>
                <th className="px-6 py-4 border-b border-gray-200">Teacher</th>
                <th className="px-6 py-4 border-b border-gray-200">Semester</th>
                <th className="px-6 py-4 border-b border-gray-200">Academic Year</th>
                <th className="px-6 py-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 flex justify-center w-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></td></tr>
              ) : assignments.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No assignments found.</td></tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {assignment.subject?.code} - {assignment.subject?.name}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2 text-gray-700">
                       <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                         {assignment.teacher?.fullName?.charAt(0)}
                       </div>
                       {assignment.teacher?.fullName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[10px] font-bold uppercase">
                        {assignment.subject?.semester?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{assignment.academicYear}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(assignment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Assignment"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Assign Teacher to Subject"
      >
        <AssignmentForm 
          onCheckCompletion={() => {
            setIsAddModalOpen(false);
            fetchAssignments();
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
