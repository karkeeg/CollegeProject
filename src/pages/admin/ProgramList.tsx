import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Program {
  id: number;
  code: string;
  name: string;
  createdAt: string;
}

export default function ProgramList() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/programs');
      setPrograms(data);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!programToDelete) return;

    try {
      await api.delete(`/admin/programs/${programToDelete.id}`);
      setPrograms(prev => prev.filter(p => p.id !== programToDelete.id));
      toast.success("Program deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete program: " + (err.response?.data?.error || err.message));
    } finally {
      setProgramToDelete(null);
    }
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingProgram(null);
    setIsFormOpen(true);
  };

  const filteredPrograms = programs.filter(program =>
    program.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Academic Programs</h1>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Add Program
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4 border-b border-gray-200">Code</th>
                <th className="px-6 py-4 border-b border-gray-200">Full Name</th>
                <th className="px-6 py-4 border-b border-gray-200">Created Date</th>
                <th className="px-6 py-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 flex justify-center w-full"><LoadingSpinner /></td></tr>
              ) : filteredPrograms.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No programs found.</td></tr>
              ) : (
                filteredPrograms.map((program) => (
                  <tr key={program.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100 uppercase">
                        {program.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{program.name}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(program.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(program)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => setProgramToDelete(program)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
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
        title={editingProgram ? "Edit Program" : "Add New Program"}
      >
        <ProgramForm
          initialData={editingProgram}
          onCheckCompletion={() => {
            setIsFormOpen(false);
            fetchPrograms();
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      {programToDelete && (
        <Modal isOpen={!!programToDelete} onClose={() => setProgramToDelete(null)} title="Delete Program">
          <div className="p-4">
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the program <strong>{programToDelete.name}</strong>? This will affect all associated students and semesters.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setProgramToDelete(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-lg shadow-red-200">Delete Permanently</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Program Form Component
function ProgramForm({ initialData, onCheckCompletion, onCancel }: {
  initialData: Program | null;
  onCheckCompletion: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    name: initialData?.name || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData) {
        await api.put(`/admin/programs/${initialData.id}`, formData);
        toast.success("Program updated successfully");
      } else {
        await api.post('/admin/programs', formData);
        toast.success("Program created successfully");
      }
      onCheckCompletion();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Program Code (e.g. BCA, CSIT)</label>
        <input
          name="code"
          required
          value={formData.code}
          onChange={handleChange}
          placeholder="BCA"
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
        <input
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Bachelor of Computer Application"
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
        >
          {loading ? 'Saving...' : (initialData ? 'Update Program' : 'Create Program')}
        </button>
      </div>
    </form>
  );
}
