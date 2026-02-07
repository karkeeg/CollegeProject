import { ArrowRight, Layout, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/PublicNavbar';

export default function LandingPage() {
  return (
    <div className=" flex flex-col bg-white overflow-hidden">
      <PublicNavbar />

      <main className="flex-1 flex flex-col items-center justify-center -mt-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-full mb-8 border border-gray-100 tracking-wider">
            Build v1.0 • Designed for Modern Education
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Everything you need to <br />
            <span className="text-gray-400">Master Management.</span>
          </h1>

          {/* Definition */}
          <p className="text-lg md:text-xl text-gray-500 font-normal leading-relaxed max-w-2xl mx-auto mb-10">
            A minimalist <span className="text-gray-900 font-semibold underline decoration-gray-100 underline-offset-4">Student Management System</span> crafted to orchestrate academic data with precision and ease.
          </p>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link 
              to="/login" 
              className="px-10 py-4 bg-gray-900 text-white text-base font-semibold rounded-2xl hover:bg-black transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-gray-200 active:translate-y-0 flex items-center gap-2 shadow-lg shadow-gray-100"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
          </div>

          {/* Features / MVP Attributes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto py-10 border-t border-gray-100/60">
            <div className="flex items-center gap-3 justify-center">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Zap size={18} className="text-gray-500" />
              </div>
              <span className="font-semibold text-gray-600 text-sm">Ultra Fast</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Shield size={18} className="text-gray-500" />
              </div>
              <span className="font-semibold text-gray-600 text-sm">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="p-2 bg-gray-50 rounded-lg">
                <Layout size={18} className="text-gray-500" />
              </div>
              <span className="font-semibold text-gray-600 text-sm">Modular Design</span>
            </div>
          </div>

        </div>
      </main>

      <footer className="py-8 text-center bg-gray-50/30">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em]">
          Student Management System • Simple • Precise
        </p>
      </footer>
    </div>
  );
}
