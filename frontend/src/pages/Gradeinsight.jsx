import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackgroundContainer from '../components/BackgroundContainer';
import LoginContainer from '../components/LoginContainer';
import ContactEmailModal from '../components/ContactEmailModal';
import styles from './Gradeinsight.module.css';

const GradeInsight = () => {
  const [showContactModal, setShowContactModal] = useState(false);

  const navLinks = [
    { to: '/TeacherLogin', label: 'Teachers' },
    { to: '/StudentLogin', label: 'Students' },
    { to: '/ParentLogin', label: 'Parents' },
    { label: 'Contact', onClick: () => setShowContactModal(true) } // Use onClick instead of "to"
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
            <div>
              <h3 id="features-heading" className={styles.sectionTitle}>Designed for simplicity and speed</h3>
              <p className={styles.sectionSubtitle}>How it works — built around teachers, students, and parents.</p>
            </div>
          </div>

          <div className={styles.featuresGrid}>
            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🔐</div>
              <div className={styles.featureTitle}>Separate Logins</div>
              <p className={styles.featureDesc} style={{paddingLeft:16, marginTop:8}}>
                Teachers, students, and parents each have their own simple and secure login form.</p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <div className={styles.featureTitle}>Teacher Dashboard</div>
              <ul className={styles.featureDesc} style={{paddingLeft:16, marginTop:8}}>
                <li>Manage all students in one convenient table.</li>
                <li>Upload CSVs directly from your computer.</li>
                <li>Click a student row for detailed info and private notes.</li>
              </ul>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🧑‍🎓</div>
              <div className={styles.featureTitle}>Student Dashboard</div>
              <ul className={styles.featureDesc} style={{paddingLeft:16, marginTop:8}}>
                <li>View assignments and grades in an easy-to-read table.</li>
                <li>See student-only comments from teachers.</li>
              </ul>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>👪</div>
              <div className={styles.featureTitle}>Parent Dashboard</div>
              <ul className={styles.featureDesc} style={{paddingLeft:16, marginTop:8}}>
                <li>Linked to each child separately.</li>
                <li>View assignments, grades, and student comments.</li>
              </ul>
            </article>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className={`${styles.section} ${styles.testimonialSection}`} aria-labelledby="testimonials-heading">
          <div className={styles.sectionHeader}>
            <div>
              <h3 id="testimonials-heading" className={styles.sectionTitle}>Trusted by educators</h3>
              <p className={styles.sectionSubtitle}>Hear from teachers using GradeInsight in the classroom.</p>
            </div>
          </div>

          <div className={styles.testimonialsGrid}>
            <blockquote className={styles.testimonialCard}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <div className={styles.testimonialAvatar}>JS</div>
                <div>
                  <div className={styles.testimonialName}>Joan Smith</div>
                  <div style={{color:'rgba(255,255,255,0.65)',fontSize:12}}>High School Math</div>
                </div>
              </div>
              <p className={styles.testimonialText}>"GradeInsight cut my grading time in half and helped me give more personalized feedback to students."</p>
            </blockquote>

            <blockquote className={styles.testimonialCard}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <div className={styles.testimonialAvatar}>RM</div>
                <div>
                  <div className={styles.testimonialName}>Ravi Mehta</div>
                  <div style={{color:'rgba(255,255,255,0.65)',fontSize:12}}>College Instructor</div>
                </div>
              </div>
              <p className={styles.testimonialText}>"The analytics highlight class-wide misconceptions, helping me target lessons more effectively."</p>
            </blockquote>

            <blockquote className={styles.testimonialCard}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <div className={styles.testimonialAvatar}>AL</div>
                <div>
                  <div className={styles.testimonialName}>Alicia Lopez</div>
                  <div style={{color:'rgba(255,255,255,0.65)',fontSize:12}}>District Admin</div>
                </div>
              </div>
              <p className={styles.testimonialText}>"We deployed GradeInsight district-wide and saw consistent improvements in turnaround time and reporting."</p>
            </blockquote>
          </div>
        </section>

        {/* Uploads Section */}
        <section id="uploads" className={`${styles.section} ${styles.uploadsSection}`} aria-labelledby="uploads-heading">
          <div className={styles.sectionHeader}>
            <div>
              <h3 id="uploads-heading" className={styles.sectionTitle}>Upload grades your way</h3>
              <p className={styles.sectionSubtitle}>Flexible import options and reliable parsing for seamless updates.</p>
            </div>
          </div>

          <div className={styles.uploadsGrid}>
            <div className={styles.uploadCard}>
              <div className={styles.uploadTitle}>CSV & Google Classroom</div>
              <p className={styles.uploadDesc}>Download our standard CSV template or upload directly from Google Classroom for instant ingestion.</p>
            </div>

            <div className={styles.uploadCard}>
              <div className={styles.uploadTitle}>Accurate parsing</div>
              <p className={styles.uploadDesc}>Our patent-pending parsing system ensures consistency and accuracy when mapping grades and fields.</p>
              <p className={styles.uploadDesc} style={{marginTop:12}}>Optional per-student comments can be included for both students and parents.</p>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className={`${styles.section} ${styles.securitySection}`} aria-labelledby="security-heading">
          <div className={styles.sectionHeader}>
            <div>
              <h3 id="security-heading" className={styles.sectionTitle}>Safe by design</h3>
              <p className={styles.sectionSubtitle}>Built to prevent mistakes and protect student data.</p>
            </div>
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

      {showContactModal && (
        <ContactEmailModal onClose={() => setShowContactModal(false)} />
      )}
    </div>
  );
};

export default GradeInsight;
