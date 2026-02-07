import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';


// Create Assignment (Teacher)
export async function createAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { subjectId, title, description, dueDate, maxMarks } = req.body;
    const teacherId = req.user!.id;

    // Verify teacher is assigned to this subject
    const subjectAssignment = await prisma.subjectAssignment.findFirst({
      where: {
        teacherId,
        subjectId: parseInt(subjectId)
      }
    });

    if (!subjectAssignment) {
      res.status(403).json({ error: 'You are not assigned to this subject' });
      return;
    }

    const assignment = await prisma.assignment.create({
      data: {
        subjectId: parseInt(subjectId),
        teacherId,
        title,
        description,
        dueDate: new Date(dueDate),
        maxMarks: parseInt(maxMarks) || 100,
        attachmentUrl: req.file ? `/uploads/assignments/${req.file.filename}` : null
      },
      include: {
        subject: true
      }
    });

    res.json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
}

// Get Teacher's Assignments
export async function getTeacherAssignments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const teacherId = req.user!.id;

    const assignments = await prisma.assignment.findMany({
      where: { teacherId },
      include: {
        subject: {
          include: {
            semester: true
          }
        },
        submissions: {
          select: {
            id: true,
            studentId: true,
            submittedAt: true,
            marksObtained: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
}

// Get Student's Assignments
export async function getStudentAssignments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const studentId = req.user!.id;

    // Get student's semester
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { currentSemesterId: true }
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Get assignments for subjects the student is specifically enrolled in
    const assignments = await prisma.assignment.findMany({
      where: {
        subject: {
          enrolledStudents: {
            some: {
              studentId
            }
          }
        }
      },
      include: {
        subject: true,
        teacher: {
          include: {
            profile: {
              select: {
                fullName: true
              }
            }
          }
        },
        submissions: {
          where: {
            studentId
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
}

// Submit Assignment (Student)
export async function submitAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const studentId = req.user!.id;

    const attachmentUrl = req.file ? `/uploads/submissions/${req.file.filename}` : undefined;

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: parseInt(id as string),
          studentId
        }
      },
      update: {
        content,
        submittedAt: new Date(),
        ...(attachmentUrl && { attachmentUrl })
      },
      create: {
        assignmentId: parseInt(id as string),
        studentId,
        content,
        attachmentUrl: attachmentUrl || null
      }
    });

    res.json(submission);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
}

// Get Assignment Submissions (Teacher)
export async function getAssignmentSubmissions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: parseInt(id as string)
      },
      include: {
        student: {
          include: {
            profile: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}

// Grade Submission (Teacher)
export async function gradeSubmission(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { marksObtained, feedback } = req.body;

    const submission = await prisma.submission.update({
      where: { id: parseInt(id as string) },
      data: {
        marksObtained: parseFloat(marksObtained),
        feedback,
        gradedAt: new Date()
      }
    });

    res.json(submission);
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ error: 'Failed to grade submission' });
  }
}

// Update Assignment (Teacher)
export async function updateAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { title, description, dueDate, maxMarks } = req.body;
    const teacherId = req.user!.id;

    // Check ownership
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!existingAssignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    if (existingAssignment.teacherId !== teacherId) {
      res.status(403).json({ error: 'You are not authorized to update this assignment' });
      return;
    }

    const attachmentUrl = req.file ? `/uploads/assignments/${req.file.filename}` : undefined;

    const assignment = await prisma.assignment.update({
      where: { id: parseInt(id as string) },
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        maxMarks: parseInt(maxMarks),
        ...(attachmentUrl && { attachmentUrl })
      }
    });

    res.json(assignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
}

// Delete Assignment (Teacher)
export async function deleteAssignment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const teacherId = req.user!.id;

    // Check ownership
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!existingAssignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    if (existingAssignment.teacherId !== teacherId) {
      res.status(403).json({ error: 'You are not authorized to delete this assignment' });
      return;
    }

    await prisma.assignment.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
}
