import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Link } from 'lucide-react';

interface AssignmentFormProps {
  onCheckCompletion: () => void;
  onCancel: () => void;
}

interface Teacher {
  id: string;
  fullName: string;
}

interface Subject {
  id: number;
  code: string;
  name: string;
}

export default function AssignmentForm({ onCheckCompletion, onCancel }: AssignmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    teacherId: '',
    subjectId: '',
    academicYear: new Date().getFullYear().toString()
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [teacherRes, subjectRes] = await Promise.all([
          api.get('/admin/teachers'),
          api.get('/admin/subjects')
        ]);
        
        setTeachers(teacherRes.data.map((t: any) => ({
          id: t.id,
          fullName: t.profile?.fullName || 'Unknown'
        })));

        setSubjects(subjectRes.data);
      } catch (err) {
        console.error('Error fetching form data:', err);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/admin/assignments', {
        teacherId: formData.teacherId,
        subjectId: parseInt(formData.subjectId),
        academicYear: parseInt(formData.academicYear)
      });

      onCheckCompletion();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
           <label className="block text-sm font-bold text-gray-700 mb-1">Teacher</label>
           <select 
             name="teacherId"
             required
             value={formData.teacherId}
             onChange={handleChange}
             className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
           >
             <option value="">Select Teacher</option>
             {teachers.map(t => (
               <option key={t.id} value={t.id}>{t.fullName}</option>
             ))}
           </select>
      </div>

       <div>
           <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
           <select 
             name="subjectId"
             required
             value={formData.subjectId}
             onChange={handleChange}
             className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
           >
             <option value="">Select Subject</option>
             {subjects.map(s => (
               <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
             ))}
           </select>
        </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Academic Year</label>
        <input 
          name="academicYear"
          type="number"
          required
          value={formData.academicYear}
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
          <Link size={18} />
          {loading ? 'Assigning...' : 'Assign Teacher'}
        </button>
      </div>
    </form>
  );
}

