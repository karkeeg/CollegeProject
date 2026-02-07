import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { hashPassword } from '../services/auth.service';
import { EnrollmentAlgorithm } from '../algorithms/enrollment.algorithm';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: true,
      },
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    return res.json(teacher);
  } catch (error) {
    console.error('Get teacher profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, department, qualification } = req.body;
    const teacherId = req.user!.id;

    const teacher = await prisma.teacher.update({
      where: { id: teacherId },
      data: {
        department,
        qualification,
        profile: {
          update: {
            fullName
          }
        }
      },
      include: {
        profile: true
      }
    });

    return res.json(teacher);
  } catch (error) {
    console.error('Update teacher profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await prisma.subjectAssignment.findMany({
      where: { teacherId: req.user!.id },
      include: {
        subject: {
          include: {
            semester: true,
          },
        },
      },
    });

    return res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSubjectStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId } = req.params;
    const subjectIdStr = Array.isArray(subjectId) ? subjectId[0] : subjectId;
    const id = parseInt(subjectIdStr);

    const enrolledStudents = await prisma.studentClass.findMany({
      where: { subjectId: id },
      include: {
        student: {
          include: {
            profile: true,
          }
        }
      },
      orderBy: { student: { rollNo: 'asc' } },
    });

    // Transform to match expected frontend format (return list of students)
    const students = enrolledStudents.map(es => es.student);

    return res.json(students);
  } catch (error) {
    console.error('Get subject students error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentsBySemester = async (req: AuthRequest, res: Response) => {
  try {
    const { semesterId } = req.params;
    const students = await prisma.student.findMany({
      where: { currentSemesterId: parseInt(semesterId as string) },
      include: { profile: true },
      orderBy: { rollNo: 'asc' },
    });
    return res.json(students);
  } catch (error) {
    console.error('Get students by semester error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const attendanceRecords = req.body; // Expecting an array

    if (!Array.isArray(attendanceRecords)) {
      return res.status(400).json({ error: 'Attendance data must be an array' });
    }

    const promises = attendanceRecords.map((record: any) => {
      return prisma.attendance.upsert({
        where: {
          studentId_subjectId_date: {
            studentId: record.studentId,
            subjectId: parseInt(record.subjectId),
            date: new Date(record.date),
          },
        },
        update: {
          status: record.status.toUpperCase() as any,
        },
        create: {
          studentId: record.studentId,
          subjectId: parseInt(record.subjectId),
          date: new Date(record.date),
          status: record.status.toUpperCase() as any,
        },
      });
    });

    await Promise.all(promises);
    return res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Mark attendance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, date } = req.query;
    if (!subjectId || !date) {
      return res.status(400).json({ error: 'Subject ID and date are required' });
    }

    const records = await prisma.attendance.findMany({
      where: {
        subjectId: parseInt(subjectId as string),
        date: new Date(date as string),
      },
    });

    // Format to lowercase for frontend consistency if needed
    const formatted = records.map(r => ({ ...r, status: r.status.toLowerCase() }));
    return res.json(formatted);
  } catch (error) {
    console.error('Get attendance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const enterMarks = async (req: AuthRequest, res: Response) => {
  try {
    const marksData = req.body; // Expecting an array
    const { examType } = req.query; // Get exam type from query

    if (!Array.isArray(marksData)) {
      return res.status(400).json({ error: 'Marks data must be an array' });
    }

    const type = (examType as string) || 'Terminal';

    const promises = marksData.map((record: any) => {
      return prisma.mark.upsert({
        where: {
          studentId_subjectId_examType: {
            studentId: record.studentId,
            subjectId: parseInt(record.subjectId),
            examType: type,
          },
        },
        update: {
          internalMarks: parseFloat(record.internalMarks) || 0,
          practicalMarks: parseFloat(record.practicalMarks) || 0,
          finalMarks: parseFloat(record.finalMarks) || 0,
          gradeLetter: record.gradeLetter || null,
        },
        create: {
          studentId: record.studentId,
          subjectId: parseInt(record.subjectId),
          examType: type,
          internalMarks: parseFloat(record.internalMarks) || 0,
          practicalMarks: parseFloat(record.practicalMarks) || 0,
          finalMarks: parseFloat(record.finalMarks) || 0,
          gradeLetter: record.gradeLetter || null,
        },
      });
    });

    await Promise.all(promises);
    return res.json({ message: 'Marks saved successfully' });
  } catch (error) {
    console.error('Enter marks error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMarks = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, examType } = req.query;
    if (!subjectId) {
      return res.status(400).json({ error: 'Subject ID is required' });
    }

    const where: any = {
      subjectId: parseInt(subjectId as string),
    };

    if (examType) {
        where.examType = examType as string;
    }

    const marks = await prisma.mark.findMany({
      where,
    });

    return res.json(marks);
  } catch (error) {
    console.error('Get marks error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      fullName, 
      studentCode, 
      rollNo, 
      regNo, 
      semesterId, 
      phone, 
      address, 
      dob,
      email 
    } = req.body;

    // Basic validation
    if (!fullName || !studentCode || !semesterId) {
      return res.status(400).json({ error: 'Full Name, Student Code and Semester are required' });
    }

    // Default password for students created by teachers
    const defaultPassword = "Student@123";
    const hashedPassword = await hashPassword(defaultPassword);
    
    // Generate email if not provided (optional)
    const studentEmail = email || `${studentCode.toLowerCase()}@student.school.com`;

    const student = await prisma.profile.create({
      data: {
        email: studentEmail,
        password: hashedPassword,
        fullName,
        role: 'STUDENT',
        student: {
          create: {
            studentCode,
            rollNo: rollNo ? parseInt(rollNo) : null,
            regNo,
            semester: { connect: { id: parseInt(semesterId) } },
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
  } catch (error: any) {
    console.error('Create student error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Student with this code or email already exists' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAvailableStudents = async (req: AuthRequest, res: Response) => {
    try {
        const { subjectId } = req.params;
        const { query } = req.query;
        const searchQuery = (typeof query === 'string') ? (query as string) : undefined;

        const subjectIdStr = Array.isArray(subjectId) ? subjectId[0] : subjectId;
        
        const students = await EnrollmentAlgorithm.findEligibleStudents(
            parseInt(subjectIdStr), 
            searchQuery
        );
        
        return res.json(students);
    } catch (error) {
        console.error('Get available students error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const enrollStudentsBulk = async (req: AuthRequest, res: Response) => {
    try {
        const { subjectId, studentIds } = req.body;
        
        const result = await EnrollmentAlgorithm.enrollStudentsBulk(
            parseInt(subjectId), 
            studentIds
        );
        
        return res.json(result);
    } catch (error) {
         console.error('Bulk enroll error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const addStudentToClass = async (req: AuthRequest, res: Response) => {
  try {
    const { studentCode, subjectId } = req.body;

    if (!studentCode || !subjectId) {
      return res.status(400).json({ error: 'Student Code and Subject ID are required' });
    }

    const student = await prisma.student.findUnique({
      where: { studentCode },
      include: { profile: true }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found with this code' });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subjectId) },
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    if (student.currentSemesterId !== subject.semesterId) {
       return res.status(400).json({ error: 'Student does not belong to the same semester as this subject' });
    }

    // Check if already in class
    const existing = await prisma.studentClass.findUnique({
      where: {
        studentId_subjectId: {
            studentId: student.id,
            subjectId: subject.id
        }
      }
    });

    if (existing) {
        return res.status(400).json({ error: 'Student is already enrolled in this class' });
    }

    // Add to class
    await prisma.studentClass.create({
      data: {
        studentId: student.id,
        subjectId: subject.id,
      }
    });

    return res.json({ message: 'Student added to class successfully', student });
  } catch (error) {
    console.error('Add student to class error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
