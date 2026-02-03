import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roleGuard';
import { getDashboardStats, getAllStudents, createStudent, updateStudent, deleteStudent, getAllTeachers, createTeacher, updateTeacher, deleteTeacher, getAllSubjects, createSubject, updateSubject, deleteSubject, getAllAssignments, createAssignment as createTeacherAssignment, deleteAssignment as deleteTeacherAssignment, importStudents, importTeachers } from '../controllers/admin.controller';
import noticeRoutes from './admin/notice.routes';
import routineRoutes from './admin/routine.routes';
import programRoutes from './admin/program.routes';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/dashboard-stats', getDashboardStats);

// Student routes
router.get('/students', getAllStudents);
router.post('/students', createStudent);
router.post('/import/students', importStudents);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

// Teacher routes
router.get('/teachers', getAllTeachers);
router.post('/teachers', createTeacher);
router.post('/import/teachers', importTeachers);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

// Subject routes
router.get('/subjects', getAllSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

// Assignment (teacher-subject) routes
router.get('/assignments', getAllAssignments);
router.post('/assignments', createTeacherAssignment);
router.delete('/assignments/:id', deleteTeacherAssignment);

// Notice, Routine and Program sub-routes
router.use('/notices', noticeRoutes);
router.use('/routines', routineRoutes);
router.use('/programs', programRoutes);

export default router;
