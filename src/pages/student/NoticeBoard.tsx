import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Bell, AlertCircle, Paperclip } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Notice {
  id: number;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  attachmentUrl: string | null;
  createdAt: string;
  createdBy: {
    fullName: string;
  };
}

export default function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices() {
    setLoading(true);
    try {
      const { data } = await api.get('/notices');
      setNotices(data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-700 border-red-200'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          icon: 'text-orange-600',
          badge: 'bg-orange-100 text-orange-700 border-orange-200'
        };
      case 'NORMAL':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-700 border-blue-200'
        };
      case 'LOW':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700 border-gray-200'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-700 border-gray-200'
        };
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Bell className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">No notices available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => {
            const config = getPriorityConfig(notice.priority);
            
            return (
              <div
                key={notice.id}
                className={`${config.bg} border ${config.border} rounded-xl p-6 shadow-sm hover:shadow-md transition`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {notice.priority === 'URGENT' && (
                      <AlertCircle className={config.icon} size={24} />
                    )}
                    <h3 className="text-lg font-bold text-gray-900">{notice.title}</h3>
                  </div>
                  <span className={`px-2 py-1 border rounded text-[10px] font-bold uppercase ${config.badge}`}>
                    {notice.priority}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4 leading-relaxed">{notice.content}</p>
                
                {notice.attachmentUrl && (
                  <div className="mb-4">
                    <a 
                      href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${notice.attachmentUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors font-medium shadow-sm"
                    >
                      <Paperclip size={16} />
                      View Attachment
                    </a>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Posted by: <strong>{notice.createdBy.fullName}</strong></span>
                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
