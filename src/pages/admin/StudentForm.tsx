import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { UserPlus, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import SemesterSelector from '../../components/common/SemesterSelector';

interface StudentFormProps {
  onCheckCompletion: () => void;
  onCancel: () => void;
  initialData?: any | null; // If provided, we are in Edit Mode
}

export default function StudentForm({ onCheckCompletion, onCancel, initialData }: StudentFormProps) {
  const [loading, setLoading] = useState(false);
  
  // Edit mode doesn't allow changing email/password easily via this form
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    password: '',
    studentCode: initialData?.studentCode || '',
    semesterId: initialData?.currentSemesterId?.toString() || '',
    programId: initialData?.programId?.toString() || ''
  });

  useEffect(() => {
    if (initialData) {
        setFormData({
            fullName: initialData.fullName || '',
            email: initialData.email || '',
            password: '', 
            studentCode: initialData.studentCode || '',
            semesterId: initialData.currentSemesterId?.toString() || '',
            programId: initialData.programId?.toString() || ''
        });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProgramChange = (id: string) => {
    setFormData(prev => ({ ...prev, programId: id, semesterId: '' }));
  };

  const handleSemesterChange = (id: string) => {
    setFormData(prev => ({ ...prev, semesterId: id }));
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
          await api.put(`/admin/students/${initialData.id}`, {
              fullName: formData.fullName,
              studentCode: formData.studentCode,
              currentSemesterId: formData.semesterId ? parseInt(formData.semesterId) : null,
              programId: formData.programId ? parseInt(formData.programId) : null
          });
          toast.success("Student updated successfully");
      } else {
          await api.post('/admin/students', {
              email: formData.email,
              password: formData.password,
              fullName: formData.fullName,
              studentCode: formData.studentCode,
              currentSemesterId: formData.semesterId ? parseInt(formData.semesterId) : null,
              programId: formData.programId ? parseInt(formData.programId) : null
          });
          toast.success("Student created successfully");
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
            placeholder="John Doe"
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
            disabled={isEditMode} // Cannot edit email easily
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {!isEditMode && (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Set Password</label>
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

      <div>
           <label className="block text-sm font-bold text-gray-700 mb-1">Student Code</label>
           <input 
             name="studentCode"
             required
             placeholder="e.g. TU-2023-01"
             value={formData.studentCode}
             onChange={handleChange}
             className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
           />
      </div>

      <SemesterSelector 
        selectedProgramId={formData.programId}
        selectedSemesterId={formData.semesterId}
        onProgramChange={handleProgramChange}
        onSemesterChange={handleSemesterChange}
        stacked={false}
      />

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
             <><Save size={18} /> Update Student</>
          ) : (
             <><UserPlus size={18} /> Create Student</>
          )}
        </button>
      </div>
    </form>
  );
}
