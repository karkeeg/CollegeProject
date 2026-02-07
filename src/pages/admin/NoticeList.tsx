import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Search, Trash2, Edit, Paperclip, Download } from 'lucide-react';
import FileUploader from '../../components/ui/FileUploader';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useModal } from '../../hooks/useModal';

interface Notice {
  id: number;
  title: string;
  content: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  targetRole: 'ADMIN' | 'TEACHER' | 'STUDENT' | null;
  attachmentUrl: string | null;
  createdAt: string;
  createdBy: {
    fullName: string;
    role: string;
  };
}

export default function NoticeList() {
  const { openModal, closeModal } = useModal();
  
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices() {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/notices');
      setNotices(data);
    } catch (error) {
      console.error('Error fetching notices:', error);
      toast.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (noticeId: number) => {
    try {
      await api.delete(`/admin/notices/${noticeId}`);
      setNotices(prev => prev.filter(n => n.id !== noticeId));
      toast.success("Notice deleted successfully");
      closeModal();
    } catch (err: any) {
      toast.error("Failed to delete notice: " + (err.response?.data?.error || err.message));
    }
  };

  const handleConfirmDelete = (notice: Notice) => {
    openModal(
      <div className="p-4">
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{notice.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium">Cancel</button>
          <button onClick={() => handleDelete(notice.id)} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-lg shadow-red-200">Delete Permanently</button>
        </div>
      </div>,
      { title: "Delete Notice", size: "sm" }
    );
  };

  const handleEdit = (notice: Notice) => {
    openModal(
      <NoticeForm
        initialData={notice}
        onCheckCompletion={() => {
          closeModal();
          fetchNotices();
        }}
        onCancel={closeModal}
      />,
      { title: "Edit Notice", size: "2xl" }
    );
  };

  const handleAdd = () => {
    openModal(
      <NoticeForm
        initialData={null}
        onCheckCompletion={() => {
          closeModal();
          fetchNotices();
        }}
        onCancel={closeModal}
      />,
      { title: "Add New Notice", size: "2xl" }
    );
  };

  const filteredNotices = notices.filter(notice =>
    notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'NORMAL': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'LOW': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = (role: string | null) => {
    if (!role) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'TEACHER': return 'bg-green-100 text-green-700 border-green-200';
      case 'STUDENT': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Add Notice
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4 border-b border-gray-200">Title</th>
                <th className="px-6 py-4 border-b border-gray-200">Priority</th>
                <th className="px-6 py-4 border-b border-gray-200">Target</th>
                <th className="px-6 py-4 border-b border-gray-200">Created By</th>
                <th className="px-6 py-4 border-b border-gray-200">Date</th>
                <th className="px-6 py-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 flex justify-center w-full"><LoadingSpinner /></td></tr>
              ) : filteredNotices.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No notices found.</td></tr>
              ) : (
                filteredNotices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{notice.title}</div>
                      {notice.attachmentUrl && (
                        <div className="flex items-center gap-1 mt-1">
                          <Paperclip size={12} className="text-gray-400" />
                          <a 
                            href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${notice.attachmentUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-indigo-600 hover:underline font-medium"
                          >
                            View Attachment
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 border rounded text-[10px] font-bold uppercase ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 border rounded text-[10px] font-bold uppercase ${getRoleColor(notice.targetRole)}`}>
                        {notice.targetRole || 'ALL'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{notice.createdBy.fullName}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(notice.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {notice.attachmentUrl && (
                          <a 
                            href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${notice.attachmentUrl}`}
                            download
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                            title="Download Attachment"
                          >
                            <Download size={18} />
                          </a>
                        )}
                        <button onClick={() => handleEdit(notice)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleConfirmDelete(notice)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// Notice Form Component
function NoticeForm({ initialData, onCheckCompletion, onCancel }: {
  initialData: Notice | null;
  onCheckCompletion: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    priority: initialData?.priority || 'NORMAL',
    targetRole: initialData?.targetRole || ''
  });
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('priority', formData.priority);
      data.append('targetRole', formData.targetRole || '');
      if (attachment) {
        data.append('attachment', attachment);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (initialData) {
        await api.put(`/admin/notices/${initialData.id}`, data, config);
        toast.success("Notice updated successfully");
      } else {
        await api.post('/admin/notices', data, config);
        toast.success("Notice created successfully");
      }
      onCheckCompletion();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save notice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
        <input
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Content</label>
        <textarea
          name="content"
          required
          rows={4}
          value={formData.content}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        >
          <option value="LOW">Low</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Target Audience</label>
        <select
          name="targetRole"
          value={formData.targetRole}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        >
          <option value="">All Users</option>
          <option value="ADMIN">Admins Only</option>
          <option value="TEACHER">Teachers Only</option>
          <option value="STUDENT">Students Only</option>
        </select>
      </div>

      <FileUploader onFileSelect={setAttachment} label="Attachment (Optional)" />

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
        >
          {loading ? 'Saving...' : (initialData ? 'Update Notice' : 'Create Notice')}
        </button>
      </div>
    </form>
  );
}
