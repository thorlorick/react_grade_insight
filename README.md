# Grade Insight — User Flow Overview

## 🧭 High-Level User Flow

### 🔐 Login Page
- All users (teacher, student, parent) go through the same login form.
- System detects user type after login (by looking them up in DB).
- Redirects them to the correct dashboard.

---

### 🧑‍🏫 Teacher Dashboard
- Linked to their `teacher_id`.
- Displays:
  - All their classes
  - Upload CSV button (opens generic upload form)
  - Optionally: recent uploads / file history

---

### 📤 Upload Page (generic)
- Class name input (or dropdown if class exists)
- File upload field (CSV)
- Submit

**On Submit:**
- System identifies the teacher from the session
- Associates all data from the CSV to that teacher + class

---

### 🧑‍🎓 Student Dashboard
- Linked via `student_number` (from login)
- Displays:
  - Classes they are enrolled in
  - Assignments + grades per class (grouped view)
  - Optionally: progress charts, recent feedback

---

### 👩‍👦 Parent Dashboard
- Accessed by entering:
  - Student number
  - Parent access code
- Displays:
  - Same information as the student view
  - Possibly read-only with limited detail (e.g., no comments)

---

[README.md] (Frontend: React, Backend: Node.js, Database: MySQL)
