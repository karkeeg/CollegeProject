import { useState, useEffect } from 'react';
import api from '../../lib/api';
import clsx from 'clsx';

interface Semester {
    id: number;
    name: string;
    programId?: number;
}

interface Program {
    id: number;
    code: string;
    name: string;
}

interface SemesterSelectorProps {
    selectedProgramId: string | number;
    selectedSemesterId: string | number;
    onProgramChange: (id: string) => void;
    onSemesterChange: (id: string) => void;
    className?: string;
    labelClassName?: string;
    required?: boolean;
    showProgramSelect?: boolean;
    stacked?: boolean;
    placeholderProgram?: string;
    placeholderSemester?: string;
}

export default function SemesterSelector({
    selectedProgramId,
    selectedSemesterId,
    onProgramChange,
    onSemesterChange,
    className,
    labelClassName = "block text-sm font-bold text-gray-700 mb-1",
    required = true,
    showProgramSelect = true,
    stacked = true,
    placeholderProgram = "Select Program",
    placeholderSemester = "Select Semester"
}: SemesterSelectorProps) {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [semesters, setSemesters] = useState<Semester[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [progRes, semRes] = await Promise.all([
                    api.get('/programs'),
                    api.get('/semesters')
                ]);
                setPrograms(progRes.data);
                setSemesters(semRes.data);
            } catch (error) {
                console.error('Error fetching semester data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredSemesters = semesters.filter(sem => 
        !selectedProgramId || 
        sem.programId === null || 
        sem.programId === undefined ||
        String(sem.programId) === String(selectedProgramId)
    );

    const containerClasses = clsx(
        "grid gap-4",
        stacked ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2",
        className
    );

    if (loading) return <div className="h-10 flex items-center text-xs text-gray-400 animate-pulse bg-gray-50 rounded-xl px-4">Loading selector...</div>;

    return (
        <div className={containerClasses}>
            {showProgramSelect && (
                <div>
                    <label className={labelClassName}>Academic Program</label>
                    <select
                        required={required}
                        value={selectedProgramId}
                        onChange={(e) => {
                            onProgramChange(e.target.value);
                            // REMOVED sequential call to onSemesterChange('') to prevent race conditions in parent state
                        }}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-sm"
                    >
                        <option value="">{placeholderProgram}</option>
                        {programs.map(prog => (
                            <option key={prog.id} value={prog.id}>{prog.code} - {prog.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label className={labelClassName}>Semester</label>
                <select
                    required={required}
                    value={selectedSemesterId}
                    onChange={(e) => onSemesterChange(e.target.value)}
                    disabled={showProgramSelect && !selectedProgramId && required}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50 font-medium text-sm"
                >
                    <option value="">{placeholderSemester}</option>
                    {filteredSemesters.map(sem => (
                        <option key={sem.id} value={sem.id}>{sem.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
