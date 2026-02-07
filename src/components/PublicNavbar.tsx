import { Link } from 'react-router-dom';
import { BookOpen, LogIn } from 'lucide-react';

export default function PublicNavbar() {
  return (
    <nav className="bg-white border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
              <BookOpen className="text-gray-900" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Student Management <span className="text-gray-500">System</span>
            </span>
          </Link>

         
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition shadow-lg shadow-gray-100"
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
