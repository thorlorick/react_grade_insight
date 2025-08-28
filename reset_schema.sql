-- =====================================================
-- DATABASE SCHEMA RESET SCRIPT
-- =====================================================

-- Step 1: Drop all existing tables (in reverse dependency order)
DROP TABLE IF EXISTS login_attempt;
DROP TABLE IF EXISTS parent_student;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS uploads;
DROP TABLE IF EXISTS parents;
DROP TABLE IF EXISTS teachers;

-- Step 2: Create tables with your corrected schema

CREATE TABLE teachers ( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL, 
  password_hash VARCHAR(255) NOT NULL, 
  school_name VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);

CREATE TABLE uploads ( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  teacher_id INT NOT NULL, 
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  filename VARCHAR(255), 
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE 
);

CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE assignments ( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  teacher_id INT NOT NULL, 
  upload_id INT, 
  name VARCHAR(255) NOT NULL, 
  due_date DATE, 
  max_points INT, 
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE, 
  FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE SET NULL 
);

CREATE TABLE grades ( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  student_id INT NOT NULL, 
  assignment_id INT NOT NULL, 
  teacher_id INT NOT NULL, 
  upload_id INT, 
  grade FLOAT, 
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE, 
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE, 
  FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE, 
  FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE SET NULL 
);

CREATE TABLE parents ( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL, 
  email VARCHAR(255) UNIQUE NOT NULL, 
  password_hash VARCHAR(255) NOT NULL, 
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE parent_student ( 
  parent_id INT NOT NULL, 
  student_id INT NOT NULL, 
  PRIMARY KEY (parent_id, student_id), 
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE, 
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE 
);

CREATE TABLE login_attempt ( 
  attempt_id INT AUTO_INCREMENT PRIMARY KEY, 
  user_email VARCHAR(255) NOT NULL, 
  ip_address VARCHAR(45) DEFAULT NULL, 
  attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP, 
  status ENUM('success', 'failure') NOT NULL 
);

-- Step 3: Insert a test teacher account
-- Password: 'testpass123' (hashed with bcrypt)
INSERT INTO teachers (name, email, password_hash) VALUES 
('Test Teacher', 'teacher@test.com', '$2b$10$k5Y1hXWP3gOdXjz5kOgN0.YFrVOT2pE8FjMCH5FzMt9w4sP4Cs3kG');

-- Verify the setup
SELECT 'Database reset complete!' AS status;
SELECT 'Test teacher created with:' AS info;
SELECT name, email, 'Password: testpass123' AS credentials FROM teachers WHERE email = 'teacher@test.com';

-- Show table structure for verification
SHOW TABLES;