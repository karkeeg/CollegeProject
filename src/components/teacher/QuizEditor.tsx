import { useState } from 'react';
import api from '../../lib/api';
import { Plus, Brain, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Question {
    text: string;
    type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
    options?: string[];
    correctAnswer: string;
}

interface QuizEditorProps {
    subjectId: number;
    initialData?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function QuizEditor({ subjectId, initialData, onSuccess, onCancel }: QuizEditorProps) {
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);

    const addQuestion = () => {
        setQuestions([...questions, { text: '', type: 'MCQ', options: ['', '', '', ''], correctAnswer: '' }]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        const options = [...(newQuestions[qIndex].options || [])];
        options[oIndex] = value;
        newQuestions[qIndex].options = options;
        setQuestions(newQuestions);
    };

    const handleGenerateAI = async () => {
        try {
            setGenerating(true);
            const { data } = await api.post('/teacher/quiz/generate', { subjectId });
            setQuestions(data.questions);
            if (title === '') setTitle('AI Generated Quiz - ' + new Date().toLocaleDateString());
            toast.success("Quiz draft generated from materials!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate quiz. Make sure you have uploaded class materials or assignments.");
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) return toast.error("Please enter a title");
        if (questions.length === 0) return toast.error("Please add at least one question");
        
        // Basic validation
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text.trim()) return toast.error(`Question ${i + 1} text is empty`);
            if (!q.correctAnswer.trim()) return toast.error(`Question ${i + 1} has no correct answer selected`);
            if (q.type === 'MCQ' && q.options?.some(o => !o.trim())) {
                return toast.error(`Question ${i + 1} has empty options`);
            }
        }

        try {
            setLoading(true);
            await api.post('/teacher/quiz/save', {
                id: initialData?.id,
                subjectId,
                title,
                description,
                questions
            });
            toast.success("Quiz saved successfully");
            onSuccess();
        } catch (error) {
            toast.error("Failed to save quiz");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[75vh]">
            <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-1">
                    <div className="md:col-span-2 space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-0.5">Quiz Title</label>
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-bold text-gray-900 text-sm"
                                placeholder="E.g., Mid-Term Assessment"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-0.5">Description</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-xs resize-none h-16"
                                placeholder="Briefly describe the quiz content..."
                            />
                        </div>
                    </div>
                    
                    <div className="bg-indigo-600 rounded-xl p-4 text-white shadow-sm flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-2">
                            <Brain size={16} />
                            <h3 className="font-bold text-xs">AI Quiz Draft</h3>
                        </div>
                        <p className="text-white/80 text-[10px] mb-3 leading-relaxed">
                            Draft questions automatically from your course materials.
                        </p>
                        <button 
                            onClick={handleGenerateAI}
                            disabled={generating}
                            className="w-full bg-white text-indigo-600 py-1.5 rounded-lg font-bold text-[10px] hover:bg-indigo-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {generating ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                "Generate Draft"
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                        Questions ({questions.length})
                    </h3>
                    <button 
                        onClick={addQuestion}
                        className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded transition"
                    >
                        <Plus size={14} />
                        Add Question
                    </button>
                </div>

                <div className="space-y-4 pb-6">
                    {questions.length === 0 && (
                        <div className="text-center py-10 text-gray-400 text-xs italic">
                             No questions yet. Click "Add Question" to start.
                        </div>
                    )}
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white border border-gray-200 rounded-xl p-4 relative group hover:border-indigo-200 transition-colors shadow-sm">
                            <button 
                                onClick={() => removeQuestion(qIndex)}
                                className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 transition"
                            >
                                <X size={14} />
                            </button>

                            <div className="flex gap-3 mb-3">
                                <div className="bg-gray-100 w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-gray-500 shrink-0">
                                    {qIndex + 1}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap gap-2 items-center">
                                        <select 
                                            value={q.type}
                                            onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                                            className="bg-indigo-50 border border-indigo-100 px-2 py-1 rounded text-[10px] font-bold text-indigo-700 outline-none focus:ring-1 focus:ring-indigo-500"
                                        >
                                            <option value="MCQ">Multiple Choice</option>
                                            <option value="TRUE_FALSE">True / False</option>
                                            <option value="SHORT_ANSWER">Short Answer</option>
                                        </select>
                                    </div>
                                    <textarea 
                                        value={q.text}
                                        onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                        placeholder="Enter question text..."
                                        className="w-full px-0 bg-transparent border-0 border-b border-gray-100 focus:border-indigo-500 outline-none transition-all py-1 text-gray-900 font-bold text-sm resize-none"
                                        rows={1}
                                    />
                                </div>
                            </div>

                            <div className="ml-9">
                                {q.type === 'MCQ' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                        {q.options?.map((opt, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => updateQuestion(qIndex, 'correctAnswer', opt)}
                                                    type="button"
                                                    className={clsx(
                                                        "w-4 h-4 rounded-full border flex items-center justify-center transition shrink-0",
                                                        q.correctAnswer === opt ? "bg-green-500 border-green-500" : "bg-white border-gray-300 hover:border-green-400"
                                                    )}
                                                >
                                                    {q.correctAnswer === opt && <div className="w-1 h-1 bg-white rounded-full" />}
                                                </button>
                                                <input 
                                                    value={opt}
                                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    className={clsx(
                                                        "flex-1 bg-gray-50 px-2 py-1.5 rounded-lg text-xs outline-none border transition-all",
                                                        q.correctAnswer === opt ? "border-green-200 bg-green-50/50 text-green-800" : "border-gray-100 focus:border-indigo-100"
                                                    )}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) || q.type === 'TRUE_FALSE' ? (
                                    <div className="flex gap-2 mt-1">
                                        {['True', 'False'].map(opt => (
                                            <button 
                                                key={opt}
                                                type="button"
                                                onClick={() => updateQuestion(qIndex, 'correctAnswer', opt)}
                                                className={clsx(
                                                    "px-4 py-1 rounded-lg text-[10px] font-bold transition-all border",
                                                    q.correctAnswer === opt 
                                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" 
                                                        : "bg-white border-gray-100 text-gray-400 hover:border-indigo-100"
                                                )}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-1">
                                        <input 
                                            value={q.correctAnswer}
                                            onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                                            placeholder="Correct Answer..."
                                            className="w-full bg-gray-50 px-3 py-1.5 rounded-lg text-xs border border-gray-100 focus:ring-1 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-auto">
                <button 
                    onClick={onCancel}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-gray-900 text-white px-8 py-2 rounded-lg flex items-center gap-2 hover:bg-black transition font-bold shadow-sm text-xs disabled:opacity-50"
                >
                    {loading ? "Saving..." : (
                        <><Save size={14} /> Save Quiz</>
                    )}
                </button>
            </div>
        </div>
    );
}
