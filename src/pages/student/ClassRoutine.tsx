import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Calendar, Clock, Filter } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Subject {
  id: number;
  code: string;
  name: string;
}

interface Routine {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  subject: {
    id: number;
    code: string;
    name: string;
  };
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ClassRoutine() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  useEffect(() => {
    Promise.all([fetchRoutine(), fetchSubjects()]).finally(() => setLoading(false));
  }, []);

  async function fetchRoutine() {
    try {
      const { data } = await api.get('/student/routine');
      setRoutines(data);
    } catch (error) {
      console.error('Error fetching routine:', error);
    }
  }

  async function fetchSubjects() {
    try {
      const { data } = await api.get('/student/subjects');
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }

  const filteredRoutines = routines.filter(r => {
    const subjectMatch = selectedSubjectId === 'all' || r.subject.id.toString() === selectedSubjectId;
    return subjectMatch;
  });

  const routinesByDay = DAYS.map((day, index) => ({
    day,
    index,
    routines: filteredRoutines
      .filter(r => r.dayOfWeek === index)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  })).filter(({ index }) => selectedDay === 'all' || index.toString() === selectedDay);

  const getCurrentDay = () => {
    return new Date().getDay();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="text-indigo-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Class Routine</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 px-2 border-r border-gray-100 mr-1">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-500">Filters:</span>
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="text-sm border-none focus:ring-0 cursor-pointer font-medium text-gray-700 bg-transparent"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.code} - {subject.name}
              </option>
            ))}
          </select>

          <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="text-sm border-none focus:ring-0 cursor-pointer font-medium text-gray-700 bg-transparent"
          >
            <option value="all">All Days</option>
            {DAYS.map((day, index) => (
              <option key={day} value={index.toString()}>
                {day}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-4">
          {routinesByDay.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900">No routines found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more results.</p>
              <button
                onClick={() => {
                  setSelectedSubjectId('all');
                  setSelectedDay('all');
                }}
                className="mt-4 text-indigo-600 font-bold hover:text-indigo-700 underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            routinesByDay.map(({ day, routines, index }) => {
              const isToday = index === getCurrentDay();
              
              if (routines.length === 0 && selectedDay === 'all') return null;

              return (
                <div
                  key={day}
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden ${
                    isToday ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-200'
                  }`}
                >
                  <div className={`px-6 py-3 border-b ${
                    isToday ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold ${isToday ? 'text-indigo-900' : 'text-gray-900'}`}>
                        {day}
                      </h3>
                      {isToday && (
                        <span className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-bold">
                          TODAY
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {routines.length === 0 ? (
                      <p className="text-gray-500 text-sm">No classes scheduled</p>
                    ) : (
                      <div className="space-y-2">
                        {routines.map(routine => (
                          <div
                            key={routine.id}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                          >
                            <div className="flex items-center gap-2 text-indigo-600 min-w-[140px]">
                              <Clock size={16} />
                              <span className="font-mono text-sm font-bold">
                                {routine.startTime} - {routine.endTime}
                              </span>
                            </div>
                            
                            <div className="flex-1">
                              <div className="font-bold text-gray-900">
                                {routine.subject.code} - {routine.subject.name}
                              </div>
                            </div>
                            
                            {routine.room && (
                              <div className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold self-start sm:self-auto">
                                Room {routine.room}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
