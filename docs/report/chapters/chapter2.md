# CHAPTER 2: LITERATURE REVIEW

## 2.1 Overview of Student Management Systems
Student Management Systems (SMS), also known as Student Information Systems (SIS), are software applications designed to manage student data. These systems handle various aspects of a student's academic life, including registration, attendance tracking, marks management, and performance analysis. Historically, educational institutions relied on physical ledgers and paper-based records, which were difficult to maintain and often resulted in data fragmentation. The transition to digital systems has enabled institutions to centralize data, improve security, and enhance the overall administrative efficiency.

## 2.2 Manual vs. Computerized Systems
The shift from manual to computerized systems represents a significant evolution in educational administration.

### 2.2.1 Manual Systems
- **Storage:** Physical registers and folders requiring significant shelf space.
- **Data Entry:** Repetitive manual writing, leading to high error rates.
- **Searchability:** Extremely slow; retrieving a single record may take minutes or hours.
- **Reporting:** Requires manual calculation and drafting, which is time-consuming.
- **Data Security:** Prone to physical damage (fire, moisture) and unauthorized access.

### 2.2.2 Computerized Systems
- **Storage:** Digital databases with high capacity and minimal physical footprint.
- **Data Entry:** Entry through user-friendly interfaces with validation to minimize errors.
- **Searchability:** Instantaneous retrieval using search queries and filters.
- **Reporting:** Automated generation of complex reports and analytics.
- **Data Security:** Robust encryption, role-based access control (RBAC), and automated backups.

## 2.3 Review of Related Technologies
The proposed system utilizes a modern web technology stack to ensure scalability, performance, and security.

### 2.3.1 React.js
React.js is an open-source JavaScript library developed by Meta for building user interfaces, particularly single-page applications. It allows developers to create reusable UI components, which significantly speeds up development and improves maintainability. Its virtual DOM implementation ensures high performance by efficiently updating only the necessary parts of the UI.

### 2.3.2 Node.js and Express
Node.js is an asynchronous, event-driven JavaScript runtime designed to build scalable network applications. Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. In this project, Express serves as the middleware layer for handling API requests and server-side logic.

### 2.3.3 Supabase and PostgreSQL
Supabase is an open-source Firebase alternative that provides a suite of tools for backend development. It uses PostgreSQL, a powerful, open-source object-relational database system, as its core engine. Supabase offers key features such as:
- **Database:** Managed PostgreSQL for structured data storage.
- **Authentication:** Built-in support for secure user sign-ups and logins.
- **Real-time:** Capability to listen to database changes in real-time.
- **Row-Level Security (RLS):** Policies that control which users can access or modify specific rows in a table.

### 2.3.4 Tailwind CSS
Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs without leaving the HTML. It enables consistent design patterns and responsive layouts with minimal effort.

## 2.4 Summary of Findings
The literature review indicates that while many student management systems exist, there is a continuous need for lightweight, role-based systems tailored to specific academic environments like the BCA program under Tribhuvan University. Modern technologies like React and Supabase provide a cost-effective and highly efficient way to develop such systems, ensuring they are both scalable and secure for academic use.
