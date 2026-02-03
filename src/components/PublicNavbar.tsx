import { Link } from 'react-router-dom';
import { BookOpen, LogIn, Bell } from 'lucide-react';

export default function PublicNavbar() {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-indigo-600 rounded-lg group-hover:rotate-3 transition-transform">
              <BookOpen className="text-white" size={24} />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              Bright<span className="text-indigo-600">Kids</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition">Home</Link>
            <Link to="/notices" className="text-sm font-bold text-gray-600 hover:text-indigo-600 transition flex items-center gap-1.5">
              <Bell size={16} />
              Notices
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
            >
              <LogIn size={18} />
              Portal Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
