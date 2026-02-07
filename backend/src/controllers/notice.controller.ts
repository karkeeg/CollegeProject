import { Response } from 'express';
import { AuthRequest } from '../types';
import prisma from '../config/database';

// Create Notice
export async function createNotice(req: AuthRequest, res: Response) {
  try {
    const { title, content, priority, targetRole } = req.body;
    const createdById = req.user!.id;
    const attachmentUrl = req.file ? `/uploads/notices/${req.file.filename}` : null;

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        priority: priority || 'NORMAL',
        targetRole: targetRole || null,
        attachmentUrl,
        createdById
      },
      include: {
        createdBy: {
          select: {
            fullName: true,
            role: true
          }
        }
      }
    });

    res.json(notice);
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ error: 'Failed to create notice' });
  }
}

// Get All Notices (Admin)
export async function getAllNotices(req: AuthRequest, res: Response) {
  try {
    const notices = await prisma.notice.findMany({
      include: {
        createdBy: {
          select: {
            fullName: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
}

// Get Notices for Current User's Role
export async function getNoticesForRole(req: AuthRequest, res: Response) {
  try {
    const userRole = req.user!.role;

    const notices = await prisma.notice.findMany({
      where: {
        OR: [
          { targetRole: null }, // All roles
          { targetRole: userRole } // Specific role
        ]
      },
      include: {
        createdBy: {
          select: {
            fullName: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'Failed to fetch notices' });
  }
}

// Update Notice
export async function updateNotice(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, content, priority, targetRole } = req.body;
    const attachmentUrl = req.file ? `/uploads/notices/${req.file.filename}` : undefined;

    const notice = await prisma.notice.update({
      where: { id: parseInt(id as string) },
      data: {
        title,
        content,
        priority,
        targetRole: targetRole || null,
        ...(attachmentUrl && { attachmentUrl })
      }
    });

    res.json(notice);
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).json({ error: 'Failed to update notice' });
  }
}

// Delete Notice
export async function deleteNotice(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    await prisma.notice.delete({
      where: { id: parseInt(id as string) }
    });

    res.json({ message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ error: 'Failed to delete notice' });
  }
}

// Get Public Notices (No Auth)
export async function getPublicNotices(req: any, res: Response) {
  try {
    const notices = await prisma.notice.findMany({
      where: {
        targetRole: null // Only public notices
      },
      include: {
        createdBy: {
          select: {
            fullName: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limit to latest 20 for public view
    });

    res.json(notices);
  } catch (error) {
    console.error('Error fetching public notices:', error);
    res.status(500).json({ error: 'Failed to fetch public notices' });
  }
}
