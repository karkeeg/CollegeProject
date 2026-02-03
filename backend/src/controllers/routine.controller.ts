import { Request, Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

async function checkTeacherAssignment(teacherId: string, subjectId: number) {
  const assignment = await prisma.subjectAssignment.findFirst({
    where: {
      teacherId,
      subjectId
    }
  });
  return !!assignment;
}

// Create Routine Entry
export async function createRoutine(req: AuthRequest, res: Response) {
  try {
    const { semesterId, dayOfWeek, startTime, endTime, subjectId, room } = req.body;
    const { role, id: userId } = req.user!;

    // If teacher, verify they are assigned to this subject
    if (role === 'TEACHER') {
      const isAssigned = await checkTeacherAssignment(userId, parseInt(subjectId));
      if (!isAssigned) {
        return res.status(403).json({ error: 'You are not assigned to this subject' });
      }
    }

    // Validate day (Sunday-Friday only)
    if (parseInt(dayOfWeek) === 6) {
      return res.status(400).json({ error: 'Saturdays are not allowed in the schedule' });
    }

    const routine = await prisma.routine.create({
      data: {
        semesterId: parseInt(semesterId),
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        subjectId: parseInt(subjectId),
        room
      },
      include: {
        subject: true,
        semester: true
      }
    });

    res.json(routine);
  } catch (error) {
    console.error('Error creating routine:', error);
    res.status(500).json({ error: 'Failed to create routine' });
  }
}

// Get All Routines (Admin)
export async function getAllRoutines(req: Request, res: Response) {
  try {
    const routines = await prisma.routine.findMany({
      include: {
        subject: true,
        semester: true
      },
      orderBy: [
        { semesterId: 'asc' },
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.json(routines);
  } catch (error) {
    console.error('Error fetching routines:', error);
    res.status(500).json({ error: 'Failed to fetch routines' });
  }
}

// Get Routine by Semester
export async function getRoutineBySemester(req: Request, res: Response) {
  try {
    const { semesterId } = req.query;

    const routines = await prisma.routine.findMany({
      where: {
        semesterId: parseInt(semesterId as string)
      },
      include: {
        subject: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.json(routines);
  } catch (error) {
    console.error('Error fetching routine:', error);
    res.status(500).json({ error: 'Failed to fetch routine' });
  }
}

// Update Routine
export async function updateRoutine(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { semesterId, dayOfWeek, startTime, endTime, subjectId, room } = req.body;
    const { role, id: userId } = req.user!;

    // Find the routine first to check its current subject
    const existingRoutine = await prisma.routine.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!existingRoutine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    // If teacher, verify permission for BOTH old and new subjects
    if (role === 'TEACHER') {
      const isAssignedOld = await checkTeacherAssignment(userId, existingRoutine.subjectId);
      const isAssignedNew = await checkTeacherAssignment(userId, parseInt(subjectId));
      
      if (!isAssignedOld || !isAssignedNew) {
        return res.status(403).json({ error: 'You do not have permission to manage this subject\'s schedule' });
      }
    }

    // Validate day (Sunday-Friday only)
    if (parseInt(dayOfWeek) === 6) {
      return res.status(400).json({ error: 'Saturdays are not allowed in the schedule' });
    }

    const routine = await prisma.routine.update({
      where: { id: parseInt(id as string) },
      data: {
        semesterId: parseInt(semesterId),
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        subjectId: parseInt(subjectId),
        room
      }
    });

    res.json(routine);
  } catch (error) {
    console.error('Error updating routine:', error);
    res.status(500).json({ error: 'Failed to update routine' });
  }
}

// Delete Routine
export async function deleteRoutine(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user!;

    const existingRoutine = await prisma.routine.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!existingRoutine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    if (role === 'TEACHER') {
      const isAssigned = await checkTeacherAssignment(userId, existingRoutine.subjectId);
      if (!isAssigned) {
        return res.status(403).json({ error: 'You do not have permission to delete this schedule' });
      }
    }

    await prisma.routine.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ message: 'Routine deleted successfully' });
  } catch (error) {
    console.error('Error deleting routine:', error);
    res.status(500).json({ error: 'Failed to delete routine' });
  }
}
