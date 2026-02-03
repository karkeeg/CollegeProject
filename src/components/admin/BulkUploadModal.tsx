import { useState } from 'react';
import { Upload,  AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import api from '../../lib/api';
import Modal from '../Modal';
import toast from 'react-hot-toast';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: 'students' | 'teachers';
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess, type }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; message: string } | null>(null);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const requiredColumns = type === 'students' 
    ? ['fullname', 'email', 'studentcode', 'semestername', 'programcode']
    : ['fullname', 'email', 'employeeid'];

  const validateCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return { isValid: false, message: 'CSV must have at least one data row' };

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]+/g, ''));
    const missing = requiredColumns.filter(col => !headers.includes(col));

    if (missing.length > 0) {
      return { isValid: false, message: `Missing columns: ${missing.join(', ')}` };
    }

    // Check for duplicates within the CSV
    const emailIndex = headers.indexOf('email');
    const idKey = type === 'students' ? 'studentcode' : 'employeeid';
    const idIndex = headers.indexOf(idKey);

    const emails = new Set();
    const ids = new Set();

    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(f => f.trim().replace(/^"|"$/g, ''));
        if (row.length < headers.length) continue;

        const email = row[emailIndex]?.toLowerCase();
        const id = row[idIndex]?.toLowerCase();

        if (email && emails.has(email)) {
            return { isValid: false, message: `Duplicate email found in CSV: ${email}` };
        }
        if (id && ids.has(id)) {
            return { isValid: false, message: `Duplicate ${idKey} found in CSV: ${id}` };
        }

        if (email) emails.add(email);
        if (id) ids.add(id);
    }

    return { isValid: true, message: `${lines.length - 1} rows ready for import!` };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setResults(null);
      
      const reader = new FileReader();
      reader.onload = (re) => {
        const text = re.target?.result as string;
        setValidation(validateCSV(text));
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !validation?.isValid) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        try {
          const { data } = await api.post(`/admin/import/${type}`, { csvData: text });
          setResults(data);
          if (data.success > 0) {
            toast.success(`Imported ${data.success} ${type}`);
            onSuccess();
          }
          if (data.failed > 0) {
            toast.error(`Failed: ${data.failed} entries`);
          }
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Failed to process CSV');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      toast.error('Failed to read file');
      setLoading(false);
    }
  };

  const sampleColumns = type === 'students' 
    ? 'FullName, Email, StudentCode, RollNo, RegNo, SemesterName, ProgramCode'
    : 'FullName, Email, EmployeeId, Department, Qualification, ProgramCode';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bulk Import ${type === 'students' ? 'Students' : 'Teachers'}`}
    >
      <div className="space-y-4">
        {!results ? (
          <>
            <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg text-[11px] text-blue-800 leading-relaxed">
              <p className="font-bold mb-1">Required Columns:</p>
              <code className="text-[10px] break-all bg-white/70 px-2 py-0.5 rounded border border-blue-200 block font-mono">
                {sampleColumns}
              </code>
            </div>

            <div 
              className={`relative border-2 border-dashed rounded-xl p-6 transition-all flex flex-col items-center justify-center gap-2 ${
                file ? (validation?.isValid ? 'border-green-300 bg-green-50/20' : 'border-red-300 bg-red-50/20') : 'border-gray-200 hover:border-indigo-300 hover:bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className={`p-2.5 rounded-full ${file ? (validation?.isValid ? 'text-green-500 bg-green-100' : 'text-red-500 bg-red-100') : 'text-gray-300 bg-gray-50'}`}>
                {file ? (validation?.isValid ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />) : <Upload size={24} />}
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-700 text-xs">
                  {file ? file.name : `Select CSV File`}
                </p>
                {validation && (
                  <p className={`text-[10px] font-medium mt-1 ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validation.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || !validation?.isValid || loading}
                className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50 disabled:grayscale flex items-center gap-2"
              >
                {loading ? 'Submitting...' : `Start Import`}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-100 p-3 rounded-lg text-center">
                <p className="text-xl font-black text-green-600">{results.success}</p>
                <p className="text-[10px] font-bold text-green-800 uppercase tracking-tight">Success</p>
              </div>
              <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-center">
                <p className="text-xl font-black text-red-600">{results.failed}</p>
                <p className="text-[10px] font-bold text-red-800 uppercase tracking-tight">Failed</p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                    <AlertCircle size={12} className="text-red-500" />
                    Details
                  </span>
                  <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
                    {results.errors.length} Errors
                  </span>
                </div>
                <div className="max-h-32 overflow-y-auto p-3 space-y-1">
                  {results.errors.map((err, idx) => (
                    <div key={idx} className="flex gap-2 text-[10px] text-gray-600 leading-snug">
                      <ChevronRight size={12} className="shrink-0 text-red-300 mt-0.5" />
                      {err}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={results.failed === 0 ? onClose : () => { setResults(null); setFile(null); setValidation(null); }}
              className="w-full py-2.5 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-lg transition"
            >
              {results.failed === 0 ? 'Done' : 'Restart'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

