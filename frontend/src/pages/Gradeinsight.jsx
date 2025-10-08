import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import ContactEmailModal from '../components/ContactEmailModal';
import styles from './Gradeinsight.module.css';

const GradeInsight = () => {
  const [showContactModal, setShowContactModal] = useState(false);

  const navLinks = [
    { to: '/TeacherLogin', label: 'Teachers' },
    { to: '/StudentLogin', label: 'Students' },
    { to: '/ParentLogin', label: 'Parents' },
    { label: 'Contact', onClick: () => setShowContactModal(true) }
  ];

  return (
    <div className={styles.body}>
      <Navbar brand="Grade Insight" links={navLinks} />

      <BackgroundContainer image="/images/insightBG.jpg">
        <h1 className={styles.heroText}>
          Grade Insight.<br />
          When Good Isn't Enough.
        </h1>
      </BackgroundContainer>

      <main>
        {/* Features Section */}
        <section id="features" className={styles.section} aria-labelledby="features-heading">
          <div className={styles.sectionHeader}>
            <h3 id="features-heading" className={styles.sectionTitle}>
              Designed for simplicity and speed
            </h3>
            <p className={styles.sectionSubtitle}>
              How it works — built around teachers, students, and parents.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🔐</div>
              <div className={styles.featureTitle}>Separate Logins</div>
              <p className={styles.featureDesc} style={{ paddingLeft: 16, marginTop: 8 }}>
                Teachers, students, and parents each have their own simple and secure login form.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <div className={styles.featureTitle}>Teacher Dashboard</div>
              <ul className={styles.featureDesc} style={{ paddingLeft: 16, marginTop: 8 }}>
                <li>Manage all students in one convenient table.</li>
                <li>Upload CSVs directly from your computer.</li>
                <li>Click a student row for detailed info and private notes.</li>
              </ul>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🧑‍🎓</div>
              <div className={styles.featureTitle}>Student Dashboard</div>
              <ul className={styles.featureDesc} style={{ paddingLeft: 16, marginTop: 8 }}>
                <li>View assignments and grades in an easy-to-read table.</li>
                <li>See student-only comments from teachers.</li>
              </ul>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>👪</div>
              <div className={styles.featureTitle}>Parent Dashboard</div>
              <ul className={styles.featureDesc} style={{ paddingLeft: 16, marginTop: 8 }}>
                <li>Linked to each child separately.</li>
                <li>View assignments, grades, and student comments.</li>
              </ul>
            </article>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className={`${styles.section} ${styles.testimonialSection}`} aria-labelledby="testimonials-heading">
          <div className={styles.sectionHeader}>
            <h3 id="testimonials-heading" className={styles.sectionTitle}>Trusted by Educators</h3>
            <p className={styles.sectionSubtitle}>Hear from teachers using Grade Insight in the classroom.</p>
          </div>

          <div className={styles.testimonialsGrid}>
            <blockquote className={styles.testimonialCard}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className={styles.testimonialAvatar}>JS</div>
                <div>
                  <div className={styles.testimonialName}>Jack Hansert</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>High School Math</div>
                </div>
              </div>
              <p className={styles.testimonialText}>
                "Grade Insight helped me give more personalized feedback to students and uploading grades is now effortless.
                I can import CSVs from Google Classroom in seconds."
              </p>
            </blockquote>

            <blockquote className={styles.testimonialCard}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className={styles.testimonialAvatar}>RM</div>
                <div>
                  <div className={styles.testimonialName}>Ravi Mehta</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>Parent</div>
                </div>
              </div>
              <p className={styles.testimonialText}>
                "I can finally see my child’s progress in one place — no more juggling spreadsheets and emails.
                With Grade Insight, it's all right there in one convenient place."
              </p>
            </blockquote>

            <blockquote className={styles.testimonialCard}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className={styles.testimonialAvatar}>AL</div>
                <div>
                  <div className={styles.testimonialName}>Alicia Lopez</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>District Admin</div>
                </div>
              </div>
              <p className={styles.testimonialText}>
                "We deployed Grade Insight district-wide and saw consistent improvements in parent and student engagement.
                Knowing instantly how a student is doing or what they are missing is invaluable."
              </p>
            </blockquote>
          </div>
        </section>

        {/* Uploads Section */}
        <section id="uploads" className={`${styles.section} ${styles.uploadsSection}`} aria-labelledby="uploads-heading">
          <div className={styles.sectionHeader}>
            <h3 id="uploads-heading" className={styles.sectionTitle}>Upload Grades the Right Way</h3>
            <p className={styles.sectionSubtitle}>
              Only our template ensures correct parsing — accurate, reliable, and error-free.
            </p>
          </div>

          <div className={styles.uploadsGrid}>
            <div className={styles.uploadCard}>
              <div className={styles.uploadTitle}>CSV & Google Classroom</div>
              <p className={styles.uploadDesc}>
                Use our standard CSV template or download CSVs directly from Google Classroom and upload them as-is — no cleaning or formatting required.
              </p>
            </div>

            <div className={styles.uploadCard}>
              <div className={styles.uploadTitle}>Patent-Pending Parsing System</div>
              <p className={styles.uploadDesc}>
                Our patent-pending parsing system ensures consistency and accuracy when mapping grades and fields.
                Optional per-student comments can be included for both students and parents.
              </p>
            </div>
        </section>

        {/* Student Details Section */}
<section id="student-details" className={`${styles.section} ${styles.uploadsSection}`} aria-labelledby="student-details-heading">
  <div className={styles.sectionHeader}>
    <h3 id="student-details-heading" className={styles.sectionTitle}>Student Details & Notes</h3>
    <p className={styles.sectionSubtitle}>
      Click any student row to open a detailed modal where you can view their grades, add private notes, and see an overview of their progress — all in one place.
    </p>
  </div>

  <div className={styles.uploadsGrid}>
    <div className={styles.uploadCard}>
      <div className={styles.uploadTitle}>Personalized Information</div>
      <p className={styles.uploadDesc}>
        Keep track of student progress and add private teacher notes in a single, easy-to-access modal.
      </p>
    </div>
  </div>
</section>


        {/* Security Section */}
        <section id="security" className={`${styles.section} ${styles.securitySection}`} aria-labelledby="security-heading">
          <div className={styles.sectionHeader}>
            <h3 id="security-heading" className={styles.sectionTitle}>Safe by Design</h3>
            <p className={styles.sectionSubtitle}>Built to prevent mistakes and protect student data.</p>
          </div>

          <div className={styles.securityList}>
            <div className={styles.securityItem}>One teacher = one sandbox.</div>
            <div className={styles.securityItem}>No accidental overwrites.</div>
            <div className={styles.securityItem}>Multiple teachers per student fully supported.</div>
            <div className={styles.securityItem}>Simple upload flow: one file, one click, done.</div>
          </div>
        </section>

        {/* Anchors to avoid dead links */}
        <section id="pricing" aria-hidden="true" style={{ height: 1 }} />
        <section id="contact" aria-hidden="true" style={{ height: 1 }} />
      </main>

      {showContactModal && <ContactEmailModal onClose={() => setShowContactModal(false)} />}
    </div>
  );
};

export default GradeInsight;
