import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Loader2, BrainCircuit, Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Question {
  text: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer: string;
}

interface QuizGeneratorModalProps {
  subjectId: number;
  subjectName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuizGeneratorModal({ subjectId, subjectName, onClose, onSuccess }: QuizGeneratorModalProps) {
  const [step, setStep] = useState<'check' | 'generate' | 'preview'>('check');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizMetadata, setQuizMetadata] = useState({ title: `Quiz: ${subjectName}`, description: 'Auto-generated quiz based on course materials.' });
  const [existingQuizId, setExistingQuizId] = useState<number | null>(null);

  // Check for existing quiz on mount
  useEffect(() => {
    checkExistingQuiz();
  }, [subjectId]);

  const checkExistingQuiz = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/teacher/quiz/check/${subjectId}`);
      if (data.exists) {
        setExistingQuizId(data.quizId);
        // If exists, fetch it to show as "Update"
        const quizData = await api.get(`/teacher/quiz/${subjectId}`);
        setQuestions(quizData.data.questions);
        setQuizMetadata({ title: quizData.data.title, description: quizData.data.description || '' });
        setStep('preview');
      } else {
        setStep('generate');
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to check existing quiz");
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    setLoading(true);
    try {
      // If updating, we might want to "re-generate" or "append".
      // For now, let's just generate a fresh batch and append/replace logic can be manual.
      const { data } = await api.post('/teacher/quiz/generate', { subjectId });
      
      if (existingQuizId) {
        // If updating, append new unique questions?? Or just replace?
        // Let's replace for now, but user can edit.
        toast.success("New questions generated based on latest data!");
        setQuestions(data.questions);
      } else {
        setQuestions(data.questions);
      }
      setStep('preview');
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate questions. Ensure assignments have legible content.");
    } finally {
      setLoading(false);
    }
  };

  const saveQuiz = async () => {
    setLoading(true);
    try {
      await api.post('/teacher/quiz/save', {
        subjectId,
        title: quizMetadata.title,
        description: quizMetadata.description,
        questions
      });
      toast.success(existingQuizId ? "Quiz updated successfully!" : "Quiz created successfully!");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save quiz");
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  if (loading && step === 'check') {
     return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
        <BrainCircuit className="text-indigo-600 mt-1" size={24} />
        <div>
          <h3 className="font-bold text-indigo-900">AI Quiz Generator</h3>
          <p className="text-sm text-indigo-700">
            {existingQuizId 
              ? "A quiz already exists for this subject. You can update it with new questions generated from recent assignments."
              : "Generate a quiz automatically by analyzing your assignment descriptions and attached files."}
          </p>
        </div>
      </div>

      {step === 'generate' && (
        <div className="text-center py-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className={`text-indigo-600 ${loading ? 'animate-spin' : ''}`} size={32} />
            </div>
            <h4 className="text-xl font-bold text-gray-900">
              {loading ? "Analyzing Course Material..." : "Ready to Generate"}
            </h4>
            <p className="text-gray-500 max-w-md mx-auto mt-2">
              The algorithm will scan all assignments and files for {subjectName} to create relevant questions.
            </p>
          </div>
          
          <button
            onClick={generateQuestions}
            disabled={loading}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Generate Draft Quiz"}
          </button>
        </div>
      )}

      {step === 'preview' && (
        <div className="space-y-6">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Quiz Title</label>
              <input 
                value={quizMetadata.title}
                onChange={(e) => setQuizMetadata({...quizMetadata, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
              <textarea 
                value={quizMetadata.description}
                onChange={(e) => setQuizMetadata({...quizMetadata, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h4 className="font-bold text-gray-800">Generated Questions ({questions.length})</h4>
            <button 
              onClick={generateQuestions}
              disabled={loading}
              className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:bg-indigo-50 px-3 py-1 rounded-lg transition"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Regenerate
            </button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {questions.map((q: Question, i: number) => (
              <div key={i} className="p-4 border border-gray-200 rounded-xl bg-white relative group hover:border-indigo-300 transition">
                <button 
                  onClick={() => removeQuestion(i)}
                  className="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                >
                  &times;
                </button>
                <div className="mb-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{q.type.replace('_', ' ')}</label>
                   <input 
                      value={q.text}
                      onChange={(e) => updateQuestion(i, 'text', e.target.value)}
                      className="block w-full text-gray-900 font-medium border-b border-transparent focus:border-indigo-300 outline-none py-1"
                   />
                </div>
                
                {q.type === 'MCQ' && (
                  <div className="space-y-1 ml-4">
                    {q.options?.map((opt: string, optIndex: number) => (
                       <div key={optIndex} className={`text-sm flex items-center gap-2 ${opt === q.correctAnswer ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${opt === q.correctAnswer ? 'bg-green-500' : 'bg-gray-300'}`} />
                          {opt}
                       </div>
                    ))}
                  </div>
                )}
                
                {q.type === 'TRUE_FALSE' && (
                  <div className="flex gap-4 ml-4 mt-2">
                    {['True', 'False'].map(opt => (
                       <span key={opt} className={`text-sm px-3 py-1 rounded-full ${opt === q.correctAnswer ? 'bg-green-100 text-green-700 font-bold' : 'bg-gray-100 text-gray-500'}`}>
                         {opt}
                       </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-400">
                  Correct Answer: <span className="font-mono text-gray-600">{q.correctAnswer}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
             <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">
               Cancel
             </button>
             <button 
               onClick={saveQuiz}
               disabled={loading || questions.length === 0}
               className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2"
             >
               <Save size={18} />
               {existingQuizId ? "Update Quiz" : "Save Quiz"}
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
