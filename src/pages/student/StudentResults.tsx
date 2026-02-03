import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Award, ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import clsx from 'clsx';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface Result {
  subjectName: string;
  code: string;
  creditHours: number;
  internal: number;
  practical: number;
  final: number;
  total: number;
  grade: string;
}

export default function StudentResults() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Result[]>([]);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    setLoading(true);
    try {
      const [profileRes, marksRes] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/marks')
      ]);

      setStudentInfo(profileRes.data);

      const formatted = marksRes.data.map((item: any) => ({
          subjectName: item.subject?.name,
          code: item.subject?.code,
          creditHours: item.subject?.creditHours,
          internal: item.internalMarks,
          practical: item.practicalMarks,
          final: item.finalMarks,
          total: (item.internalMarks || 0) + (item.practicalMarks || 0) + (item.finalMarks || 0),
          grade: item.gradeLetter
      }));
      setResults(formatted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const calculateGPA = () => {
      let totalPoints = 0;
      let totalCredits = 0;

      const gradePoints: Record<string, number> = {
          'A+': 4.0, 'A': 3.7, 'B+': 3.3, 'B': 3.0, 'C+': 2.7, 'C': 2.4, 'F': 0
      };

      results.forEach(r => {
          const pt = gradePoints[r.grade] || 0;
          totalPoints += pt * r.creditHours;
          totalCredits += r.creditHours;
      });

      return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("UNIVERSITY COLLEGE", 105, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text("Academic Grade Sheet", 105, 25, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Name: ${studentInfo?.profile?.fullName}`, 15, 45);
    doc.text(`Roll No: ${studentInfo?.rollNo}`, 15, 52);
    doc.text(`Semester: ${studentInfo?.semester?.name}`, 140, 45);
    doc.text(`GPA: ${calculateGPA()}`, 140, 52);

    autoTable(doc, {
        startY: 65,
        head: [['Code', 'Subject', 'Cr.', 'Grade']],
        body: results.map(r => [r.code, r.subjectName, r.creditHours.toString(), r.grade]),
        styles: { fontSize: 9 },
        headStyles: {  textColor: 50 },
    });

    doc.save(`Marksheet_${studentInfo?.studentCode}.pdf`);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <button 
                onClick={() => navigate('/student')}
                className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium mb-2 transition"
            >
                <ArrowLeft size={16} /> Back to Dashboard
            </button>  
            <h1 className="text-2xl font-bold text-gray-900">
                My Results
            </h1>
        </div>
        <button 
           onClick={downloadPDF}
           disabled={loading || results.length === 0}
           className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-gray-200"
        >
            <Download size={18} /> Download Marksheet
        </button>
      </div>

      {loading ? (
          <div className="flex justify-center p-12">
              <LoadingSpinner />
          </div>
      ) : results.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-gray-200 shadow-sm">
              <Award size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">No results published yet.</p>
          </div>
      ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
             <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                 <span className="font-bold text-gray-600 text-xs uppercase tracking-widest">Transcript View</span>
                 <span className="font-black text-gray-900 bg-white px-4 py-1.5 rounded-lg shadow-sm border border-gray-100">SGPA: {calculateGPA()}</span>
             </div>
             <table className="w-full text-left text-sm">
                <thead className="bg-white text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4 text-center">Cr.</th>
                    <th className="px-6 py-4 text-center">Int.</th>
                    <th className="px-6 py-4 text-center">Prac.</th>
                    <th className="px-6 py-4 text-center">Final</th>
                    <th className="px-6 py-4 text-center">Total</th>
                    <th className="px-6 py-4 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {results.map((res) => (
                       <tr key={res.code} className="hover:bg-gray-50 transition-colors">
                           <td className="px-6 py-4 font-mono text-gray-400 text-xs">{res.code}</td>
                           <td className="px-6 py-4 font-bold text-gray-900">{res.subjectName}</td>
                           <td className="px-6 py-4 text-center text-gray-500">{res.creditHours}</td>
                           <td className="px-6 py-4 text-center text-gray-400">{res.internal}</td>
                           <td className="px-6 py-4 text-center text-gray-400">{res.practical}</td>
                           <td className="px-6 py-4 text-center text-gray-400">{res.final}</td>
                           <td className="px-6 py-4 text-center font-black text-gray-700">{res.total}</td>
                           <td className="px-6 py-4 text-center">
                               <span className={clsx(
                                   "px-2 py-1 rounded text-[10px] font-black inline-block w-8",
                                   res.grade === 'F' ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"
                               )}>
                                   {res.grade}
                               </span>
                           </td>
                       </tr>
                   ))}
                </tbody>
             </table>
          </div>
      )}
    </div>
  );
}
