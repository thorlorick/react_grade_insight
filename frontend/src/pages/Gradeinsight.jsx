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
    { label: 'Contact', onClick: () => setShowContactModal(true) },
  ];

  return (
    <div className={styles.body}>
      <Navbar brand="Grade Insight" links={navLinks} />

      <BackgroundContainer image="/images/insightBG.jpg">
        <h1 className={styles.heroText}>
          Grade Insight.
          <br />
          When Good Isn't Enough.
        </h1>
      </BackgroundContainer>

      <main>
        {/* Overview Section */}
        <section id="overview" className={styles.section} aria-labelledby="overview-heading">
          <div className={styles.sectionHeader}>
            <h3 id="overview-heading" className={styles.sectionTitle}>
              Overview
            </h3>
            <p className={styles.sectionSubtitle}>
              A lightweight platform for clear, shareable grade insights.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', justifyContent: 'space-between' }}>
            <ul className={styles.securityList} style={{ flex: '1 1 400px', listStyle: 'disc', paddingLeft: '20px' }}>
              <li><strong>Teachers:</strong> Upload CSVs directly from Google Classroom — no cleanup needed.</li>
              <li><strong>Students:</strong> View their own grades privately in a simple dashboard.</li>
              <li><strong>Parents:</strong> Access multiple children’s grades under the same teacher account.</li>
              <li><strong>Why It Exists:</strong> To eliminate the hassle of sharing grades through spreadsheets and screenshots.</li>
              <li><strong>Vision:</strong> Bridge the gap between classroom grading and transparent communication.</li>
            </ul>

            <div style={{ display: 'flex', gap: '16px', flex: '1 1 350px', justifyContent: 'center' }}>
              <img
                src="/images/TeachDash.png"
                alt="Teacher dashboard"
                style={{
                  width: '240px',
                  height: 'auto',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                }}
              />
              <img
                src="/images/StudentModal.png"
                alt="Student view"
                style={{
                  width: '240px',
                  height: 'auto',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                }}
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={styles.section} aria-labelledby="features-heading">
          <div className={styles.sectionHeader}>
            <h3 id="features-heading" className={styles.sectionTitle}>
              Getting Started
            </h3>
            <p className={styles.sectionSubtitle}>
              Turn your Google Classroom grades into clear, shareable insights.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🧑‍🏫</div>
              <div className={styles.featureTitle}>Teacher Upload</div>
              <p className={styles.featureDesc}>
                Download grades from Google Classroom as a CSV and upload directly — no formatting or cleanup needed.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>📝</div>
              <div className={styles.featureTitle}>Student Grades</div>
              <p className={styles.featureDesc}>
                Students see only their own assignment grades in a simple dashboard, keeping everything private and secure.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>👪</div>
              <div className={styles.featureTitle}>Parent Access</div>
              <p className={styles.featureDesc}>
                Parents log in separately and can view grades for one or more children under the same teacher.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>💬</div>
              <div className={styles.featureTitle}>Teacher Comments</div>
              <p className={styles.featureDesc}>
                Teachers can leave general, private comments for each student to give feedback outside specific assignments.
              </p>
            </article>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className={`${styles.section} ${styles.testimonialSection}`}
          aria-labelledby="testimonials-heading"
        >
          <div className={styles.sectionHeader}>
            <h3 id="testimonials-heading" className={styles.sectionTitle}>
              Trusted by Educators
            </h3>
            <p className={styles.sectionSubtitle}>
              Hear from teachers using Grade Insight in the classroom.
            </p>
          </div>

          <div className={styles.testimonialsGrid}>
            <blockquote className={styles.testimonialCard}>
              <div className={styles.testimonialHeader}>
                <div className={styles.testimonialAvatar}>JS</div>
                <div>
                  <div className={styles.testimonialName}>Jack Hansert</div>
                  <div className={styles.testimonialRole}>High School Math</div>
                </div>
              </div>
              <p className={styles.testimonialText}>
                "Grade Insight helped me give more personalized feedback to students, and uploading
                grades is now effortless. I can import CSVs from Google Classroom in seconds."
              </p>
            </blockquote>

            <blockquote className={styles.testimonialCard}>
              <div className={styles.testimonialHeader}>
                <div className={styles.testimonialAvatar}>RM</div>
                <div>
                  <div className={styles.testimonialName}>Ravi Mehta</div>
                  <div className={styles.testimonialRole}>Parent</div>
                </div>
              </div>
              <p className={styles.testimonialText}>
                "I can finally see my child's progress in one place — no more juggling spreadsheets
                and emails. With Grade Insight, it's all right there in one convenient place."
              </p>
            </blockquote>

            <blockquote className={styles.testimonialCard}>
              <div className={styles.testimonialHeader}>
                <div className={styles.testimonialAvatar}>AL</div>
                <div>
                  <div className={styles.testimonialName}>Alicia Lopez</div>
                  <div className={styles.testimonialRole}>District Admin</div>
                </div>
              </div>
              <p className={styles.testimonialText}>
                "We deployed Grade Insight district-wide and saw consistent improvements in parent
                and student engagement. Knowing instantly how a student is doing is invaluable."
              </p>
            </blockquote>
          </div>
        </section>

        {/* Security Section */}
        <section
          id="security"
          className={`${styles.section} ${styles.securitySection}`}
          aria-labelledby="security-heading"
        >
          <div className={styles.sectionHeader}>
            <h3 id="security-heading" className={styles.sectionTitle}>
              How It Works
            </h3>
            <p className={styles.sectionSubtitle}>
              Simple, secure, and teacher-controlled.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div className={styles.securityList} style={{ flex: 1 }}>
              <div className={styles.securityItem}>Download CSV from Google Classroom → upload to Grade Insight.</div>
              <div className={styles.securityItem}>Teacher sees all students and assignments in one dashboard.</div>
              <div className={styles.securityItem}>Students see only their grades; parents can see multiple children.</div>
              <div className={styles.securityItem}>Teachers can add general private comments for each student.</div>
              <div className={styles.securityItem}>One teacher = one sandbox, fully secure and isolated.</div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
              <img 
                src="/images/TeachDash.png" 
                alt="Teacher dashboard"
                style={{ 
                  width: '160px',
                  height: 'auto',
                  borderRadius: '6px', 
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              />
              <img 
                src="/images/StudentModal.png" 
                alt="Student view"
                style={{ 
                  width: '160px',
                  height: 'auto',
                  borderRadius: '6px', 
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              />
            </div>
          </div>
        </section>

        {/* Anchors */}
        <section id="pricing" aria-hidden="true" style={{ height: 1 }} />
        <section id="contact" aria-hidden="true" style={{ height: 1 }} />
      </main>

      {showContactModal && <ContactEmailModal onClose={() => setShowContactModal(false)} />}
    </div>
  );
};

export default GradeInsight;
