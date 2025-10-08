# 📘 Grade Insight — README

A web-based grade viewer for teachers, students, and parents. Built using **React.js**, **Node.js**, and **MySQL**.

Grade Insight is designed for **simplicity and ease of use**, making grade management fast and intuitive.

---

## 🧭 High-Level User Flow

### 🔐 Login Pages (React)

- **Separate login forms** for each user type:  
  - Teacher  
  - Student  
  - Parent  
- Simple, intuitive forms with minimal fields to get users into their dashboards quickly.  
- Credentials are securely verified in the database (Node.js + MySQL) and users are redirected to the correct dashboard.

---

### 🧑‍🏫 Teacher Dashboard (React)

- Linked to their `teacher_id` (MySQL)  
- Displays:  
  - **All students in one convenient table** (React + MySQL)  
  - Upload CSV button — upload directly from your computer  
  - Download Template — use our standard CSV template  
  - Click a student row to view detailed information  
  - Add **student-specific, private notes** in the detailed view  

---

### 📤 Uploads

**On submit:**  
- System knows teacher from session (Node.js)  
- Associates everything from CSV with that teacher (Node.js + MySQL)  
- Cleans and normalizes headers for consistency  

**Special feature:**  
- Upload directly from Google Classroom CSVs using our **patent-pending parsing system**  

---

### 🧑‍🎓 Student Dashboard (React)

- Linked via `student_id`/email (from login) (MySQL)  
- Displays:  
  - Assignments + grades in an **easy-to-read table** (React + MySQL)  
  - **Student-only comments from teachers**  

---

### 👩‍👦 Parent Dashboard (React)

- Linked to each student separately, allowing multiple children in one dashboard  
- Secure login  
- Displays:  
  - Assignments + grades in an **easy-to-read table**  
  - **Student comments from teachers**  

---

## 💾 Core Database Entities (MySQL)

- `teachers` — id, name, email, password_hash  
- `students` — id, name, student_number  
- `parents` — id, access_code_hash, student_id  
- `classes` — id, name, teacher_id  
- `assignments` — id, class_id, name, date, max_points  
- `grades` — id, assignment_id, student_id, score  
- `student_comments` — id, student_id, teacher_id, class_id, comment_text, timestamp  

---

## 🛠 Stack

- Frontend: **React.js**  
- Backend: **Node.js**  
- Database: **MySQL**  
- Authentication: Session or token-based (TBD)  

---

# Grade Insight

## ☕ Upload Before the Coffee Is Poured

Grade Insight is built on one core philosophy:

> **Teachers should be able to download grades from Google Classroom and upload them here — all before their coffee is poured.**

No setup. No friction. Just **set it and forget it.**

---

## 🧠 How It Works

- Each teacher has a unique account (`teacher_id`)  
- CSV uploads are automatically tagged with the teacher’s ID  
- Grades are stored in a shared `grades` table, **scoped to each teacher**  
- No teacher can overwrite another teacher’s data  

---

## 🗃️ The Grades Table

All grade data is stored centrally with these key fields:

```sql
grades
-------
id             -- unique row id
teacher_id     -- who uploaded the grade
student_id     -- who the grade is for
assignment_id  -- which assignment
grade          -- the actual grade
uploaded_at    -- timestamp of upload
