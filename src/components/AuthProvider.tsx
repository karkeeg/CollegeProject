import React, { useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../lib/auth';
import type { User, UserRole } from '../lib/auth';
import api from '../lib/api';
import LoadingSpinner from './ui/LoadingSpinner';
import toast from 'react-hot-toast';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRole(null);
    window.location.href = '/login';
  }, []);

  const checkSession = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      if (data.user) {
        setUser(data.user);
        setRole(data.user.role.toLowerCase() as UserRole);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        signOut();
      }
    } catch (err) {
      console.error("Session restoration error:", err);
      signOut();
    } finally {
      setLoading(false);
    }
  }, [signOut]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string, selectedRole: 'student' | 'teacher') => {
    try {
      const { data } = await api.post('/auth/login', { email, password, selectedRole });
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      setRole(data.user.role.toLowerCase() as UserRole);
      
      toast.success("Welcome back!");
    } catch (err: any) {
      const message = err.response?.data?.error || "Login failed";
      toast.error(message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, signOut }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
           <LoadingSpinner size={40} text="Loading Application..." />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

