-- Clear all data from tables while preserving structure
-- Run these in order due to foreign key constraints

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Clear all tables
TRUNCATE TABLE login_attempt;
TRUNCATE TABLE teacher_notes;
TRUNCATE TABLE grades;
TRUNCATE TABLE assignments;
TRUNCATE TABLE uploads;
TRUNCATE TABLE parent_student;
TRUNCATE TABLE parents;
TRUNCATE TABLE students;
TRUNCATE TABLE teachers;
TRUNCATE TABLE sessions; -- Express session table if it exists

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto-increment counters to start from 1
ALTER TABLE teachers AUTO_INCREMENT = 1;
ALTER TABLE uploads AUTO_INCREMENT = 1;
ALTER TABLE students AUTO_INCREMENT = 1;
ALTER TABLE assignments AUTO_INCREMENT = 1;
ALTER TABLE grades AUTO_INCREMENT = 1;
ALTER TABLE parents AUTO_INCREMENT = 1;
ALTER TABLE login_attempt AUTO_INCREMENT = 1;
ALTER TABLE teacher_notes AUTO_INCREMENT = 1;