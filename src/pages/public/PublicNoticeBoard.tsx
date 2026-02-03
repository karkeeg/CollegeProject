import { useEffect, useState } from 'react';
import { Search, Bell, AlertCircle, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import PublicNavbar from '../../components/PublicNavbar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Notice {
  id: number;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
}

export default function PublicNoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices() {
    try {
      const { data } = await api.get('/public/notices');
      setNotices(data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:gap-3 transition-all mb-6">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Notice Archive</h1>
              <p className="text-gray-500">Public academic and administrative announcements.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Search archive..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-sm"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner />
            <p className="text-gray-400 mt-4 font-bold text-sm tracking-widest uppercase">Fetching Records...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="bg-gray-50 rounded-[40px] p-20 text-center">
            <div className="w-20 h-20 bg-white shadow-xl shadow-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Bell className="text-gray-200" size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">No Notices Found</h3>
            <p className="text-gray-400">We couldn't find any announcements matching your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredNotices.map((notice) => (
              <div 
                key={notice.id}
                className="group bg-white border border-gray-100 p-8 rounded-[32px] hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-100 transition-all"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    Official Announcement
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                    <Calendar size={14} />
                    {new Date(notice.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </div>
                </div>

                <h2 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                  {notice.title}
                </h2>
                <div className="prose prose-indigo max-w-none">
                  <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                    {notice.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="py-20 border-t border-gray-50 bg-gray-50/50">
        <div className="text-center">
          <p className="text-sm font-bold text-gray-400">End of Records</p>
        </div>
      </footer>
    </div>
  );
}
