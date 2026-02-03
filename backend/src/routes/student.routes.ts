import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { getProfile, getSubjects, getAttendance, getMarks, getDashboardStats, getRoutine } from '../controllers/student.controller';
import { getStudentAssignments, submitAssignment } from '../controllers/assignment.controller';

const router = Router();

// All routes require authentication and student role
router.use(authenticate);
router.use(requireRole('STUDENT'));

router.get('/profile', getProfile);
router.get('/subjects', getSubjects);
router.get('/attendance', getAttendance);
router.get('/marks', getMarks);
router.get('/routine', getRoutine);
router.get('/dashboard-stats', getDashboardStats);

// Assignment routes
router.get('/homework', getStudentAssignments);
router.post('/homework/:id/submit', submitAssignment);

export default router;
