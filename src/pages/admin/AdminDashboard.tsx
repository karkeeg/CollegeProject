import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Users, GraduationCap, BookOpen, Clock } from 'lucide-react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    subjects: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get('/admin/dashboard-stats');
        setStats({
          students: data.students,
          teachers: data.teachers,
          subjects: data.subjects
        });
        setChartData(data.chartData);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Manage and monitor academic operations</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Students */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-blue-500 transition-all">
           <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Users size={24} />
           </div>
           <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
           </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-emerald-500 transition-all">
           <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <GraduationCap size={24} />
           </div>
           <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.teachers}</p>
           </div>
        </div>

        {/* Total Subjects */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-indigo-500 transition-all">
           <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
              <BookOpen size={24} />
           </div>
           <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.subjects}</p>
           </div>
        </div>

        {/* Semesters */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-5 hover:border-orange-500 transition-all">
           <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
              <Clock size={24} />
           </div>
           <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Semesters</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Student Distribution</h2>
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip 
                           contentStyle={{ 
                               backgroundColor: '#fff', 
                               border: '1px solid #e2e8f0', 
                               borderRadius: '8px',
                               boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                           }} 
                        />
                        <Bar dataKey="students" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="flex flex-col gap-3">
               <Link to="/admin/students" className="flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg border border-gray-100 hover:bg-gray-100 transition-all font-medium">
                  <Users size={18} className="text-blue-600" />
                  <span className="flex-1">Manage Students</span>
                  <span className="text-gray-400">→</span>
               </Link>
               <Link to="/admin/teachers" className="flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg border border-gray-100 hover:bg-gray-100 transition-all font-medium">
                  <GraduationCap size={18} className="text-emerald-600" />
                  <span className="flex-1">Manage Teachers</span>
                  <span className="text-gray-400">→</span>
               </Link>
               <Link to="/admin/subjects" className="flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg border border-gray-100 hover:bg-gray-100 transition-all font-medium">
                  <BookOpen size={18} className="text-indigo-600" />
                  <span className="flex-1">Manage Subjects</span>
                  <span className="text-gray-400">→</span>
               </Link>
            </div>
          </div>
      </div>
    </div>
  );
}
