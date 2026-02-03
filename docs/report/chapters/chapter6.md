# CHAPTER 6: TESTING

## 6.1 Testing Strategy
The testing strategy focused on ensuring that each module functions correctly in isolation and when integrated. A combination of manual testing and unit testing was employed to validate the requirements.

## 6.2 Types of Testing Used
1.  **Unit Testing:** Testing individual components (e.g., calculation functions for GPA).
2.  **Integration Testing:** Verifying that the frontend correctly communicates with Supabase.
3.  **Functional Testing:** Testing the end-to-end user flows, such as student registration and mark entry.
4.  **Security Testing:** Ensuring that RLS policies prevent unauthorized data access.
5.  **User Acceptance Testing (UAT):** Verifying the system against the initial objectives to ensure it meets user needs.

## 6.3 Test Cases

| Test ID | Test Description | Input Condition | Expected Result | Result |
| :--- | :--- | :--- | :--- | :--- |
| TC01 | Admin Login | Valid Email/Password | Redirect to Admin Dashboard | Pass |
| TC02 | Teacher Marks Entry | Marks > 100 | Validation error shown | Pass |
| TC03 | Student Role Access | Access Admin Page URL | Redirect to Dashboard/Unauthorized Error | Pass |
| TC04 | Attendance Update | Change status 'P' to 'A' | Database record updated successfully | Pass |
| TC05 | Report Generation | Click 'Download PDF' | PDF file generated with correct data | Pass |

## 6.4 Testing Results
The testing phase confirmed that the system is stable and performs according to specifications. No major bugs were found during the final verification. Minor UI inconsistencies were addressed during the integration testing phase. The role-based permissions were rigorously tested to ensure data privacy and integrity.
