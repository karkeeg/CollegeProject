import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { getProfile, updateProfile, getAssignments, getSubjectStudents, markAttendance, enterMarks, getStudentsBySemester, getAttendance, getMarks, createStudent, addStudentToClass, getAvailableStudents, enrollStudentsBulk } from '../controllers/teacher.controller';
import { createAssignment, getTeacherAssignments, updateAssignment, deleteAssignment, getAssignmentSubmissions, gradeSubmission } from '../controllers/assignment.controller';
import { getQuizzesBySubject, generateQuizDraft, saveQuiz, getQuizForTeacher, deleteQuiz } from '../controllers/quiz.controller';
import { createRoutine, updateRoutine, deleteRoutine } from '../controllers/routine.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// All routes require authentication and teacher role
router.use(authenticate);
router.use(requireRole('TEACHER'));


router.get('/subject/:subjectId/available-students', (req, res, next) => {
    console.log('Accessing available-students route');
    next();
}, getAvailableStudents);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/assignments', getAssignments);
router.get('/subject/:subjectId/students', getSubjectStudents);
router.post('/attendance', markAttendance);
router.post('/marks', enterMarks);
router.get('/class-students/:semesterId', getStudentsBySemester);
router.post('/students/add-to-class', addStudentToClass);

router.post('/students/enroll-bulk', enrollStudentsBulk);
router.get('/attendance', getAttendance);
router.get('/marks', getMarks);
router.post('/students', createStudent);

// Assignment routes
router.post('/homework', upload.single('attachment'), createAssignment);
router.get('/homework', getTeacherAssignments);
router.put('/homework/:id', upload.single('attachment'), updateAssignment);
router.delete('/homework/:id', deleteAssignment);
router.get('/homework/:id/submissions', getAssignmentSubmissions);
router.put('/submissions/:id/grade', gradeSubmission);

// Quiz routes
router.get('/subject/:subjectId/quizzes', getQuizzesBySubject);
router.post('/quiz/generate', generateQuizDraft);
router.post('/quiz/save', saveQuiz);
router.get('/quiz/:id', getQuizForTeacher);
router.delete('/quiz/:id', deleteQuiz);

// Routine management routes
router.post('/routines', createRoutine);
router.put('/routines/:id', updateRoutine);
router.delete('/routines/:id', deleteRoutine);

export default router;
