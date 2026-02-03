import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getAllSemesters, getAllPrograms, getAllSubjects, getSubjectsBySemester } from '../controllers/common.controller';
import { getNoticesForRole } from '../controllers/notice.controller';
import { getRoutineBySemester } from '../controllers/routine.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/semesters', getAllSemesters);
router.get('/programs', getAllPrograms);
router.get('/subjects', getAllSubjects);
router.get('/semesters/:semesterId/subjects', getSubjectsBySemester);
router.get('/notices', getNoticesForRole);
router.get('/routines', getRoutineBySemester);

export default router;
