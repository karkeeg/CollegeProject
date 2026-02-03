# CHAPTER 5: IMPLEMENTATION

## 5.1 Development Environment
The development environment was set up with the following prerequisites:
- **Operating System:** Windows 10/11
- **Code Editor:** Visual Studio Code
- **Version Control:** Git & GitHub
- **Runtime:** Node.js (Latest LTS)

## 5.2 Tools and Technologies Used
- **Frontend Framework:** React 18 with Vite
- **Language:** TypeScript (for type safety)
- **Styling:** Tailwind CSS
- **Backend-as-a-Service:** Supabase
- **Database:** PostgreSQL
- **Form Handling:** React Hook Form
- **Data Fetching:** TanStack Query (React Query)
- **PDF Generation:** jsPDF / React-PDF
- **Icons:** Lucide React

## 5.3 Module-wise Implementation

### 5.3.1 Authentication Module
Implemented using Supabase Auth. It handles user registration (by Admin), login, and session persistence. Row-Level Security (RLS) policies ensure that users can only access data relevant to their role.

### 5.3.2 Admin Module
The dashboard for Administrators includes management interfaces for students, teachers, and subjects. It uses a custom-built `StudentForm` and `TeacherForm` to handle data entry and updates.

### 5.3.3 Teacher Module
This module allows teachers to view their schedule, take attendance using a list-view interface, and enter marks. The marks entry interface includes validation to ensure values do not exceed the maximum allowed for each category (Internal, Practical, Final).

### 5.3.4 Student Module
The student dashboard provides a summarized view of weighted attendance and latest marks. Students can download their individual result sheets in PDF format.

## 5.4 Business Logic Implementation

### 5.4.1 Attendance Calculation
Attendance percentage is calculated as:
`Attendance (%) = (Total Present Days / Total Conducted Classes) * 100`

### 5.4.2 GPA / CGPA Calculation
The system follows the TU grading system. Marks are converted to Grade Points (GP) based on pre-defined ranges (e.g., 90-100 = 4.0).
`GPA = Σ (Grade Point * Credit Hours) / Total Credit Hours`

## 5.5 Security Implementation
- **Authentication:** Managed via Supabase Auth with secure JWT tokens.
- **Authorization:** Role-based access control (RBAC) implemented both on the frontend (routing) and backend (database policies).
- **Row-Level Security (RLS):** For example, a student can only select their own row from the `marks` table:
  ```sql
  create policy "Students can view own marks"
  on marks for select
  using (auth.uid() = student_id);
  ```
- **Validation:** Both client-side and server-side validation to prevent malformed data entry.
