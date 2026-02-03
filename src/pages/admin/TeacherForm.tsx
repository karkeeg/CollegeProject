import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { UserPlus, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface TeacherFormProps {
  onCheckCompletion: () => void;
  onCancel: () => void;
  initialData?: any | null; // For Edit Mode
}

interface Program {
  id: number;
  code: string;
  name: string;
}

export default function TeacherForm({ onCheckCompletion, onCancel, initialData }: TeacherFormProps) {
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    password: '',
    employeeId: initialData?.employeeId || '',
    department: initialData?.department || '',
    qualification: initialData?.qualification || '',
    programId: initialData?.programId?.toString() || ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        password: '',
        employeeId: initialData.employeeId || '',
        department: initialData.department || '',
        qualification: initialData.qualification || '',
        programId: initialData.programId?.toString() || ''
      });
    }
  }, [initialData]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await api.get('/programs');
        setPrograms(data);
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditMode && formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);

    try {
      if (isEditMode) {
          await api.put(`/admin/teachers/${initialData.id}`, {
              fullName: formData.fullName,
              employeeId: formData.employeeId,
              department: formData.department,
              qualification: formData.qualification,
              programId: formData.programId ? parseInt(formData.programId) : null
          });
          toast.success("Teacher updated successfully");
      } else {
          await api.post('/admin/teachers', {
              email: formData.email,
              password: formData.password,
              fullName: formData.fullName,
              employeeId: formData.employeeId,
              department: formData.department,
              qualification: formData.qualification,
              programId: formData.programId ? parseInt(formData.programId) : null
          });
          toast.success("Teacher created successfully");
      }

      onCheckCompletion();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
          <input 
            name="fullName"
            required
            placeholder="Assoc. Prof. X"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
          <input 
            name="email"
            type="email"
            required
            disabled={isEditMode}
            placeholder="teacher@college.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {!isEditMode && (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Set Access Password</label>
            <input 
            name="password"
            type="password"
            required
            placeholder="Min. 6 characters"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-1">Employee ID</label>
           <input 
             name="employeeId"
             required
             placeholder="e.g. EMP-001"
             value={formData.employeeId}
             onChange={handleChange}
             className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
           />
        </div>
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-1">Department</label>
           <input 
             name="department"
             required
             placeholder="e.g. Computer Science"
             value={formData.department}
             onChange={handleChange}
             className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
           />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Primary Program/Department</label>
        <select 
          name="programId"
          required
          value={formData.programId}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        >
          <option value="">Select Program</option>
          {programs.map(prog => (
            <option key={prog.id} value={prog.id}>{prog.code} - {prog.name}</option>
          ))}
        </select>
      </div>
      
       <div>
           <label className="block text-sm font-bold text-gray-700 mb-1">Qualification</label>
           <input 
             name="qualification"
             placeholder="e.g. MSc. CSIT"
             value={formData.qualification}
             onChange={handleChange}
             className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
           />
        </div>

      <div className="pt-4 flex justify-end gap-3">
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
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 font-bold shadow-lg shadow-indigo-200"
        >
          {loading ? (
             <span>Processing...</span>
          ) : isEditMode ? (
             <><Save size={18} /> Update Teacher</>
          ) : (
             <><UserPlus size={18} /> Create Teacher</>
          )}
        </button>
      </div>
    </form>
  );
}
