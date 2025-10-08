# 📘 Grade Insight — README

A simple, web-based grade viewer for teachers, students, and parents. Built using [React.js], [Node.js], and [MySQL].

---

### 🧭 High-Level User Flow
# 🔐 Login Pages (React)

Separate login forms for each user type:

Teacher login

Student login

Parent login

Simple, intuitive forms with minimal fields to get users into their dashboards quickly.

System securely verifies credentials in the database (Node.js + MySQL) and redirects to the correct dashboard.

---

### 🧑‍🏫 Teacher Dashboard (React)

- Linked to their teacher_id. (MySQL)
- Displays: (React)
  - All their students in one convenient table (React + MySQL)
  - Upload CSV button -- get the CSV right from your computer.
  - Download Template allows for using our standard CSV
  - Click a student row to bring up a detailed view
  - Add student specific and private notes in the detailed view

---

### 📤 Uploads

**On submit:**  
- System knows teacher from session (Node.js)
- Associates everything from CSV to that teacher (Node.js + MySQL)
- Cleans headers to make everything consistent

---

### 🧑‍🎓 Student Dashboard (React)

- Linked via student_id/email (from login) (MySQL)
- Displays: (React)
  - Assignments + grades in an easy to read table
  - **Student-only comments from teacher** (React + MySQL) 
---

### 👩‍👦 Parent Dashboard (React)

- linked to each student separately to allow for viewing multiple children in one dashboard
- secure login
- Displays: (React)
  - Assignments + grades in an easy to read table
  - **Student Comments from teacher** (React + MySQL) 

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

---

## 🗃️ The Grades Table

All grade data is stored in a central table with these key fields:

```sql
grades
-------
id               -- unique row id
teacher_id       -- who uploaded the grade
student_id       -- who the grade is for
assignment_id    -- which assignment
grade            -- the actual grade
uploaded_at      -- timestamp of upload

 

🔒 Safe by Design

    ✅ One teacher = one sandbox

    ✅ No accidental overwrites

    ✅ Multiple teachers per student fully supported

    ✅ Simple upload flow: one file, one click, done

Grade Insight handles the complexity — so you don’t have to.

☕ Upload your file.
✅ We’ll handle the rest.
