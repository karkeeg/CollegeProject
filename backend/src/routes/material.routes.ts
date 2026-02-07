import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { upload } from '../middleware/upload.middleware';
import { createMaterial, getMaterialsBySubject, deleteMaterial } from '../controllers/material.controller';

const router = Router();

router.use(authenticate);

// Public (authenticated) read access? Or refined by enrollment?
// For now, allow authenticated users to see materials
router.get('/:subjectId', getMaterialsBySubject);

// Teacher/Admin only routes
router.post('/', requireRole('TEACHER'), upload.single('file'), createMaterial);
router.delete('/:id', requireRole('TEACHER'), deleteMaterial);

export default router;
