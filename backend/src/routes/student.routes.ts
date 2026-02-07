import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { getProfile, updateProfile, getSubjects, getAttendance, getMarks, getDashboardStats, getRoutine } from '../controllers/student.controller';
import { getStudentAssignments, submitAssignment } from '../controllers/assignment.controller';
import { getQuizForStudent, submitQuizAttempt, getStudentQuizResult, getQuizzesBySubject } from '../controllers/quiz.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// All routes require authentication and student role
router.use(authenticate);
router.use(requireRole('STUDENT'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/subjects', getSubjects);
router.get('/attendance', getAttendance);
router.get('/marks', getMarks);
router.get('/routine', getRoutine);
router.get('/dashboard-stats', getDashboardStats);

// Assignment routes
router.get('/homework', getStudentAssignments);
router.post('/homework/:id/submit', upload.single('attachment'), submitAssignment);

// Quiz routes
router.get('/subject/:subjectId/quizzes', getQuizzesBySubject);
router.get('/quiz/result/:id', getStudentQuizResult);
router.get('/quiz/:id', getQuizForStudent);
router.post('/quiz/attempt', submitQuizAttempt);

export default router;
