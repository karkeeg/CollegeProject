import prisma from '../config/database';
import { hashPassword } from '../services/auth.service';

export class CsvImportAlgorithm {
    
    /**
     * Parse raw CSV string into array of objects.
     * Assumes logical header row and comma separation.
     */
    private static parseCsv(csvString: string): any[] {
        const lines = csvString.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]+/g, ''));
        const results = [];

        for (let i = 1; i < lines.length; i++) {
            // Basic split by comma, handling potential extra spaces
            const currentLine = lines[i].split(',').map(field => field.trim().replace(/^"|"$/g, ''));
            
            if (currentLine.length === headers.length) {
                const obj: any = {};
                headers.forEach((header, index) => {
                    obj[header] = currentLine[index];
                });
                results.push(obj);
            }
        }
        return results;
    }

    static async importStudents(csvData: string) {
        const rows = this.parseCsv(csvData);
        if (rows.length === 0) throw new Error("No data found in CSV");

        // Validate Headers - Strict Requirement for Students onboarding
        const required = ['fullname', 'email', 'studentcode', 'semestername', 'programcode'];
        const firstRowKeys = Object.keys(rows[0]);
        const missing = required.filter(r => !firstRowKeys.includes(r));
        
        if (missing.length > 0) {
            throw new Error(`Missing mandatory columns: ${missing.join(', ')}`);
        }

        const defaultPassword = await hashPassword("Student@123");
        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        for (const row of rows) {
            try {
                // 1. Resolve Dependencies (Mandatory for students in this algo)
                const program = await prisma.program.findUnique({
                    where: { code: row.programcode }
                });
                if (!program) throw new Error(`Program '${row.programcode}' not found`);

                const semester = await prisma.semester.findFirst({
                    where: { 
                        programId: program.id,
                        name: { equals: row.semestername, mode: 'insensitive' }
                    }
                });
                if (!semester) throw new Error(`Semester '${row.semestername}' not found in ${program.code}`);

                // 2. Check duplicates (Email & StudentCode)
                const existing = await prisma.profile.findFirst({
                    where: { 
                        OR: [
                           { email: row.email },
                           { student: { studentCode: row.studentcode } }
                        ]
                    }
                });
                if (existing) throw new Error(`Conflict: ${row.studentcode} or ${row.email} already exists`);

                // 3. Create Profile + Student
                await prisma.profile.create({
                    data: {
                        email: row.email,
                        password: defaultPassword,
                        fullName: row.fullname,
                        role: 'STUDENT',
                        student: {
                            create: {
                                studentCode: row.studentcode,
                                rollNo: row.rollno ? parseInt(row.rollno) : null,
                                regNo: row.regno || null,
                                semesterId: semester.id,
                                programId: program.id,
                                phone: row.phone || null,
                                address: row.address || null,
                                dob: row.dob ? new Date(row.dob) : null
                            }
                        }
                    }
                });
                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push(`Row ${row.studentcode || 'Unknown'}: ${error.message}`);
            }
        }

        return results;
    }

    static async importTeachers(csvData: string) {
        const rows = this.parseCsv(csvData);
        if (rows.length === 0) throw new Error("No data found in CSV");

        // Teacher mandatory fields are simpler
        const required = ['fullname', 'email', 'employeeid'];
        const firstRowKeys = Object.keys(rows[0]);
        const missing = required.filter(r => !firstRowKeys.includes(r));
        if (missing.length > 0) throw new Error(`Missing mandatory columns: ${missing.join(', ')}`);

        const defaultPassword = await hashPassword("Teacher@123");
        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        for (const row of rows) {
            try {
                // 1. Resolve Optional Program
                let programId: number | undefined = undefined;
                if (row.programcode) {
                    const program = await prisma.program.findUnique({
                        where: { code: row.programcode }
                    });
                    if (program) programId = program.id;
                }

                // 2. Check duplicates (Email & EmployeeId)
                const existing = await prisma.profile.findFirst({
                    where: { 
                        OR: [
                           { email: row.email },
                           { teacher: { employeeId: row.employeeid } }
                        ]
                    }
                });
                if (existing) throw new Error(`Conflict: ${row.employeeid} or ${row.email} already exists`);

                // 3. Create Profile + Teacher
                await prisma.profile.create({
                    data: {
                        email: row.email,
                        password: defaultPassword,
                        fullName: row.fullname,
                        role: 'TEACHER',
                        teacher: {
                            create: {
                                employeeId: row.employeeid,
                                department: row.department || null,
                                qualification: row.qualification || null,
                                programId: programId
                            }
                        }
                    }
                });
                results.success++;
            } catch (error: any) {
                results.failed++;
                results.errors.push(`Row ${row.employeeid || 'Unknown'}: ${error.message}`);
            }
        }

        return results;
    }
}
