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

/* USE WHAT EVER SCHEMA.SQL IS MOST UP TO DATE HERE */

-- Step 3: Insert a test teacher account
-- Password: 'testpass123' (hashed with bcrypt)
INSERT INTO teachers (first_name, last_name, email, password_hash, school_name) VALUES 
('Test', 'Teacher', 'teacher@test.com', '$2b$10$k5Y1hXWP3gOdXjz5kOgN0.YFrVOT2pE8FjMCH5FzMt9w4sP4Cs3kG', 'Test High School');

-- Verify the setup
SELECT 'Database reset complete!' AS status;

-- Show table structure for verification
SHOW TABLES;