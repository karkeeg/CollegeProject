import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Loader2, Clock, Award, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface Question {
  text: string;
  type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options?: string[];
  correctAnswer?: string;
}

interface QuizAttempt {
  id: number;
  score: number;
  completedAt: string;
  answers: any;
}

interface QuizTakingViewProps {
  quizId?: number;
  subjectId?: number;
  subjectName: string;
  onClose?: () => void;
}

export default function QuizTakingView({ quizId, subjectId, subjectName, onClose }: QuizTakingViewProps) {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<'start' | 'taking' | 'result'>('start');

  useEffect(() => {
    fetchQuizStatus();
  }, [quizId, subjectId]);

  const fetchQuizStatus = async () => {
    if (!quizId && !subjectId) return;
    setLoading(true);
    try {
      let targetQuizId = quizId;

      // If no quizId, we try to find the first quiz for this subject (legacy behavior)
      if (!targetQuizId && subjectId) {
          const { data: quizzes } = await api.get(`/student/subject/${subjectId}/quizzes`);
          if (quizzes.length > 0) {
              targetQuizId = quizzes[0].id;
          }
      }

      if (!targetQuizId) {
          setQuiz(null);
          setLoading(false);
          return;
      }

      // 1. Check for existing result for THIS SPECIFIC QUIZ
      const resultRes = await api.get(`/student/quiz/result/${targetQuizId}`);
      if (resultRes.data.attempt) {
        setAttempt(resultRes.data.attempt);
        setView('result');
      }

      // 2. Fetch Quiz
      const quizRes = await api.get(`/student/quiz/${targetQuizId}`);
      setQuiz(quizRes.data);
      setQuestions(quizRes.data.questions);
    } catch (error) {
      console.error(error);
      // If 404, it means no quiz exists
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/student/quiz/attempt', {
        quizId: quiz.id,
        answers
      });
      setAttempt(data.attempt);
      setView('result');
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
  }

  if (view === 'result' && attempt) {
    const studentAnswers = attempt.answers as any;
    
    return (
      <div className="space-y-2 duration-500">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <Award className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900">Quiz Completed!</h3>
            <p className="text-gray-500 font-medium">Assessment summary for {subjectName}</p>
          </div>
          
          <div className="bg-white p-2 rounded-[32px] max-w-sm mx-auto border border-gray-100 shadow-xl shadow-gray-100/50">
             <div className="text-xs text-gray-400 font-black uppercase tracking-widest mb-3">Your Final Score</div>
             <div className="text-3xl font-black text-indigo-600 mb-3">{Math.round(attempt.score)}%</div>
             <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 px-3 py-1 rounded-full w-fit mx-auto">
               Completed on {new Date(attempt.completedAt).toLocaleDateString()}
             </div>
          </div>
        </div>

        <div className="space-y-2 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-2 px-4">
            <div className="h-px flex-1 bg-gray-100" />
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Question Review</h4>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {questions.map((q, i) => {
            const studentAns = studentAnswers[i];
            const isCorrect = q.correctAnswer === studentAns;
            
            return (
              <div key={i} className={clsx(
                "p-2 border transition-all duration-300",
                isCorrect ? "bg-green-50/30 border-green-100" : "bg-red-50/30 border-red-100"
              )}>
                <div className="flex items-start gap-4 mb-2">
                  <span className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-sm",
                    isCorrect ? "bg-green-500 text-white" : "bg-red-500 text-white"
                  )}>
                    {i + 1}
                  </span>
                  <div>
                    <h5 className="font-semibold text-gray-900">{q.text}</h5>
                    <div className="mt-1 flex items-center gap-2">
                       <span className="text-[8px] uppercase  text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
                         {q.type.replace('_', ' ')}
                       </span>
                       {isCorrect ? (
                         <span className="text-[8px] font-black uppercase tracking-wider text-green-600 flex items-center gap-1">
                           <CheckCircle size={8} /> Correct
                         </span>
                       ) : (
                         <span className="text-[8px] font-black uppercase tracking-wider text-red-600 flex items-center gap-1">
                           <XCircle size={8} /> Incorrect
                         </span>
                       )}
                    </div>
                  </div>
                </div>

                <div className="ml-6 space-y-2">
                  <div className="grid gap-2">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Answer</div>
                    <div className={clsx(
                      "px-4 py-2 rounded-2xl text-sm font-bold border",
                      isCorrect ? "bg-white border-green-200 text-green-700" : "bg-white border-red-200 text-red-700"
                    )}>
                      {studentAns || "No answer provided"}
                    </div>
                  </div>

                  {!isCorrect && (
                    <div className="grid gap-2">
                      <div className="text-[10px] font-black text-green-600 uppercase tracking-widest ml-1">Correct Answer</div>
                      <div className="bg-green-500 text-white px-4 py-3 rounded-2xl text-sm font-black shadow-lg shadow-green-100">
                        {q.correctAnswer}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-center pt-4">
          <button 
            onClick={onClose}
            className="bg-gray-900 text-white px-4 py-2 rounded-[20px] font-black hover:bg-black transition shadow-xl text-sm"
          >
            Finished Review
          </button>
        </div>
      </div>
    );
  }

  if (view === 'result' && attempt) {
    const studentAnswers = attempt.answers as any;
    
    return (
      <div className="space-y-1 py-0 animate-in fade-in duration-150">
        <div className="flex items-center justify-between border-b-2 border-gray-900 pb-1 mb-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-tighter">Result Report</h3>
            <span className="text-[9px] text-gray-400 font-bold">{subjectName}</span>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Score:</span>
             <span className="text-sm font-black text-gray-900">{Math.round(attempt.score)}%</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100 max-w-2xl mx-auto">
          {questions.map((q, i) => {
            const studentAns = studentAnswers[i];
            const isCorrect = q.correctAnswer === studentAns;
            
            return (
              <div key={i} className="py-1">
                <div className="flex gap-1.5 items-start">
                  <span className="text-[9px] font-mono text-gray-400 shrink-0 mt-0.5 w-3">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <h5 className="font-bold text-gray-800 text-[11px] leading-tight flex-1">{q.text}</h5>
                      <div className="shrink-0">
                        {isCorrect ? (
                          <span className="text-green-600 font-black text-[8px] uppercase tracking-tighter flex items-center gap-0.5">
                            <CheckCircle size={9} /> OK
                          </span>
                        ) : (
                          <span className="text-red-600 font-black text-[8px] uppercase tracking-tighter flex items-center gap-0.5">
                            <XCircle size={9} /> FAIL
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0 items-center border-l border-gray-100 pl-1.5 ml-0.5">
                      <div className="flex items-center gap-1 uppercase tracking-tighter">
                        <span className="text-[7px] font-bold text-gray-400">Response:</span>
                        <span className={clsx("text-[10px] font-bold", isCorrect ? "text-gray-900" : "text-red-600")}>
                          {studentAns || "-"}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="flex items-center gap-1 uppercase tracking-tighter">
                          <span className="text-[7px] font-bold text-green-600">Correct:</span>
                          <span className="text-[10px] font-bold text-gray-900 italic">{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-end pt-1 border-t border-gray-200 mt-2">
          <button 
            onClick={onClose}
            className="bg-gray-900 text-white px-3 py-1 rounded-none font-bold hover:bg-black transition text-[9px] uppercase tracking-widest"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">No quiz available for this subject yet.</p>
        {onClose && <button onClick={onClose} className="mt-2 text-indigo-600 font-bold hover:underline text-xs">Go Back</button>}
      </div>
    );
  }

  if (view === 'start') {
     return (
       <div className="text-center py-8 space-y-4">
         <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
         <p className="text-gray-500 text-xs max-w-sm mx-auto">{quiz.description}</p>
         <div className="flex gap-2 justify-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1"><Clock size={12} /> 10 Mins Est.</span>
            <span>•</span>
            <span>{questions.length} Questions</span>
         </div>
         
         <div className="pt-2">
           <button 
             onClick={() => setView('taking')}
             className="bg-indigo-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm"
           >
             Start Quiz
           </button>
         </div>
       </div>
     );
  }

  return (
    <div className="space-y-6 py-2">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
         <h3 className="font-bold text-gray-900 text-base">{subjectName} Quiz</h3>
         <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-xs">
           {Object.keys(answers).length} / {questions.length} Answered
         </span>
      </div>

      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        {questions.map((q, i) => (
          <div key={i} className="space-y-2">
            <h4 className="font-bold text-gray-800 text-sm flex gap-2">
              <span className="text-gray-300 font-mono">#{i + 1}</span>
              {q.text}
            </h4>

            {q.type === 'MCQ' && (
              <div className="grid gap-2 pl-6">
                {q.options?.map((opt, optIndex) => (
                  <label key={optIndex} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs ${answers[i] === opt ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input 
                      type="radio" 
                      name={`q-${i}`} 
                      value={opt}
                      checked={answers[i] === opt}
                      onChange={() => setAnswers({...answers, [i]: opt})}
                      className="text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                    />
                    <span className="text-gray-700 font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'TRUE_FALSE' && (
               <div className="flex gap-3 pl-6">
                 {['True', 'False'].map(opt => (
                   <button
                     key={opt}
                     onClick={() => setAnswers({...answers, [i]: opt})}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition ${answers[i] === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                   >
                     {opt}
                   </button>
                 ))}
               </div>
            )}
            
            {q.type === 'SHORT_ANSWER' && (
               <div className="pl-6">
                  <input 
                    type="text"
                    placeholder="Type your answer here..."
                    value={answers[i] || ''}
                    onChange={(e) => setAnswers({...answers, [i]: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-1 focus:ring-indigo-500 outline-none text-xs"
                  />
               </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
         {onClose && <button onClick={onClose} className="px-4 py-1.5 text-gray-500 hover:text-gray-900 rounded font-bold text-xs">Cancel</button>}
         <button 
           onClick={submitQuiz}
           disabled={submitting || Object.keys(answers).length < questions.length}
           className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 text-xs"
         >
           {submitting ? 'Submitting...' : 'Submit Quiz'}
         </button>
      </div>
    </div>
  );
}
