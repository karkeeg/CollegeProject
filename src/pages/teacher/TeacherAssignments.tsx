import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Search, Trash2, Edit, Eye, Paperclip, BrainCircuit } from 'lucide-react';
import FileUploader from '../../components/ui/FileUploader';
import QuizGeneratorModal from '../../components/teacher/QuizGeneratorModal';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useModal } from '../../hooks/useModal';

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
    semester: {
      name: string;
    };
  };
  submissions: Array<{
    id: number;
    studentId: string;
    submittedAt: string;
    marksObtained: number | null;
    attachmentUrl: string | null;
  }>;
}

interface Subject {
  id: number;
  code: string;
  name: string;
}

export default function TeacherAssignments() {
  const { openModal, closeModal } = useModal();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssignments();
    fetchSubjects();
  }, []);

  async function fetchSubjects() {
    try {
      const { data } = await api.get('/teacher/assignments');
      // Extract unique subjects from assignments
      const uniqueSubjects = data.reduce((acc: Subject[], assignment: Assignment) => {
        if (!acc.find(s => s.id === assignment.subject.id)) {
          acc.push({
            id: assignment.subject.id,
            code: assignment.subject.code,
            name: assignment.subject.name
          });
        }
        return acc;
      }, []);
      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }

  async function fetchAssignments() {
    setLoading(true);
    try {
      const { data } = await api.get('/teacher/homework');
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/teacher/homework/${id}`);
      setAssignments(prev => prev.filter(a => a.id !== id));
      toast.success("Assignment deleted successfully");
      closeModal();
    } catch (err: any) {
      toast.error("Failed to delete assignment: " + (err.response?.data?.error || err.message));
    }
  };

  const handleConfirmDelete = (assignment: Assignment) => {
    openModal(
      <div className="p-4">
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{assignment.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium">Cancel</button>
          <button onClick={() => handleDelete(assignment.id)} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-lg shadow-red-200">Delete Permanently</button>
        </div>
      </div>,
      { title: "Delete Assignment", size: "sm" }
    );
  };

  const handleEdit = (assignment: Assignment) => {
    openModal(
      <AssignmentForm
        initialData={assignment}
        subjects={subjects}
        onCheckCompletion={() => {
          closeModal();
          fetchAssignments();
        }}
        onCancel={closeModal}
      />,
      { title: "Edit Assignment", size: "2xl" }
    );
  };

  const handleAdd = () => {
    openModal(
      <AssignmentForm
        initialData={null}
        subjects={subjects}
        onCheckCompletion={() => {
          closeModal();
          fetchAssignments();
        }}
        onCancel={closeModal}
      />,
      { title: "Create New Assignment", size: "2xl" }
    );
  };

  const handleViewSubmissions = (assignment: Assignment) => {
    openModal(
      <SubmissionView
        assignmentId={assignment.id}
        maxMarks={assignment.maxMarks}
        assignmentTitle={assignment.title}
      />,
      { title: `Submissions: ${assignment.title}`, size: "3xl" }
    );
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.subject.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubmissionStats = (assignment: Assignment) => {
    const total = assignment.submissions.length;
    const graded = assignment.submissions.filter(s => s.marksObtained !== null).length;
    return { total, graded };
  };

  const handleOpenQuizModal = () => {
    openModal(
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Select a Subject</h3>
        <div className="grid gap-2">
          {subjects.map(sub => (
            <button
              key={sub.id}
              onClick={() => {
                openModal(
                  <QuizGeneratorModal 
                    subjectId={sub.id}
                    subjectName={sub.name}
                    onClose={closeModal}
                    onSuccess={() => {
                      closeModal();
                    }}
                  />,
                  { title: "Generate Quiz", size: "4xl" }
                );
              }}
              className="p-4 text-left border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition font-medium text-gray-700"
            >
              {sub.code} - {sub.name}
            </button>
          ))}
        </div>
        {subjects.length === 0 && <p className="text-gray-500">No subjects assigned.</p>}
      </div>,
      { title: "Select Subject for AI Quiz", size: "md" }
    );
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <div className="flex gap-3">
          <button
            onClick={handleOpenQuizModal}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-purple-700 transition font-bold shadow-lg shadow-purple-200"
          >
            <BrainCircuit size={20} />
            AI Quiz
          </button>
          <button
            onClick={handleAdd}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            Create Assignment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search assignments..."
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
                <th className="px-6 py-4 border-b border-gray-200">Subject</th>
                <th className="px-6 py-4 border-b border-gray-200">Due Date</th>
                <th className="px-6 py-4 border-b border-gray-200">Max Marks</th>
                <th className="px-6 py-4 border-b border-gray-200">Submissions</th>
                <th className="px-6 py-4 border-b border-gray-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 flex justify-center w-full"><LoadingSpinner /></td></tr>
              ) : filteredAssignments.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No assignments found.</td></tr>
              ) : (
                filteredAssignments.map((assignment) => {
                  const stats = getSubmissionStats(assignment);
                  const isOverdue = new Date(assignment.dueDate) < new Date();
                  
                  return (
                    <tr key={assignment.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{assignment.title}</div>
                        {assignment.attachmentUrl && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-indigo-600 font-medium">
                            <Paperclip size={12} />
                            <a 
                              href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${assignment.attachmentUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              Material Attached
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[10px] font-bold uppercase">
                          {assignment.subject.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${isOverdue ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{assignment.maxMarks}</td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700">
                          {stats.graded}/{stats.total} graded
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleViewSubmissions(assignment)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="View Submissions"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(assignment)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleConfirmDelete(assignment)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// Assignment Form Component
function AssignmentForm({ initialData, subjects, onCheckCompletion, onCancel }: {
  initialData: Assignment | null;
  subjects: Subject[];
  onCheckCompletion: () => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    subjectId: initialData?.subject.id.toString() || '',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
    maxMarks: initialData?.maxMarks.toString() || '100'
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
      data.append('description', formData.description || '');
      data.append('subjectId', formData.subjectId);
      data.append('dueDate', new Date(formData.dueDate).toISOString());
      data.append('maxMarks', formData.maxMarks);
      if (attachment) {
        data.append('attachment', attachment);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (initialData) {
        await api.put(`/teacher/homework/${initialData.id}`, data, config);
        toast.success("Assignment updated successfully");
      } else {
        await api.post('/teacher/homework', data, config);
        toast.success("Assignment created successfully");
      }
      onCheckCompletion();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save assignment");
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
        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
        <select
          name="subjectId"
          required
          value={formData.subjectId}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        >
          <option value="">Select Subject</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.code} - {subject.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Due Date</label>
          <input
            name="dueDate"
            type="date"
            required
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Max Marks</label>
          <input
            name="maxMarks"
            type="number"
            required
            min="1"
            value={formData.maxMarks}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <FileUploader onFileSelect={setAttachment} label="Assignment Material (Optional)" />

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
          {loading ? 'Saving...' : (initialData ? 'Update Assignment' : 'Create Assignment')}
        </button>
      </div>
    </form>
  );
}

// Submission View Component
function SubmissionView({ assignmentId, maxMarks, assignmentTitle }: {
  assignmentId: number;
  maxMarks: number;
  assignmentTitle: string;
}) {
  const { openModal, closeModal } = useModal();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  async function fetchSubmissions() {
    setLoading(true);
    try {
      const { data } = await api.get(`/teacher/homework/${assignmentId}/submissions`);
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }

  const handleGrade = async (submissionId: number, marksObtained: number, feedback: string) => {
    try {
      await api.put(`/teacher/submissions/${submissionId}/grade`, {
        marksObtained,
        feedback
      });
      toast.success("Graded successfully");
      fetchSubmissions();
    } catch (error) {
      toast.error("Failed to grade submission");
    }
  };

  const handleOpenGradeModal = (submission: any) => {
    openModal(
      <GradingForm
        submission={submission}
        maxMarks={maxMarks}
        onGrade={(sid: number, marks: number, feed: string) => {
          handleGrade(sid, marks, feed);
          // Re-open submissions view after grading? Or just close all?
          // Actually, we can just open the grading modal, it will replace the submissions modal content.
          // But when we close it, we might want to see submissions again.
          // The global modal system currently only supports one modal at a time.
          // Let's just refetch and re-open the submissions view.
          setTimeout(() => {
             openModal(
               <SubmissionView assignmentId={assignmentId} maxMarks={maxMarks} assignmentTitle={assignmentTitle} />,
               { title: `Submissions: ${assignmentTitle}`, size: "3xl" }
             );
          }, 500);
        }}
        onCancel={() => {
          // Re-open submissions view
          openModal(
            <SubmissionView assignmentId={assignmentId} maxMarks={maxMarks} assignmentTitle={assignmentTitle} />,
            { title: `Submissions: ${assignmentTitle}`, size: "3xl" }
          );
        }}
      />,
      { title: "Grade Submission", size: "md" }
    );
  };

  if (loading) {
    return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  }

  if (submissions.length === 0) {
    return <div className="p-8 text-center text-gray-500">No submissions yet.</div>;
  }

  return (
    <div className="space-y-4">
      {submissions.map(submission => (
        <div key={submission.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-gray-900">{submission.student.profile.fullName}</h4>
              <p className="text-sm text-gray-500">
                Submitted: {new Date(submission.submittedAt).toLocaleString()}
              </p>
            </div>
            {submission.marksObtained !== null ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-bold">
                {submission.marksObtained}/{maxMarks}
              </span>
            ) : (
              <button
                onClick={() => handleOpenGradeModal(submission)}
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-sm"
              >
                Grade
              </button>
            )}
          </div>
          
          <div className="mb-3">
            <p className="text-sm font-bold text-gray-700 mb-1">Submission:</p>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">{submission.content}</p>
              {submission.attachmentUrl && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <a 
                    href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${submission.attachmentUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1 rounded transition"
                  >
                    <Paperclip size={14} />
                    View Submitted File
                  </a>
                </div>
              )}
            </div>
          </div>

          {submission.feedback && (
            <div>
              <p className="text-sm font-bold text-gray-700 mb-1">Feedback:</p>
              <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">{submission.feedback}</p>
            </div>
          )}
        </div>
      ))}

    </div>
  );
}

// Grading Form Component
function GradingForm({ submission, maxMarks, onGrade, onCancel }: any) {
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGrade(submission.id, parseFloat(marks), feedback);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Marks Obtained (out of {maxMarks})</label>
        <input
          type="number"
          required
          min="0"
          max={maxMarks}
          step="0.5"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Feedback (Optional)</label>
        <textarea
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

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
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
        >
          Submit Grade
        </button>
      </div>
    </form>
  );
}
