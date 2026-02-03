import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { BookOpen, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import SemesterSelector from '../../components/common/SemesterSelector';

interface SubjectFormProps {
  onCheckCompletion: () => void;
  onCancel: () => void;
  initialData?: any | null; // For Edit Mode
}

export default function SubjectForm({ onCheckCompletion, onCancel, initialData }: SubjectFormProps) {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    name: initialData?.name || '',
    semesterId: initialData?.semesterId?.toString() || '',
    programId: initialData?.semester?.programId?.toString() || '',
    teacherId: initialData?.assignments?.[0]?.teacherId || '',
    creditHours: initialData?.creditHours || 3,
    fullMarks: initialData?.fullMarks || 100,
    passMarks: initialData?.passMarks || 40
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        semesterId: initialData.semesterId?.toString() || '',
        programId: initialData.semester?.programId?.toString() || '',
        teacherId: initialData.assignments?.[0]?.teacherId || '',
        creditHours: initialData.creditHours || 3,
        fullMarks: initialData.fullMarks || 100,
        passMarks: initialData.passMarks || 40
      });
    }
  }, [initialData]);

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const { data } = await api.get('/admin/teachers');
        setTeachers(data);
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    }
    fetchTeachers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProgramChange = (id: string) => {
    setFormData({ ...formData, programId: id, semesterId: '' });
  };

  const handleSemesterChange = (id: string) => {
    setFormData({ ...formData, semesterId: id });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        semesterId: parseInt(formData.semesterId),
        teacherId: formData.teacherId || undefined,
        creditHours: parseInt(formData.creditHours.toString()),
        fullMarks: parseInt(formData.fullMarks.toString()),
        passMarks: parseInt(formData.passMarks.toString())
      };

      if (isEditMode) {
          await api.put(`/admin/subjects/${initialData.id}`, payload);
          toast.success("Subject updated successfully");
      } else {
          await api.post('/admin/subjects', payload);
          toast.success("Subject added successfully");
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
           <label className="block text-sm font-bold text-gray-700 mb-1">Subject Code</label>
           <input 
             name="code"
             required
             placeholder="e.g. CACS101"
             value={formData.code}
             onChange={handleChange}
             className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
           />
        </div>
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-1">Subject Name</label>
           <input 
             name="name"
             required
             placeholder="e.g. Computer Fundamentals"
             value={formData.name}
             onChange={handleChange}
             className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
           />
        </div>
      </div>

      <SemesterSelector 
        selectedProgramId={formData.programId}
        selectedSemesterId={formData.semesterId}
        onProgramChange={handleProgramChange}
        onSemesterChange={handleSemesterChange}
        stacked={false}
      />

      <div>
         <label className="block text-sm font-bold text-gray-700 mb-1">Subject Teacher</label>
         <select 
           name="teacherId"
           value={formData.teacherId}
           onChange={handleChange}
           className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
         >
           <option value="">Select Teacher (Optional)</option>
           {teachers.map(teacher => (
             <option key={teacher.id} value={teacher.id}>
               {teacher.profile?.fullName || teacher.employeeId}
             </option>
           ))}
         </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
         <div>
           <label className="block text-sm font-bold text-gray-700 mb-1">Credit Hrs</label>
           <input 
             name="creditHours"
             type="number"
             required
             value={formData.creditHours}
             onChange={handleChange}
             className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
           />
        </div>
         <div>
           <label className="block text-sm font-bold text-gray-700 mb-1">Full Marks</label>
           <input 
             name="fullMarks"
             type="number"
             required
             value={formData.fullMarks}
             onChange={handleChange}
             className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
           />
        </div>
         <div>
           <label className="block text-sm font-bold text-gray-700 mb-1">Pass Marks</label>
           <input 
             name="passMarks"
             type="number"
             required
             value={formData.passMarks}
             onChange={handleChange}
             className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
           />
        </div>
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
             <><Save size={18} /> Update Subject</>
          ) : (
             <><BookOpen size={18} /> Add Subject</>
          )}
        </button>
      </div>
    </form>
  );
}
