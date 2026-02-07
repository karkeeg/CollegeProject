import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';

import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { UserCircle } from 'lucide-react';
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
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-50 p-3 rounded-xl">
              <UserCircle className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Welcome Back</h1>
          <p className="text-gray-500 text-center mb-6 text-base font-medium">Please sign in to your account</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 text-xs font-bold uppercase tracking-widest mb-2 px-1">I am a</label>
              <div className="flex gap-3 p-1 bg-gray-100/50 rounded-lg border border-gray-200/50">
                <button
                  type="button"
                  onClick={() => setSelectedRole('student')}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all duration-200",
                    selectedRole === 'student' 
                      ? "bg-white text-blue-600 shadow-sm border border-gray-100" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  )}
                >
                  <div className={clsx("w-3.5 h-3.5 rounded-full border flex items-center justify-center", selectedRole === 'student' ? "border-blue-600 bg-blue-600" : "border-gray-400")}>
                     {selectedRole === 'student' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('teacher')}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all duration-200",
                    selectedRole === 'teacher' 
                      ? "bg-white text-blue-600 shadow-sm border border-gray-100" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  )}
                >
                   <div className={clsx("w-3.5 h-3.5 rounded-full border flex items-center justify-center", selectedRole === 'teacher' ? "border-blue-600 bg-blue-600" : "border-gray-400")}>
                     {selectedRole === 'teacher' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  Teacher
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase tracking-widest mb-1.5 px-1">Email Address</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-xs font-bold uppercase tracking-widest mb-1.5 px-1">Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={clsx(
                "w-full py-3.5 rounded-lg text-base text-white font-bold uppercase tracking-widest transition-all duration-200 flex justify-center items-center shadow-md mt-2",
                "bg-blue-600 hover:bg-blue-700",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <LoadingSpinner size={20} className="text-white" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col items-center gap-3">
            <Link to="/" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition">
              <ArrowLeft size={16} />
              Back to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

