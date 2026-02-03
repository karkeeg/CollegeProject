import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Calendar, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Routine {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  subject: {
    code: string;
    name: string;
  };
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ClassRoutine() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutine();
  }, []);

  async function fetchRoutine() {
    setLoading(true);
    try {
      const { data } = await api.get('/student/routine');
      setRoutines(data);
    } catch (error) {
      console.error('Error fetching routine:', error);
    } finally {
      setLoading(false);
    }
  }

  const routinesByDay = DAYS.map((day, index) => ({
    day,
    routines: routines.filter(r => r.dayOfWeek === index).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }));

  const getCurrentDay = () => {
    return new Date().getDay();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">Class Routine</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-4">
          {routinesByDay.map(({ day, routines }, index) => {
            const isToday = index === getCurrentDay();
            
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
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
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
                            <div className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs font-bold">
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
          })}
        </div>
      )}
    </div>
  );
}
