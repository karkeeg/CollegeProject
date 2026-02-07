import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SemesterSelector from '../../components/common/SemesterSelector';
import { useModal } from '../../hooks/useModal';

interface Routine {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectId: number;
  semesterId: number;
  room?: string;
  subject: {
    name: string;
    code: string;
  };
}

interface Semester {
  id: number;
  name: string;
  programId?: number;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function RoutineList() {
  const { openModal, closeModal } = useModal();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  useEffect(() => {
    fetchInitialData();
    fetchRoutines();
  }, []);

  async function fetchInitialData() {
    try {
      const [semRes] = await Promise.all([
        api.get('/semesters'),
        api.get('/programs')
      ]);
      setSemesters(semRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  async function fetchRoutines() {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/routines');
      setRoutines(data);
    } catch (error) {
      console.error('Error fetching routines:', error);
      toast.error("Failed to load routines");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/routines/${id}`);
      setRoutines(prev => prev.filter(r => r.id !== id));
      toast.success("Routine deleted successfully");
      closeModal();
    } catch (err: any) {
      toast.error("Failed to delete routine: " + (err.response?.data?.error || err.message));
    }
  };

  const handleConfirmDelete = (routine: Routine) => {
    openModal(
      <div className="p-4">
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this schedule for <strong>{routine.subject.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium">Cancel</button>
          <button onClick={() => handleDelete(routine.id)} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-lg shadow-red-200">Delete Permanently</button>
        </div>
      </div>,
      { title: "Delete Schedule", size: "sm" }
    );
  };

  const handleEdit = (routine: Routine) => {
    openModal(
      <RoutineForm
        initialData={routine}
        semesters={semesters}
        onCheckCompletion={() => {
          closeModal();
          fetchRoutines();
        }}
        onCancel={closeModal}
      />,
      { title: "Edit Schedule", size: "2xl" }
    );
  };

  const handleAdd = () => {
    openModal(
      <RoutineForm
        initialData={null}
        semesters={semesters}
        onCheckCompletion={() => {
          closeModal();
          fetchRoutines();
        }}
        onCancel={closeModal}
      />,
      { title: "Add New Schedule", size: "2xl" }
    );
  };

  const filteredRoutines = selectedSemester
    ? routines.filter(r => r.semesterId === selectedSemester)
    : routines;

  const routinesByDay = DAYS.map((day, index) => ({
    day,
    routines: filteredRoutines.filter(r => r.dayOfWeek === index).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }));

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Routine</h1>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Add Schedule
        </button>
      </div>

      <SemesterSelector 
        selectedProgramId={selectedProgram || ''}
        selectedSemesterId={selectedSemester || ''}
        onProgramChange={(pid) => setSelectedProgram(pid ? Number(pid) : null)}
        onSemesterChange={(sid) => setSelectedSemester(sid ? Number(sid) : null)}
        stacked={false}
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6"
        labelClassName="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5"
        required={false}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
          {routinesByDay.map((dayGroup) => (
            <div key={dayGroup.day} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">{dayGroup.day}</h2>
                <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-500 shadow-sm">
                  {dayGroup.routines.length} Sessions
                </span>
              </div>
              <div className="p-4 space-y-3 flex-1">
                {dayGroup.routines.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <p className="text-xs font-medium">No classes scheduled</p>
                  </div>
                ) : (
                  dayGroup.routines.map((routine) => (
                    <div key={routine.id} className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-slate-50/50 transition-all shadow-sm hover:shadow-indigo-50/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] font-mono text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                             {routine.startTime} - {routine.endTime}
                           </span>
                           {routine.room && (
                              <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase">
                                 • {routine.room}
                              </span>
                           )}
                        </div>
                        <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{routine.subject.name}</h3>
                        <p className="text-[10px] text-gray-400 font-mono uppercase mt-1">{routine.subject.code}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                        <button onClick={() => handleEdit(routine)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleConfirmDelete(routine)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

// Routine Form Component
function RoutineForm({ initialData, semesters, onCheckCompletion, onCancel }: {
  initialData: Routine | null;
  semesters: Semester[];
  onCheckCompletion: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    semesterId: initialData?.semesterId.toString() || '',
    dayOfWeek: initialData?.dayOfWeek.toString() || '0',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    subjectId: initialData?.subjectId.toString() || '',
    room: initialData?.room || '',
    programId: ''
  });

  useEffect(() => {
    if (initialData) {
        const sem = semesters.find(s => s.id === initialData.semesterId);
        if (sem?.programId) {
            setFormData(prev => ({ ...prev, programId: sem.programId!.toString() }));
        }
    }
  }, [initialData, semesters]);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formData.semesterId) {
      fetchSubjects(parseInt(formData.semesterId));
    }
  }, [formData.semesterId]);

  async function fetchSubjects(semesterId: number) {
    try {
      const { data } = await api.get(`/semesters/${semesterId}/subjects`);
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProgramChange = (id: string) => {
    setFormData(prev => ({ ...prev, programId: id, semesterId: '', subjectId: '' }));
  };

  const handleSemesterChange = (id: string) => {
    setFormData(prev => ({ ...prev, semesterId: id, subjectId: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        semesterId: parseInt(formData.semesterId),
        dayOfWeek: parseInt(formData.dayOfWeek),
        startTime: formData.startTime,
        endTime: formData.endTime,
        subjectId: parseInt(formData.subjectId),
        room: formData.room || null
      };

      if (initialData) {
        await api.put(`/admin/routines/${initialData.id}`, payload);
        toast.success("Schedule updated successfully");
      } else {
        await api.post('/admin/routines', payload);
        toast.success("Schedule created successfully");
      }
      onCheckCompletion();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SemesterSelector 
        selectedProgramId={formData.programId}
        selectedSemesterId={formData.semesterId}
        onProgramChange={handleProgramChange}
        onSemesterChange={handleSemesterChange}
        stacked={false}
      />

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Day of Week</label>
        <select
          name="dayOfWeek"
          required
          value={formData.dayOfWeek}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        >
          {DAYS.map((day, index) => (
            <option key={index} value={index}>{day}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Start Time</label>
          <input
            name="startTime"
            type="time"
            required
            value={formData.startTime}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">End Time</label>
          <input
            name="endTime"
            type="time"
            required
            value={formData.endTime}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
        <select
          name="subjectId"
          required
          value={formData.subjectId}
          onChange={handleChange}
          disabled={!formData.semesterId}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
        >
          <option value="">Select Subject</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.code} - {subject.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Room (Optional)</label>
        <input
          name="room"
          value={formData.room}
          onChange={handleChange}
          placeholder="e.g., 101, Lab A"
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
          {loading ? 'Saving...' : (initialData ? 'Update Schedule' : 'Create Schedule')}
        </button>
      </div>
    </form>
  );
}
