import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { GraduationCap, Briefcase, UserCircle } from 'lucide-react';
import { clsx } from 'clsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, role, loading: authLoading, login } = useAuth();

  // Redirect if already logged in and role is loaded
  useEffect(() => {
    if (user && role) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'teacher') navigate('/teacher');
      else if (role === 'student') navigate('/student');
    }
  }, [user, role, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password, selectedRole);
    } catch (err) {
      // Error handled in AuthProvider/login
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Checking session..." />
      </div>
    );
  }

  if (user && role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner text="Redirecting..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm">
          <div className="flex justify-center mb-8">
            <div className="bg-blue-50 p-4 rounded-xl">
              <UserCircle className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-center mb-8 font-medium">Please sign in to your account</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setSelectedRole('student')}
                className={clsx(
                  "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 group",
                  selectedRole === 'student' 
                    ? "bg-blue-50 border-blue-600 text-blue-700" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                )}
              >
                <GraduationCap className={clsx(
                  "w-8 h-8 mb-2",
                  selectedRole === 'student' ? "text-blue-600" : "text-gray-300"
                )} />
                <span className="text-sm font-bold uppercase tracking-wider">Student</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('teacher')}
                className={clsx(
                  "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 group",
                  selectedRole === 'teacher' 
                    ? "bg-blue-50 border-blue-600 text-blue-700" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                )}
              >
                <Briefcase className={clsx(
                  "w-8 h-8 mb-2",
                  selectedRole === 'teacher' ? "text-blue-600" : "text-gray-300"
                )} />
                <span className="text-sm font-bold uppercase tracking-wider">Teacher</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase tracking-widest mb-2 px-1">Email Address</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase tracking-widest mb-2 px-1">Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={clsx(
                "w-full py-4 rounded-xl text-white font-bold uppercase tracking-widest transition-all duration-200 flex justify-center items-center shadow-md",
                "bg-blue-600 hover:bg-blue-700",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <LoadingSpinner size={24} className="text-white" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
            <Link to="/" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition">
              <ArrowLeft size={16} />
              Back to Website
            </Link>
            <p className="text-center text-[10px] text-gray-400 font-medium leading-relaxed">
              Demo: Sign in with credentials provided by Admin.
              <br />
              Admin can login by selecting either role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

