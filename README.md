# react_grade_insight
react, node.js, mysql project for real time grade updates


Grade Insight

A simple, secure tool for teachers to upload CSV gradebooks and for students and parents to view grades by class and assignment.
Features

    Teachers upload CSV files containing students’ grades, assignments, and metadata.

    System automatically:

        Parses CSVs

        Creates or updates classes, assignments, students, and grades

        Generates secure parent access codes stored separately

    Students and parents can log in to view their grades, organized by class.

    Minimal teacher effort: just upload and view.

Technology Stack

    Frontend: React.js (client-side UI and forms)

    Backend: Node.js + Express (API and business logic)

    Database: MySQL (relational data storage)

    Security: Parent access codes hashed and stored separately

Database Design Highlights

    teachers: Stores teacher accounts

    classes: Represents subjects or courses

    students: Student personal info

    assignments: Individual graded items with metadata

    grades: Student scores per assignment

    uploads: Records each CSV upload event

    parent_access_codes: Secure hashed codes linked to students for parental access

User Roles

    Teacher (Rick): Upload CSVs, view dashboards, receive parent access codes

    Student (Jane): Log in to view grades by class

    Parent: Log in with student number + access code to view student grades

Next Steps

    Build backend API to accept CSV uploads and process data

    Develop React frontend for upload form, dashboards, and login views

    Implement secure authentication for all users

    Add reporting and notifications for parent access codes
