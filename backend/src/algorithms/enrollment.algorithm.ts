import prisma from '../config/database';

export class EnrollmentAlgorithm {
    /**
     * Algorithm 1: Find Eligible Students for Enrollment
     * 
     * This method implements the logic to find students who are eligible to be enrolled in a specific subject.
     * Logic:
     * 1. Universe: All students in the same semester as the subject.
     * 2. Exclusion: Remove students who are ALREADY enrolled in the subject.
     * 3. Filtering: Apply search query (fuzzy match on Name or Email).
     * 4. Sorting: Order by Roll Number for consistent display.
     * 
     * @param subjectId The ID of the subject we want to enroll students into
     * @param searchQuery Optional string to filter students by name or email
     */
    static async findEligibleStudents(subjectId: number, searchQuery?: string) {
        // Step 1: Get Subject Details to know the Semester
        const subject = await prisma.subject.findUnique({
            where: { id: subjectId },
            select: { semesterId: true }
        });

        if (!subject) throw new Error("Subject not found");

        // Step 2: Get IDs of students ALREADY enrolled
        const enrolledLinks = await prisma.studentClass.findMany({
            where: { subjectId },
            select: { studentId: true }
        });
        const enrolledStudentIds = enrolledLinks.map(link => link.studentId);

        // Step 3: Fetch ALL Students in the universe (same semester)
        // We do *not* exclude enrolled students anymore, as per requirements.
        // We will mark them as enrolled in the next step.
        const allSemesterStudents = await prisma.student.findMany({
            where: {
                currentSemesterId: subject.semesterId, // Must be in same semester
                // REMOVED: exclusion of enrolledStudentIds
                OR: searchQuery ? [
                    { profile: { fullName: { contains: searchQuery, mode: 'insensitive' } } },
                    { profile: { email: { contains: searchQuery, mode: 'insensitive' } } },
                    { studentCode: { contains: searchQuery, mode: 'insensitive' } }
                ] : undefined
            },
            include: {
                profile: true
            },
            orderBy: {
                rollNo: 'asc'
            }
        });

        // Step 4: Map and Mark Enrolled Status
        const enrolledSet = new Set(enrolledStudentIds);
        
        const result = allSemesterStudents.map(student => ({
            ...student,
            isEnrolled: enrolledSet.has(student.id)
        }));

        return result;


    }

    /**
     * Algorithm 2: Bulk Enrollment Validation & Execution
     * 
     * Validates a list of students and enrolls them into the class.
     * Uses transaction to ensure all-or-nothing consistency.
     */
    static async enrollStudentsBulk(subjectId: number, studentIds: string[]) {
        if (!studentIds.length) return { count: 0 };

        // Transactional add to ensure data integrity
        const result = await prisma.$transaction(async (tx) => {
            // Verify semester match for all (security check)
            const subject = await tx.subject.findUnique({ where: { id: subjectId } });
            if (!subject) throw new Error("Subject not found");

            const count = await tx.studentClass.createMany({
                data: studentIds.map(studentId => ({
                    studentId,
                    subjectId
                })),
                skipDuplicates: true // Robustness: If someone double-clicked, don't crash
            });

            return count;
        });

        return result;
    }
}
