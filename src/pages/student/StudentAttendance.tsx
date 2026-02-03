
import api from '../../lib/api';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';  
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useState } from 'react';
import { useEffect } from 'react';

interface AttendanceStat {
  subjectName: string;
  subjectCode: string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
}

export default function StudentAttendance() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AttendanceStat[]>([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  async function fetchAttendance() {
    setLoading(true);
    try {
      const { data } = await api.get('/student/attendance');
      setStats(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <button 
           onClick={() => navigate('/student')}
           className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium mb-2 transition"
        >
            <ArrowLeft size={16} /> Back to Dashboard
        </button>  
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            My Attendance
        </h1>
      </div>

      {loading ? (
          <div className="flex justify-center p-12">
              <LoadingSpinner />
          </div>
      ) : stats.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-gray-500">No attendance records found yet.</p>
          </div>
      ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4 border-b border-gray-200">Subject</th>
                    <th className="px-6 py-4 text-center border-b border-gray-200">Classes</th>
                    <th className="px-6 py-4 text-center border-b border-gray-200">Present</th>
                    <th className="px-6 py-4 text-center border-b border-gray-200">Absent</th>
                    <th className="px-6 py-4 text-center border-b border-gray-200">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {stats.map((stat) => (
                       <tr key={stat.subjectCode} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4">
                               <div className="font-bold text-gray-900">{stat.subjectName}</div>
                               <div className="text-gray-400 text-xs font-mono">{stat.subjectCode}</div>
                           </td>
                           <td className="px-6 py-4 text-center font-medium text-gray-600">{stat.totalClasses}</td>
                           <td className="px-6 py-4 text-center text-green-600 font-bold">{stat.presentCount}</td>
                           <td className="px-6 py-4 text-center text-red-600 font-bold">{stat.absentCount}</td>
                           <td className="px-6 py-4 text-center">
                               <span className={clsx(
                                   "px-3 py-1 rounded-lg text-xs font-bold",
                                   stat.attendancePercentage < 75 ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
                               )}>
                                   {stat.attendancePercentage?.toFixed(1)}%
                               </span>
                           </td>
                       </tr>
                   ))}
                </tbody>
             </table>
          </div>
      )}
    </div>
  );
}
