import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword } from '../services/auth.service';

// Students CRUD
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        profile: true,
        semester: true,
        program: true,
      },
      orderBy: { rollNo: 'asc' },
    });
    return res.json(students);
  } catch (error) {
    console.error('Get all students error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, studentCode, rollNo, regNo, currentSemesterId, programId, phone, address, dob } = req.body;

    if (!email || !password || !studentCode) {
      return res.status(400).json({ error: 'Email, password, and student code are required' });
    }

    const hashedPassword = await hashPassword(password);

    const student = await prisma.profile.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: 'STUDENT',
        student: {
          create: {
            studentCode,
            rollNo: rollNo ? parseInt(rollNo) : null,
            regNo,
            semester: currentSemesterId ? { connect: { id: parseInt(currentSemesterId) } } : undefined,
            program: programId ? { connect: { id: parseInt(programId) } } : undefined,
            phone,
            address,
            dob: dob ? new Date(dob) : null,
          },
        },
      },
      include: {
        student: true,
      },
    });

    return res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { fullName, rollNo, regNo, currentSemesterId, programId, phone, address, dob } = req.body;

    const student = await prisma.student.update({
      where: { id },
      data: {
        rollNo: rollNo ? parseInt(rollNo) : undefined,
        regNo,
        semester: currentSemesterId ? { connect: { id: parseInt(currentSemesterId) } } : undefined,
        program: (programId ? { connect: { id: parseInt(programId) } } : undefined) as any,
        phone,
        address,
        dob: dob ? new Date(dob) : undefined,
        profile: {
          update: {
            fullName,
          },
        },
      } as any,
      include: {
        profile: true,
        semester: true,
        program: true,
      } as any,
    });

    return res.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    await prisma.profile.delete({
      where: { id },
    });

    return res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const importStudents = async (req: Request, res: Response) => {
    try {
        const { csvData } = req.body;
        if (!csvData) return res.status(400).json({ error: 'No CSV data provided' });

        const results = await import('../algorithms/csv-import.algorithm').then(m => m.CsvImportAlgorithm.importStudents(csvData));
        return res.json(results);
    } catch (error: any) {
        console.error('Import students error:', error);
        return res.status(400).json({ error: error.message });
    }
};

export const importTeachers = async (req: Request, res: Response) => {
    try {
        const { csvData } = req.body;
        if (!csvData) return res.status(400).json({ error: 'No CSV data provided' });

        const results = await import('../algorithms/csv-import.algorithm').then(m => m.CsvImportAlgorithm.importTeachers(csvData));
        return res.json(results);
    } catch (error: any) {
        console.error('Import teachers error:', error);
        return res.status(400).json({ error: error.message });
    }
};

// Teachers CRUD
export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        profile: true,
        program: true,
      },
    });
    return res.json(teachers);
  } catch (error) {
    console.error('Get all teachers error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, employeeId, department, programId, qualification } = req.body;

    if (!email || !password || !employeeId) {
      return res.status(400).json({ error: 'Email, password, and employee ID are required' });
    }

    const hashedPassword = await hashPassword(password);

    const teacher = await prisma.profile.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: 'TEACHER',
        teacher: {
          create: {
            employeeId,
            department,
            qualification,
            program: programId ? { connect: { id: parseInt(programId) } } : undefined,
          },
        },
      },
      include: {
        teacher: true,
      },
    });

    return res.status(201).json(teacher);
  } catch (error) {
    console.error('Create teacher error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { fullName, department, programId, qualification } = req.body;

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        department,
        qualification,
        program: programId ? { connect: { id: parseInt(programId) } } : (programId === null ? { disconnect: true } : undefined),
        profile: {
          update: {
            fullName,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return res.json(teacher);
  } catch (error) {
    console.error('Update teacher error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    await prisma.profile.delete({
      where: { id },
    });

    return res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Subjects CRUD
export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        semester: true,
        assignments: {
          include: {
            teacher: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return res.json(subjects);
  } catch (error) {
    console.error('Get all subjects error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, code, semesterId, creditHours, teacherId } = req.body;

    if (!name || !code || !semesterId) {
      return res.status(400).json({ error: 'Name, code, and semester are required' });
    }

    const currentYear = new Date().getFullYear();

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        semesterId: parseInt(semesterId),
        creditHours: creditHours ? parseInt(creditHours) : 3,
        assignments: teacherId ? {
          create: {
            teacherId,
            academicYear: currentYear,
          },
        } : undefined,
      },
      include: {
        semester: true,
        assignments: {
          include: {
            teacher: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json(subject);
  } catch (error) {
    console.error('Create subject error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, code, semesterId, creditHours, teacherId } = req.body;
    const currentYear = new Date().getFullYear();

    const subject = await prisma.subject.update({
      where: { id: parseInt(id) },
      data: {
        name,
        code,
        semesterId: semesterId ? parseInt(semesterId) : undefined,
        creditHours: creditHours ? parseInt(creditHours) : undefined,
        assignments: teacherId ? {
          deleteMany: {}, // Simplify: delete existing and create new for current year
          create: {
            teacherId,
            academicYear: currentYear,
          },
        } : undefined,
      },
      include: {
        semester: true,
        assignments: {
          include: {
            teacher: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    return res.json(subject);
  } catch (error) {
    console.error('Update subject error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    await prisma.subject.delete({
      where: { id: parseInt(id) },
    });

    return res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Assignments CRUD
export const getAllAssignments = async (req: Request, res: Response) => {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        subject: true,
        teacher: {
          include: {
            profile: {
              select: {
                fullName: true,
              },
            },
          },
        },
        submissions: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(assignments);
  } catch (error) {
    console.error('Get all assignments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAssignment = async (req: Request, res: Response) => {
  try {
    const { subjectId, teacherId, title, description, dueDate, maxMarks } = req.body;

    if (!subjectId || !teacherId || !title || !dueDate) {
      return res.status(400).json({ error: 'Subject, teacher, title, and due date are required' });
    }

    const assignment = await prisma.assignment.create({
      data: {
        subjectId: parseInt(subjectId),
        teacherId,
        title,
        description,
        dueDate: new Date(dueDate),
        maxMarks: maxMarks ? parseInt(maxMarks) : 100,
      },
      include: {
        subject: true,
        teacher: {
          include: {
            profile: true,
          },
        },
      },
    });

    return res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    await prisma.assignment.delete({
      where: { id: parseInt(id) },
    });

    return res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [studentCount, teacherCount, subjectCount] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.subject.count(),
    ]);

    const students = await prisma.student.findMany({
      include: {
        semester: true,
      },
    });

    const semesterDistribution: Record<string, number> = {};
    students.forEach((student: any) => {
      const semName = student.semester?.name || 'Unknown';
      semesterDistribution[semName] = (semesterDistribution[semName] || 0) + 1;
    });

    const chartData = Object.entries(semesterDistribution).map(([name, count]) => ({
      name,
      students: count,
    })).sort((a, b) => a.name.localeCompare(b.name));

    return res.json({
      students: studentCount,
      teachers: teacherCount,
      subjects: subjectCount,
      chartData,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
