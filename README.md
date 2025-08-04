# Grade Insight — User Flow Overview

## 🧭 High-Level User Flow

### 🔐 Login Page (React)
- All users (teacher, student, parent) go through the same login form. (React)
- System detects user type after login (Node.js + MySQL)
- Redirects them to the correct dashboard. (React)

---

### 🧑‍🏫 Teacher Dashboard (React)
- Linked to their `teacher_id`. (MySQL)
- Displays: (React)
  - All their classes (MySQL)
  - Upload CSV button (opens generic upload form) (React)
  - Optionally: recent uploads / file history (React + MySQL)

---

### 📤 Upload Page (generic) (React)
- Class name input (or dropdown if class exists) (React)
- File upload field (CSV) (React)
- Submit (React)

**On Submit:** (Node.js)
- System identifies the teacher from the session (Node.js + MySQL)
- Associates all data from the CSV to that teacher + class (Node.js + MySQL)

---

### 🧑‍🎓 Student Dashboard (React)
- Linked via `student_number` (from login) (Node.js + MySQL)
- Displays: (React)
  - Classes they are enrolled in (MySQL)
  - Assignments + grades per class (grouped view) (React + MySQL)
  - Optionally: progress charts, recent feedback (React + MySQL)

---

### 👩‍👦 Parent Dashboard (React)
- Accessed by entering: (React)
  - Student number (React)
  - Parent access code (React + Node.js)
- Displays: (React)
  - Same information as the student view (React + MySQL)
  - Possibly read-only with limited detail (e.g., no comments) (React)

---

[README.md] (Frontend: React, Backend: Node.js, Database: MySQL)
