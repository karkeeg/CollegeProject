import { useEffect, useState } from 'react';
import { ChevronRight, ArrowRight, Bell, Calendar, GraduationCap, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import PublicNavbar from '../../components/PublicNavbar';

interface Notice {
  id: number;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
}

export default function LandingPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicNotices() {
      try {
        const { data } = await api.get('/public/notices');
        setNotices(data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching notices:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicNotices();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              Empowering the Next Generation
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-8 leading-[1.1]">
              A Future-First Institution for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Digital Minds</span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed">
              We provide a comprehensive learning ecosystem designed to foster creativity, 
              technical excellence, and leadership in the modern world.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition shadow-xl shadow-gray-200 flex items-center justify-center gap-2 group">
                Access Student Portal
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/notices" className="w-full sm:w-auto px-8 py-4 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition flex items-center justify-center gap-2">
                View Latest Notices
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Notices Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Latest Announcements</h2>
              <p className="text-gray-500">Stay updated with the latest news from our institution.</p>
            </div>
            <Link to="/notices" className="hidden sm:flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all">
              View All Archive <ChevronRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-pulse h-64" />
              ))
            ) : notices.length > 0 ? (
              notices.map((notice) => (
                <div key={notice.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <Bell size={24} />
                    </div>
                    <span className="text-xs font-bold text-gray-400">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">
                    {notice.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {notice.content}
                  </p>
                  <Link to="/notices" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:gap-3 transition-all">
                    Read Full Notice <ArrowRight size={16} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-400">No public notices available.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Institutional Stats/Stats Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-8 text-center border border-gray-100 rounded-3xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={28} />
              </div>
              <p className="text-3xl font-black text-gray-900">500+</p>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Students</p>
            </div>
            <div className="p-8 text-center border border-gray-100 rounded-3xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 size={28} />
              </div>
              <p className="text-3xl font-black text-gray-900">12+</p>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Departments</p>
            </div>
            <div className="p-8 text-center border border-gray-100 rounded-3xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={28} />
              </div>
              <p className="text-3xl font-black text-gray-900">100%</p>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Commitment</p>
            </div>
            <div className="p-8 text-center border border-gray-100 rounded-3xl hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                 <Bell size={28} />
              </div>
              <p className="text-3xl font-black text-gray-900">Real-time</p>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Updates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-bold text-gray-400">© 2026 BrightKids Institution. Built for Excellence.</p>
        </div>
      </footer>
    </div>
  );
}
