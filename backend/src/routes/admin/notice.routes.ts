import { Router } from 'express';

import {
  createNotice,
  getAllNotices,
  updateNotice,
  deleteNotice
} from '../../controllers/notice.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/roleGuard';
import { upload } from '../../middleware/upload.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.post('/', createNotice);
router.get('/', getAllNotices);
router.put('/:id', updateNotice);
router.delete('/:id', deleteNotice);

export default router;
