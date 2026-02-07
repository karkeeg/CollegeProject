import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';
import fs from 'fs';
import path from 'path';

// Create Material
export async function createMaterial(req: AuthRequest, res: Response) {
  try {
    const { title, description, subjectId } = req.body;
    const teacherId = req.user!.id;
    
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const fileUrl = `/uploads/materials/${req.file.filename}`;
    const fileType = req.file.mimetype;

    const material = await prisma.classMaterial.create({
      data: {
        title,
        description,
        subjectId: parseInt(subjectId),
        teacherId,
        fileUrl,
        fileType
      }
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ error: 'Failed to create material' });
  }
}

// Get Materials by Subject
export async function getMaterialsBySubject(req: AuthRequest, res: Response) {
  try {
    const { subjectId } = req.params;

    const materials = await prisma.classMaterial.findMany({
      where: {
        subjectId: parseInt(subjectId as string)
      },
      include: {
        teacher: {
          select: {
            profile: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
}

// Delete Material
export async function deleteMaterial(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const teacherId = req.user!.id;

    const material = await prisma.classMaterial.findUnique({
      where: { id: parseInt(id as string) }
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Check ownership
    // Allow users with teacher role who own the material to delete it
    // Or potentially admins (can be expanded later)
    if (material.teacherId !== teacherId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), material.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.classMaterial.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ error: 'Failed to delete material' });
  }
}
