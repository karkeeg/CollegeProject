import { Router } from 'express';
import { getPublicNotices } from '../controllers/notice.controller';
import { getAllPrograms } from '../controllers/common.controller';

const router = Router();

// Publicly accessible routes (no authentication)
router.get('/notices', getPublicNotices);
router.get('/programs', getAllPrograms);

export default router;
