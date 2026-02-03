import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllSemesters = async (req: Request, res: Response) => {
  try {
    const { programId } = req.query;
    const semesters = await prisma.semester.findMany({
      where: programId ? { programId: parseInt(programId as string) } : undefined,
      include: { program: true },
      orderBy: { name: 'asc' },
    });
    return res.json(semesters);
  } catch (error) {
    console.error('Get semesters error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { code: 'asc' },
    });
    return res.json(programs);
  } catch (error) {
    console.error('Get programs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        semester: true,
      },
      orderBy: { code: 'asc' },
    });
    return res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSubjectsBySemester = async (req: Request, res: Response) => {
  try {
    const { semesterId } = req.params;
    const semesterIdStr = Array.isArray(semesterId) ? semesterId[0] : semesterId;
    const subjects = await prisma.subject.findMany({
      where: { semesterId: parseInt(semesterIdStr) },
      orderBy: { code: 'asc' },
    });
    return res.json(subjects);
  } catch (error) {
    console.error('Get subjects by semester error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
