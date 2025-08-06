# 📘 Grade Insight — README

A simple, web-based grade viewer for teachers, students, and parents. Built using [React.js], [Node.js], and [MySQL].

---

## 🧭 High-Level User Flow

### 🔐 Login Page (React)

- All users (teacher, student, parent) go through the same login form. (React)
- System detects user type after login (by looking them up in DB). (Node.js + MySQL)
- Redirects them to the correct dashboard. (React)

---

### 🧑‍🏫 Teacher Dashboard (React)

- Linked to their teacher_id. (MySQL)
- Displays: (React)
  - All their classes (React + MySQL)
  - Upload CSV button (opens generic upload form) (React)
  - Optionally: recent uploads / file history (React + MySQL)

---

### 📤 Upload Page (generic) (React)

- Class name input (or dropdown if class exists) (React + Node.js)
- File upload field (CSV) (React)
- Submit (React)

**On submit:**  
- System knows teacher from session (Node.js)
- Associates everything from CSV to that teacher + class (Node.js + MySQL)
- Optionally prompts for per-student comments (React) ← *NEW FEATURE*

---

### 🧑‍🎓 Student Dashboard (React)

- Linked via student_number (from login) (MySQL)
- Displays: (React)
  - Classes they are enrolled in (React + MySQL)
  - Assignments + grades per class (grouped view) (React + MySQL)
  - Optionally: progress charts, recent feedback (React)
  - **Student-only comments from teacher** (React + MySQL) ← *NEW FEATURE*

---

### 👩‍👦 Parent Dashboard (React)

- Linked by entering: (React)
  - Student number (React)
  - Parent access code (Node.js + MySQL)
- Displays: (React)
  - Same info as student view (React + MySQL)
  - Possibly read-only with limited detail (e.g., no comments) (React)
  - **Parent-only comments from teacher** (React + MySQL) ← *NEW FEATURE*

---

## 💾 Core Database Entities (MySQL)

- `teachers` — id, name, email, password_hash  
- `students` — id, name, student_number  
- `parents` — id, access_code_hash, student_id  
- `classes` — id, name, teacher_id  
- `assignments` — id, class_id, name, date, max_points  
- `grades` — id, assignment_id, student_id, score  
- `student_comments` — id, student_id, teacher_id, class_id, comment_text, timestamp  
- `parent_comments` — id, student_id, teacher_id, class_id, comment_text, timestamp  

---

## 🧪 Planned Features

- ✅ Parent access codes generated on CSV upload (Node.js)
- ✅ Generic upload form that auto-links to teacher (React)
- ✅ Commenting system per student (Node.js + MySQL)
- 🧠 **CSV Upload Enhancement:** After upload, teacher can enter optional per-student comments for both student and parent (React)

---

## 🛠 Stack

- Frontend: [React.js]
- Backend: [Node.js]
- Database: [MySQL]
- Authentication: Session or token-based (TBD)


# Grade Insight

## ☕ Upload Before the Coffee Is Poured

Grade Insight is built on one core philosophy:

> **Teachers should be able to download grades from Google Classroom and upload them here — all before their coffee is poured.**

No setup. No friction. Just **"set it and forget it."**

---

## 🧠 How It Works

Every teacher has a unique account (`teacher_id`). When they upload a CSV of grades:

- The system automatically tags all data with their `teacher_id`
- Grades are stored in a shared `grades` table, but **scoped** to each teacher
- No teacher can overwrite another’s data — ever
- Students can appear in multiple classes and see grades from **each teacher independently**

---

## 🗃️ The Grades Table

All grade data is stored in a central table with these key fields:

```sql
grades
-------
id               -- unique row id
teacher_id       -- who uploaded the grade
student_id       -- who the grade is for
class_id         -- class the grade belongs to
assignment_id    -- which assignment
grade            -- the actual grade
uploaded_at      -- timestamp of upload



👩‍🎓 Student View

Students only see grades from the classes they are enrolled in, scoped to their actual teachers. If a mark changes, they can see:

    “Last updated by Mr. Smith on Aug 6, 9:02am.”

🔒 Safe by Design

    ✅ One teacher = one sandbox

    ✅ No accidental overwrites

    ✅ Multiple teachers per student fully supported

    ✅ Simple upload flow: one file, one click, done

Grade Insight handles the complexity — so you don’t have to.

☕ Upload your file.
✅ We’ll handle the rest.
