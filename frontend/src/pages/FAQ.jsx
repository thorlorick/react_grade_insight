import React, { useState } from "react";
import Navbar from "../components/Navbar";
import BackgroundContainer from "../components/BackgroundContainer";
import ContactEmailModal from "../components/ContactEmailModal";
import styles from "./Gradeinsight.module.css";

const FAQ = () => {
  const [showContactModal, setShowContactModal] = useState(false);

  const navLinks = [
    { to: "/TeacherLogin", label: "Teachers" },
    { to: "/StudentLogin", label: "Students" },
    { to: "/ParentLogin", label: "Parents" },
    { label: "Contact", onClick: () => setShowContactModal(true) },
  ];

  return (
    <div className={styles.body}>
      <Navbar brand="Grade Insight" links={navLinks} />

      {/* HERO */}
      <BackgroundContainer image="/images/insightBG.jpg">
        <h1 className={styles.heroText}>
          Questions?
          <br />
          We've Got Answers.
        </h1>
      </BackgroundContainer>

      <main>
        {/* GENERAL */}
        <section className={styles.section}>
          <SectionHeader
            title="General"
            subtitle="Understanding how Grade Insight works."
          />

          <FAQGrid>
            <FAQItem
              q="What is Grade Insight?"
              a="Grade Insight allows teachers to upload grades and gives students and parents a secure online view of academic progress."
            />
            <FAQItem
              q="Who can use Grade Insight?"
              a="Teachers, students, and parents with accounts created by their teacher or school."
            />
            <FAQItem
              q="Do I need to install anything?"
              a="No installation required. Grade Insight runs entirely in your web browser."
            />
          </FAQGrid>
        </section>

        {/* STUDENTS & PARENTS */}
        <section className={styles.section}>
          <SectionHeader
            title="Students & Parents"
            subtitle="Viewing grades and accessing accounts."
          />

          <FAQGrid>
            <FAQItem
              q="How do I log in?"
              a="Go to the Students section and enter your email and password. If it is your first time logging in, you will be prompted to create a new password."
            />
            <FAQItem
              q="Why can't I see other students' grades?"
              a="Accounts are restricted so users can only view their own information."
            />
            <FAQItem
              q="My grades look incorrect."
              a="Contact your teacher directly. Grade Insight displays grades exactly as uploaded."
            />
            <FAQItem
              q="How often are grades updated?"
              a="Grades update whenever a teacher uploads a new CSV."
            />
            <FAQItem
              q="Can parents have their own account?"
              a="Yes. A parent can create their own account and link it to their children's grade page."
            />
          </FAQGrid>
        </section>

        {/* TEACHERS */}
        <section className={styles.section}>
          <SectionHeader
            title="Teachers"
            subtitle="Uploading and managing grade data."
          />

          <FAQGrid>
            <FAQItem
              q="How do I upload grades?"
              a="Download the CSV template, add grades, and upload it through the teacher dashboard."
            />
            <FAQItem
              q="What format must the CSV follow?"
              a="Assignment names, dates, max points, and student emails must match the provided template."
            />
            <FAQItem
              q="Can I edit grades later?"
              a="Uploading a new CSV replaces previous data for that class. There is also a Manage Data section to allow for small changes."
            />
            <FAQItem
              q="Is student data secure?"
              a="Yes. Each teacher operates in an isolated, secure environment."
            />
          </FAQGrid>
        </section>

        {/* TECHNICAL */}
        <section className={styles.section}>
          <SectionHeader
            title="Technical Questions"
            subtitle="Common troubleshooting answers."
          />

          <FAQGrid>
            <FAQItem
              q="What browsers are supported?"
              a="Chrome, Edge, Firefox, and Safari."
            />
            <FAQItem
              q="I forgot my password."
              a="Use the password reset option or contact your teacher."
            />
            <FAQItem
              q="The site isn't loading correctly."
              a="Try refreshing or clearing your browser cache."
            />
          </FAQGrid>
        </section>
      </main>

      <div className={styles.faqContactContainer}>
  <p className={styles.faqContactText}>Didn't find what you were looking for?</p>
  <a 
    href="mailto:support@gradeinsight.com"
    className={styles.faqContactButton}
  >
    Contact Support
  </a>
</div>

      {showContactModal && (
        <ContactEmailModal onClose={() => setShowContactModal(false)} />
      )}
    </div>
  );
};

export default FAQ;

/* ---------- SMALL COMPONENTS ---------- */

const SectionHeader = ({ title, subtitle }) => (
  <div className={styles.sectionHeader}>
    <h3 className={styles.sectionTitle}>{title}</h3>
    <p className={styles.sectionSubtitle}>{subtitle}</p>
  </div>
);

const FAQGrid = ({ children }) => (
  <div className={styles.featuresGrid}>{children}</div>
);

const FAQItem = ({ q, a }) => (
  <article className={styles.featureCard}>
    <div className={styles.featureTitle}>{q}</div>
    <p className={styles.featureDesc}>{a}</p>
  </article>
);
