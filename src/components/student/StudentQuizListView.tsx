import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Brain, ChevronRight, CheckCircle2, Clock, Award, PlayCircle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useModal } from '../../hooks/useModal';
import QuizTakingView from '../../pages/student/QuizTakingView';
import clsx from 'clsx';

interface Quiz {
    id: number;
    title: string;
    description: string;
    questions: any[];
    createdAt: string;
}

interface Attempt {
    quizId: number;
    score: number;
    completedAt: string;
}

export default function StudentQuizListView({ subjectId, subjectName }: { subjectId: number, subjectName: string }) {
    const { openModal, closeModal } = useModal();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [attempts, setAttempts] = useState<Record<number, Attempt>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [subjectId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: quizList } = await api.get(`/student/subject/${subjectId}/quizzes`);
            setQuizzes(quizList);

            // Fetch results for each quiz
            const attemptResults: Record<number, Attempt> = {};
            for (const quiz of quizList) {
                const { data } = await api.get(`/student/quiz/result/${quiz.id}`);
                if (data.attempt) {
                    attemptResults[quiz.id] = data.attempt;
                }
            }
            setAttempts(attemptResults);
        } catch (error) {
            console.error('Failed to fetch student quiz data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTakeQuiz = (quiz: Quiz) => {
        openModal(
            <QuizTakingView 
                quizId={quiz.id} 
                subjectName={subjectName} 
                onClose={() => {
                    closeModal();
                    fetchData();
                }} 
            />,
            { title: quiz.title, size: "lg" }
        );
    };

    if (loading) return <LoadingSpinner />;

    if (quizzes.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain size={24} className="text-indigo-300" />
                </div>
                <h3 className="text-gray-900 font-bold text-sm">No Quizzes Available</h3>
                <p className="text-gray-500 text-[10px] mt-1">Your teacher hasn't posted any quizzes for this subject yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2.5">
                {quizzes.map((quiz) => {
                    const attempt = attempts[quiz.id];
                    return (
                        <div 
                            key={quiz.id} 
                            onClick={() => handleTakeQuiz(quiz)}
                            className="bg-white border border-gray-100 rounded-xl p-3.5 hover:border-indigo-200 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:shadow-gray-100"
                        >
                            <div className="flex items-start gap-3">
                                <div className={clsx(
                                    "p-2 rounded-lg transition",
                                    attempt ? "bg-green-50 text-green-600" : "bg-indigo-50 text-indigo-600"
                                )}>
                                    {attempt ? <CheckCircle2 size={20} /> : <Brain size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-indigo-600 transition">{quiz.title}</h3>
                                    <p className="text-[10px] text-gray-400 line-clamp-1 max-w-sm">{quiz.description || "Interactive assessment"}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                            <Clock size={10} /> {quiz.questions.length} Qs
                                        </span>
                                        {attempt && (
                                            <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                                                <Award size={10} /> {Math.round(attempt.score)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button className={clsx(
                                "px-5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 self-end md:self-auto",
                                attempt 
                                    ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" 
                                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                            )}>
                                {attempt ? "View Results" : (
                                    <>
                                        <PlayCircle size={14} />
                                        Start Now
                                    </>
                                )}
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
