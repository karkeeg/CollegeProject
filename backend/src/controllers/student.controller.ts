import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: true,
        semester: true,
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    return res.json(student);
  } catch (error) {
    console.error('Get student profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSubjects = async (req: AuthRequest, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: {
        enrolledStudents: {
          some: {
            studentId: req.user!.id
          }
        }
      },
      orderBy: { code: 'asc' },
    });

    return res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: req.user!.id },
      include: {
        subject: true,
      },
      orderBy: { date: 'desc' },
    });

    const subjectStats: Record<string, any> = {};

    attendanceRecords.forEach(record => {
      const subjectId = record.subjectId;
      if (!subjectStats[subjectId]) {
        subjectStats[subjectId] = {
          subjectName: record.subject.name,
          subjectCode: record.subject.code,
          totalClasses: 0,
          presentCount: 0,
          absentCount: 0,
        };
      }

      subjectStats[subjectId].totalClasses++;
      if (record.status === 'PRESENT' || record.status === 'LATE') {
        subjectStats[subjectId].presentCount++;
      } else {
        subjectStats[subjectId].absentCount++;
      }
    });

    const formattedStats = Object.values(subjectStats).map(stat => ({
      ...stat,
      attendancePercentage: stat.totalClasses > 0 
        ? (stat.presentCount / stat.totalClasses) * 100 
        : 0
    }));

    return res.json(formattedStats);
  } catch (error) {
    console.error('Get attendance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMarks = async (req: AuthRequest, res: Response) => {
  try {
    const marks = await prisma.mark.findMany({
      where: { studentId: req.user!.id },
      include: {
        subject: true,
      },
    });

    return res.json(marks);
  } catch (error) {
    console.error('Get marks error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // Get subject IDs for which the student is enrolled
    const enrolledClasses = await prisma.studentClass.findMany({
      where: { studentId: req.user!.id },
      select: { subjectId: true },
    });
    const subjectIds = enrolledClasses.map(c => c.subjectId);

    if (subjectIds.length === 0) {
      return res.json({ attendancePercentage: 0, sgpa: 0, totalClasses: 0, attendedClasses: 0 });
    }

    // Calculate attendance
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: req.user!.id,
        subjectId: { in: subjectIds },
      },
    });

    const totalClasses = attendanceRecords.length;
    const attendedClasses = attendanceRecords.filter(
      a => a.status === 'PRESENT' || a.status === 'LATE'
    ).length;
    const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

    // Calculate SGPA
    const marks = await prisma.mark.findMany({
      where: {
        studentId: req.user!.id,
        subjectId: { in: subjectIds },
      },
      include: {
        subject: true,
      },
    });

    let sgpa = 0;
    if (marks.length > 0) {
      const gradePoints: Record<string, number> = {
        'A+': 4.0, 'A': 3.7, 'B+': 3.3, 'B': 3.0, 'C+': 2.7, 'C': 2.3, 'F': 0
      };

      let totalGradePoints = 0;
      let totalCredits = 0;

      marks.forEach(mark => {
        const credits = mark.subject.creditHours;
        const gradePoint = gradePoints[mark.gradeLetter || ''] || 0;
        totalGradePoints += gradePoint * credits;
        totalCredits += credits;
      });

      sgpa = totalCredits > 0 ? parseFloat((totalGradePoints / totalCredits).toFixed(2)) : 0;
    }

    return res.json({
      attendancePercentage,
      sgpa,
      totalClasses,
      attendedClasses,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRoutine = async (req: AuthRequest, res: Response) => {
  try {
    const enrolledClasses = await prisma.studentClass.findMany({
      where: { studentId: req.user!.id },
      select: { subjectId: true },
    });
    const subjectIds = enrolledClasses.map(c => c.subjectId);

    const routines = await prisma.routine.findMany({
      where: {
        subjectId: { in: subjectIds }
      },
      include: {
        subject: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return res.json(routines);
  } catch (error) {
    console.error('Get student routine error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
