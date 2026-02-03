import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Search, Trash2, Edit, Eye } from 'lucide-react';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Assignment {
  id: number;
  title: string;
  description: string | null;
  dueDate: string;
  maxMarks: number;
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
  }>;
}

interface Subject {
  id: number;
  code: string;
  name: string;
}

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [viewingSubmissions, setViewingSubmissions] = useState<Assignment | null>(null);

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

  const handleDelete = async () => {
    if (!assignmentToDelete) return;

    try {
      await api.delete(`/teacher/homework/${assignmentToDelete.id}`);
      setAssignments(prev => prev.filter(a => a.id !== assignmentToDelete.id));
      toast.success("Assignment deleted successfully");
    } catch (err: any) {
      toast.error("Failed to delete assignment: " + (err.response?.data?.error || err.message));
    } finally {
      setAssignmentToDelete(null);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingAssignment(null);
    setIsFormOpen(true);
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

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Create Assignment
        </button>
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
                      <td className="px-6 py-4 font-bold text-gray-900">{assignment.title}</td>
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
                            onClick={() => setViewingSubmissions(assignment)}
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
                            onClick={() => setAssignmentToDelete(assignment)}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingAssignment ? "Edit Assignment" : "Create New Assignment"}
      >
        <AssignmentForm
          initialData={editingAssignment}
          subjects={subjects}
          onCheckCompletion={() => {
            setIsFormOpen(false);
            fetchAssignments();
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Submissions Modal */}
      {viewingSubmissions && (
        <Modal
          isOpen={!!viewingSubmissions}
          onClose={() => setViewingSubmissions(null)}
          title={`Submissions: ${viewingSubmissions.title}`}
        >
          <SubmissionView
            assignmentId={viewingSubmissions.id}
            maxMarks={viewingSubmissions.maxMarks}
            onClose={() => setViewingSubmissions(null)}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {assignmentToDelete && (
        <Modal isOpen={!!assignmentToDelete} onClose={() => setAssignmentToDelete(null)} title="Delete Assignment">
          <div className="p-4">
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{assignmentToDelete.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setAssignmentToDelete(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold shadow-lg shadow-red-200">Delete Permanently</button>
            </div>
          </div>
        </Modal>
      )}
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
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        subjectId: parseInt(formData.subjectId),
        dueDate: new Date(formData.dueDate).toISOString(),
        maxMarks: parseInt(formData.maxMarks)
      };

      if (initialData) {
        await api.put(`/teacher/homework/${initialData.id}`, payload);
        toast.success("Assignment updated successfully");
      } else {
        await api.post('/teacher/homework', payload);
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
function SubmissionView({ assignmentId, maxMarks }: {
  assignmentId: number;
  maxMarks: number;
  onClose: () => void;
}) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);

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
      setGradingSubmission(null);
    } catch (error) {
      toast.error("Failed to grade submission");
    }
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
                onClick={() => setGradingSubmission(submission)}
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold text-sm"
              >
                Grade
              </button>
            )}
          </div>
          
          <div className="mb-3">
            <p className="text-sm font-bold text-gray-700 mb-1">Submission:</p>
            <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">{submission.content}</p>
          </div>

          {submission.feedback && (
            <div>
              <p className="text-sm font-bold text-gray-700 mb-1">Feedback:</p>
              <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">{submission.feedback}</p>
            </div>
          )}
        </div>
      ))}

      {/* Grading Modal */}
      {gradingSubmission && (
        <Modal
          isOpen={!!gradingSubmission}
          onClose={() => setGradingSubmission(null)}
          title="Grade Submission"
        >
          <GradingForm
            submission={gradingSubmission}
            maxMarks={maxMarks}
            onGrade={handleGrade}
            onCancel={() => setGradingSubmission(null)}
          />
        </Modal>
      )}
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
