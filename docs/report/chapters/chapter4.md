# CHAPTER 4: SYSTEM DESIGN

## 4.1 System Architecture
The system follows a three-tier architecture:
1.  **Presentation Tier (Frontend):** Built with React.js and Tailwind CSS, responsible for the user interface and user interactions.
2.  **Application Tier (Backend Logic):** Handled by Supabase Edge Functions and the client-side business logic in React, managing data processing and authentication flows.
3.  **Data Tier (Database):** A PostgreSQL database managed by Supabase, where all student, teacher, and academic records are stored.

## 4.2 Use Case Diagram (Description)
The Use Case Diagram illustrates the interactions between the actors and the system:
- **Admin:** Can manage all records (Students, Teachers, Subjects), assign teachers to subjects, and oversee system settings.
- **Teacher:** Can record attendance, input subject marks, and view their assigned classes.
- **Student:** Can view their own profile, attendance records, and academic results.

## 4.3 ER Diagram (Description)
The Entity-Relationship (ER) Diagram defines the data structure and relationships:
- **Profiles:** The central entity for all users, linked to either the **Students** or **Teachers** table via a one-to-one relationship.
- **Students:** Linked to **Semesters** (one-to-many) to track their current academic level.
- **Semesters:** Contain multiple **Subjects** (one-to-many).
- **Teachers:** Assigned to multiple subjects through a **Subject Assignments** junction table.
- **Attendance & Marks:** Linked to both **Students** and **Subjects** through one-to-many relationships, recording performance and presence.

## 4.4 Database Design
The database consists of the following key tables:

| Table Name | Description | Key Fields |
| :--- | :--- | :--- |
| `profiles` | Stores common user data | `id (PK)`, `email`, `role`, `full_name` |
| `students` | Stores student-specific details | `id (FK)`, `student_code`, `roll_no`, `current_semester_id` |
| `teachers` | Stores teacher-specific details | `id (FK)`, `employee_id`, `department`, `qualification` |
| `semesters` | Defines academic semesters | `id (PK)`, `name`, `batch_year` |
| `subjects` | Stores subject information | `id (PK)`, `code`, `name`, `semester_id` |
| `marks` | Records academic performance | `id (PK)`, `student_id`, `subject_id`, `total_marks` |
| `attendance` | Records daily attendance | `id (PK)`, `student_id`, `subject_id`, `date`, `status` |

## 4.5 Data Flow Explanation
1.  **Authentication:** User enters credentials -> Supabase Auth validates -> JWT token is issued -> Role is identified from `profiles`.
2.  **Information Entry:** Teacher inputs marks -> React validates input -> Data is sent to Supabase via API -> PostgreSQL updates records -> Result is immediately reflected on Student dashboard.
3.  **Reporting:** User requests PDF report -> Frontend aggregates data from state -> PDF library generates document -> User downloads the file.

## 4.6 UI/UX Design Approach
The design prioritizes clarity and efficiency.
- **Sidebar Navigation:** For quick access to different modules.
- **Responsive Tables:** For displaying large sets of student data.
- **Dashboard Widgets:** Using cards and charts (Recharts) to provide quick insights into attendance and GPAs.
- **Consistent Color Palette:** Using a professional blue-themed UI to maintain academic seriousness.
