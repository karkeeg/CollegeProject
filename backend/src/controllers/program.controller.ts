import { Request, Response } from 'express';
import prisma from '../config/database';

export const getAllPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { code: 'asc' },
    });
    return res.json(programs);
  } catch (error) {
    console.error('Get all programs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProgram = async (req: Request, res: Response) => {
  try {
    const { code, name } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Code and name are required' });
    }
    const program = await prisma.program.create({
      data: { code, name },
    });
    return res.status(201).json(program);
  } catch (error) {
    console.error('Create program error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { code, name } = req.body;
    const program = await prisma.program.update({
      where: { id: parseInt(id) },
      data: { code, name },
    });
    return res.json(program);
  } catch (error) {
    console.error('Update program error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.program.delete({
      where: { id: parseInt(id) },
    });
    return res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Delete program error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
