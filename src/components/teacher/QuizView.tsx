import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Plus, Brain, Trash2, Edit, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

import { useModal } from '../../hooks/useModal';
import QuizEditor from './QuizEditor';


interface Quiz {
    id: number;
    title: string;
    description: string;
    questions: any[];
    createdAt: string;
}

export default function QuizView({ subjectId }: { subjectId: number }) {
    const { openModal, closeModal } = useModal();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuizzes();
    }, [subjectId]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/teacher/subject/${subjectId}/quizzes`);
            setQuizzes(data);
        } catch (error) {
            console.error('Failed to fetch quizzes:', error);
            toast.error("Failed to load quizzes");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;
        try {
            await api.delete(`/teacher/quiz/${id}`);
            toast.success("Quiz deleted");
            fetchQuizzes();
        } catch (error) {
            toast.error("Failed to delete quiz");
        }
    };

    const handleCreateQuiz = () => {
        openModal(
            <QuizEditor
                subjectId={subjectId} 
                onSuccess={() => {
                    closeModal();
                    fetchQuizzes();
                }}
                onCancel={closeModal}
            />,
            { title: "Create New Quiz", size: "4xl" }
        );
    };

    const handleEditQuiz = (quiz: Quiz) => {
        openModal(
            <QuizEditor 
                subjectId={subjectId}
                initialData={quiz}
                onSuccess={() => {
                    closeModal();
                    fetchQuizzes();
                }}
                onCancel={closeModal}
            />,
            { title: "Edit Quiz", size: "4xl" }
        );
    };

    if (loading) return <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-base font-bold text-gray-900">Subject Quizzes</h2>
                    <p className="text-[10px] text-gray-500">Manage interactive assessments for this subject</p>
                </div>
                <button 
                    onClick={handleCreateQuiz}
                    className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-indigo-700 transition font-bold shadow-sm text-xs"
                >
                    <Plus size={14} />
                    New Quiz
                </button>
            </div>

            {quizzes.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl p-8 text-center shadow-sm">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Brain size={24} className="text-indigo-300" />
                    </div>
                    <h3 className="text-gray-900 font-bold text-sm">No Quizzes Created</h3>
                    <p className="text-gray-500 text-[10px] mt-1 mb-4">Create your first quiz manually or draft one with AI.</p>
                    <button 
                        onClick={handleCreateQuiz}
                        className="text-indigo-600 font-bold text-xs hover:underline"
                    >
                        Create Now
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2.5">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-white border border-gray-100 rounded-xl p-3.5 hover:border-indigo-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm">{quiz.title}</h3>
                                    <p className="text-[10px] text-gray-400 line-clamp-1 max-w-sm">{quiz.description || "Interactive assessment"}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <Clock size={10} /> {new Date(quiz.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <FileText size={10} /> {quiz.questions.length} Qs
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 self-end md:self-auto">
                                <button 
                                    onClick={() => handleEditQuiz(quiz)}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                >
                                    <Edit size={16} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(quiz.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
