import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { FileText, Calendar, CheckCircle, XCircle, Clock, Paperclip, Download, BrainCircuit } from 'lucide-react';
import Modal from '../../components/Modal';
import FileUploader from '../../components/ui/FileUploader';
import QuizTakingView from '../../pages/student/QuizTakingView';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Assignment {
  id: number;
  title: string;
  description: string | null;
  dueDate: string;
  maxMarks: number;
  attachmentUrl: string | null;
  createdAt: string;
  subject: {
    id: number;
    code: string;
    name: string;
  };
  submissions: Array<{
    id: number;
    submittedAt: string;
    marksObtained: number | null;
    feedback: string | null;
    attachmentUrl: string | null;
  }>;
}

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [takingQuizSubject, setTakingQuizSubject] = useState<{id: number, name: string} | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    setLoading(true);
    try {
      const { data } = await api.get('/student/homework');
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }

  const getSubmissionStatus = (assignment: Assignment) => {
    if (assignment.submissions.length === 0) {
      return { status: 'pending', label: 'Not Submitted', color: 'text-red-600' };
    }
    
    const submission = assignment.submissions[0];
    if (submission.marksObtained !== null) {
      return { status: 'graded', label: 'Graded', color: 'text-green-600' };
    }
    
    return { status: 'submitted', label: 'Submitted', color: 'text-blue-600' };
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="text-indigo-600" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">No assignments available.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => {
            const status = getSubmissionStatus(assignment);
            const overdue = isOverdue(assignment.dueDate);
            const submission = assignment.submissions[0];
            
            return (
              <div
                key={assignment.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[10px] font-bold uppercase">
                        {assignment.subject.code}
                      </span>
                    </div>
                    
                    {assignment.attachmentUrl && (
                      <div className="mb-3">
                        <a 
                          href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${assignment.attachmentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1 rounded transition border border-indigo-100 bg-indigo-50/30"
                        >
                          <Paperclip size={14} />
                          Download Materials
                        </a>
                      </div>
                    )}
                    
                    {assignment.description && (
                      <p className="text-gray-600 mb-3">{assignment.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span className={overdue && status.status === 'pending' ? 'text-red-600 font-bold' : ''}>
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div>Max Marks: <strong>{assignment.maxMarks}</strong></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => setTakingQuizSubject({ id: assignment.subject.id, name: assignment.subject.name })}
                      className="text-xs flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-bold hover:bg-purple-200 transition mb-1"
                      title="Take Quiz for this Subject"
                    >
                      <BrainCircuit size={14} />
                      Quiz
                    </button>

                    <div className={`flex items-center gap-1 font-bold ${status.color}`}>
                      {status.status === 'graded' && <CheckCircle size={18} />}
                      {status.status === 'submitted' && <Clock size={18} />}
                      {status.status === 'pending' && <XCircle size={18} />}
                      <span className="text-sm">{status.label}</span>
                    </div>
                    
                    {status.status === 'pending' && !overdue && (
                      <button
                        onClick={() => setSubmittingAssignment(assignment)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200 text-sm"
                      >
                        Submit
                      </button>
                    )}
                    
                    {status.status === 'graded' && submission && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {submission.marksObtained}/{assignment.maxMarks}
                        </div>
                        {submission.feedback && (
                          <p className="text-xs text-gray-500 mt-1">Feedback available</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Show submission details if exists */}
                {submission && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">
                      Submitted on: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                    
                    {submission.attachmentUrl && (
                      <div className="mt-2">
                        <a 
                          href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${submission.attachmentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline"
                        >
                          <Paperclip size={14} />
                          View Your Submitted File
                        </a>
                      </div>
                    )}
                    
                    {submission.feedback && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-bold text-blue-900 mb-1">Teacher's Feedback:</p>
                        <p className="text-sm text-blue-800">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {submittingAssignment && (
        <Modal
          isOpen={!!submittingAssignment}
          onClose={() => setSubmittingAssignment(null)}
          title={`Submit: ${submittingAssignment.title}`}
        >
          <SubmissionForm
            assignment={submittingAssignment}
            onCheckCompletion={() => {
              setSubmittingAssignment(null);
              fetchAssignments();
            }}
            onCancel={() => setSubmittingAssignment(null)}
          />
        </Modal>
      )}

      {/* Quiz Modal */}
      {takingQuizSubject && (
        <Modal
          isOpen={!!takingQuizSubject}
          onClose={() => setTakingQuizSubject(null)}
          title={`Quiz: ${takingQuizSubject.name}`}
        >
          <QuizTakingView
             subjectId={takingQuizSubject.id}
             subjectName={takingQuizSubject.name}
             onClose={() => setTakingQuizSubject(null)}
          />
        </Modal>
      )}
    </div>
  );
}

// Submission Form Component
function SubmissionForm({ assignment, onCheckCompletion, onCancel }: {
  assignment: Assignment;
  onCheckCompletion: () => void;
  onCancel: () => void;
}) {
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('content', content);
      if (attachment) {
        data.append('attachment', attachment);
      }

      await api.post(`/student/homework/${assignment.id}/submit`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success("Assignment submitted successfully");
      onCheckCompletion();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <h4 className="font-bold text-gray-900 mb-2">{assignment.title}</h4>
        {assignment.description && (
          <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
          <span>Max Marks: {assignment.maxMarks}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Your Submission</label>
        <textarea
          required
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your assignment answer here..."
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <FileUploader onFileSelect={setAttachment} label="Upload Your Solution (Optional)" />

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
          {loading ? 'Submitting...' : 'Submit Assignment'}
        </button>
      </div>
    </form>
  );
}
