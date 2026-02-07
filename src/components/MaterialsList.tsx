import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Download, X, Save } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from './ui/LoadingSpinner';

interface Material {
    id: number;
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    createdAt: string;
    teacher: {
        profile: {
            fullName: string;
        }
    };
}

const MaterialsList = ({ subjectId, userRole }: { subjectId: number, userRole: string }) => {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/materials/${subjectId}`);
            setMaterials(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, [subjectId]);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this material?")) return;
        try {
            await api.delete(`/materials/${id}`);
            toast.success("Material deleted");
            setMaterials(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete material");
        }
    };

    const isTeacher = userRole === 'TEACHER';

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Class Materials</h2>
                {isTeacher && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold text-sm shadow-lg shadow-indigo-100"
                    >
                        <Plus size={18} /> Add Material
                    </button>
                )}
            </div>

            {loading ? (
                <div className="py-12 flex justify-center"><LoadingSpinner /></div>
            ) : materials.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-gray-200 rounded-xl">
                    <FileText size={40} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-gray-500 text-sm">No materials uploaded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {materials.map((material) => (
                        <div key={material.id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition group">
                            <div className="p-3 bg-white rounded-lg border border-gray-100 text-indigo-600">
                                <FileText size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 truncate">{material.title}</h3>
                                {material.description && <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{material.description}</p>}
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                    <span>{new Date(material.createdAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{material.teacher?.profile?.fullName}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a 
                                    href={`http://localhost:3000${material.fileUrl}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                    title="Download/View"
                                >
                                    <Download size={18} />
                                </a>
                                {isTeacher && (
                                    <button 
                                        onClick={() => handleDelete(material.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <AddMaterialModal 
                    subjectId={subjectId} 
                    onClose={() => setIsModalOpen(false)} 
                    onSuccess={() => {
                        setIsModalOpen(false);
                        fetchMaterials();
                    }} 
                />
            )}
        </div>
    );
};

const AddMaterialModal = ({ subjectId, onClose, onSuccess }: { subjectId: number, onClose: () => void, onSuccess: () => void }) => {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('subjectId', subjectId.toString());
        formData.append('file', file);

        try {
            await api.post('/materials', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Material uploaded successfully");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload material");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-indigo-700 text-white">
                    <h3 className="font-bold text-lg">Add Material</h3>
                    <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Title</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm font-medium"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Lecture Notes, Syllabus, etc."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description (Optional)</label>
                        <textarea 
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the content..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">File</label>
                        <input 
                            type="file" 
                            required
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition font-bold text-sm">Cancel</button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold text-sm shadow-lg shadow-indigo-100 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading ? 'Uploading...' : <><Save size={18} /> Upload</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MaterialsList;
