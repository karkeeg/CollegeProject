import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import api from '../../lib/api';
import { Mail, Shield, BookOpen, Hash } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function Profile() {
  const { user, role } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data } = await api.get(`/${role}/profile`);
        setProfileData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [role]);

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <LoadingSpinner text="Loading profile..." />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">View your personal and account information.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-indigo-600 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl font-bold text-indigo-600 border-4 border-white">
              {profileData?.profile?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">{profileData?.profile?.fullName || 'N/A'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-full border border-indigo-100">
                {role}
              </span>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-500 text-sm">{user?.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Details</h3>
              
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-bold text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">User Role</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">{role}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Additional Information</h3>
              
              {role === 'student' && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                      <Hash size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Student Code</p>
                      <p className="text-sm font-bold text-gray-900">{profileData?.studentCode || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Semester</p>
                      <p className="text-sm font-bold text-gray-900">{profileData?.semester?.name || 'N/A'}</p>
                    </div>
                  </div>
                </>
              )}

              {role === 'teacher' && (
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
                    <Hash size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teacher Code</p>
                    <p className="text-sm font-bold text-gray-900">{profileData?.teacherCode || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
