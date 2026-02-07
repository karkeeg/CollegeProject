import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import api from '../../lib/api';
import { Mail, Shield, BookOpen, Hash, Edit3, Save, X, User, Phone, MapPin, Calendar, Award, Briefcase } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { clsx } from 'clsx';

export default function Profile() {
  const { user, role } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchProfile();
  }, [role]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const { data } = await api.get(`/${role}/profile`);
      setProfileData(data);
      // Initialize form data
      setFormData({
        fullName: data.profile?.fullName || '',
        phone: data.phone || '',
        address: data.address || '',
        dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
        department: data.department || '',
        qualification: data.qualification || '',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/${role}/profile`, formData);
      await fetchProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profileData) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <LoadingSpinner text="Loading profile..." />
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">Manage your personal and account information.</p>
        </div>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-bold text-sm shadow-sm"
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm"
              disabled={saving}
            >
              <X size={16} />
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-bold text-sm shadow-md disabled:opacity-50"
              disabled={saving}
            >
              {saving ? <LoadingSpinner size="sm" color="white" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="bg-gray-50 h-32 relative border-b border-gray-100">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl font-bold text-gray-900 border-4 border-white">
              {(isEditing ? formData.fullName : profileData?.profile?.fullName)?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <div className="mb-10">
            {isEditing ? (
              <div className="max-w-md">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Full Name</label>
                <input 
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="text-xl font-bold text-gray-900 w-full border-b-2 border-gray-900 focus:outline-none bg-transparent py-1"
                  placeholder="Enter your full name"
                  autoFocus
                />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900">{profileData?.profile?.fullName || 'N/A'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded-md border border-gray-200">
                    {role}
                  </span>
                  <span className="text-gray-400 text-sm">•</span>
                  <span className="text-gray-500 text-sm">{user?.email}</span>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {/* Account Info */}
            <div className="space-y-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Details</h3>
              
              <ProfileItem 
                icon={<Mail size={18} />} 
                label="Email Address" 
                value={user?.email} 
              />

              <ProfileItem 
                icon={<Shield size={18} />} 
                label="User Role" 
                value={role} 
                className="capitalize"
              />
              
              {role !== 'admin' && (
                <ProfileItem 
                  icon={<Hash size={18} />} 
                  label={role === 'student' ? "Student Code" : "Employee ID"} 
                  value={role === 'student' ? profileData?.studentCode : profileData?.employeeId} 
                />
              )}
            </div>

            {/* Editable Info */}
            <div className="space-y-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Personal Information</h3>
              
              {role === 'student' && (
                <>
                  <EditableItem 
                    icon={<Phone size={18} />}
                    label="Phone Number"
                    value={profileData?.phone}
                    isEditing={isEditing}
                    name="phone"
                    formData={formData}
                    setFormData={setFormData}
                  />
                  <EditableItem 
                    icon={<MapPin size={18} />}
                    label="Home Address"
                    value={profileData?.address}
                    isEditing={isEditing}
                    name="address"
                    formData={formData}
                    setFormData={setFormData}
                  />
                  <EditableItem 
                    icon={<Calendar size={18} />}
                    label="Date of Birth"
                    value={profileData?.dob ? new Date(profileData?.dob).toLocaleDateString() : 'N/A'}
                    isEditing={isEditing}
                    name="dob"
                    type="date"
                    formData={formData}
                    setFormData={setFormData}
                  />
                  <ProfileItem 
                    icon={<BookOpen size={18} />} 
                    label="Current Semester" 
                    value={profileData?.semester?.name || 'N/A'} 
                  />
                </>
              )}

              {role === 'teacher' && (
                <>
                  <EditableItem 
                    icon={<Briefcase size={18} />}
                    label="Department"
                    value={profileData?.department}
                    isEditing={isEditing}
                    name="department"
                    formData={formData}
                    setFormData={setFormData}
                  />
                  <EditableItem 
                    icon={<Award size={18} />}
                    label="Qualification"
                    value={profileData?.qualification}
                    isEditing={isEditing}
                    name="qualification"
                    formData={formData}
                    setFormData={setFormData}
                  />
                </>
              )}

              {role === 'admin' && (
                <p className="text-sm text-gray-500 italic">No additional profile fields available for administrators.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, value, className }: any) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="p-2.5 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-gray-100 group-hover:text-gray-900 transition-all">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={clsx("text-sm font-bold text-gray-900", className)}>{value || 'N/A'}</p>
      </div>
    </div>
  );
}

function EditableItem({ icon, label, value, isEditing, name, type = "text", formData, setFormData }: any) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="p-2.5 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-gray-100 group-hover:text-gray-900 transition-all">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        {isEditing ? (
          <input 
            type={type}
            value={formData[name]}
            onChange={(e) => setFormData({...formData, [name]: e.target.value})}
            className="text-sm font-bold text-gray-900 w-full border-b border-gray-200 focus:border-gray-900 focus:outline-none bg-transparent py-0.5"
          />
        ) : (
          <p className="text-sm font-bold text-gray-900">{value || 'N/A'}</p>
        )}
      </div>
    </div>
  );
}
