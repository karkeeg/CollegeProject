import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import Login from './pages/auth/Login';
import DashboardLayout from './layouts/DashboardLayout';
import RequireRole from './components/RequireRole';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentList from './pages/admin/StudentList';
import TeacherList from './pages/admin/TeacherList';
import SubjectList from './pages/admin/SubjectList';
import AssignmentList from './pages/admin/AssignmentList';
import NoticeList from './pages/admin/NoticeList';
import RoutineList from './pages/admin/RoutineList';
import ProgramList from './pages/admin/ProgramList';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import SubjectDetails from './pages/teacher/SubjectDetails';
import MyClasses from './pages/teacher/MyClasses';
import MarksEntry from './pages/teacher/MarksEntry';
import TeacherAssignments from './pages/teacher/TeacherAssignments';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentResults from './pages/student/StudentResults';
import NoticeBoard from './pages/student/NoticeBoard';
import ClassRoutine from './pages/student/ClassRoutine';
import StudentAssignments from './pages/student/StudentAssignments';
import Profile from './pages/common/Profile';
// Public Pages
import LandingPage from './pages/public/LandingPage';
import PublicNoticeBoard from './pages/public/PublicNoticeBoard';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/notices" element={<PublicNoticeBoard />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<DashboardLayout />}>
            {/* Admin Routes */}
            <Route element={<RequireRole allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<StudentList />} />
              <Route path="/admin/teachers" element={<TeacherList />} />
              <Route path="/admin/subjects" element={<SubjectList />} />
              <Route path="/admin/assignments" element={<AssignmentList />} />
              <Route path="/admin/notices" element={<NoticeList />} />
              <Route path="/admin/routine" element={<RoutineList />} />
              <Route path="/admin/programs" element={<ProgramList />} />
              <Route path="/admin/profile" element={<Profile />} />
            </Route>
            
            {/* Teacher Routes */}
            <Route element={<RequireRole allowedRoles={['teacher']} />}>
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/teacher/classes" element={<MyClasses />} />
              <Route path="/teacher/marks" element={<MarksEntry />} />
              <Route path="/teacher/assignments" element={<TeacherAssignments />} />
              <Route path="/teacher/subject/:subjectId" element={<SubjectDetails />} />
              <Route path="/teacher/profile" element={<Profile />} />
            </Route>
            
            {/* Student Routes */}
            <Route element={<RequireRole allowedRoles={['student']} />}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/notices" element={<NoticeBoard />} />
              <Route path="/student/routine" element={<ClassRoutine />} />
              <Route path="/student/assignments" element={<StudentAssignments />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
              <Route path="/student/results" element={<StudentResults />} />
              <Route path="/student/profile" element={<Profile />} />
            </Route>
              <Route path="/student/results" element={<StudentResults />} />
              <Route path="/student/profile" element={<Profile />} />
            </Route>
          
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
