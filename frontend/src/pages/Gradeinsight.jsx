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
              A lightweight platform that makes sharing grades simple and clear.
            </p>
          </div>

          <div className={styles.uploadsGrid}>
            <div className={styles.uploadCard}>
              <div className={styles.uploadTitle}>What It Does</div>
              <p className={styles.uploadDesc}>
                Teachers can take their existing grade data from Google Classroom, download it as a CSV file, and upload it directly into Grade Insight. The system automatically organizes everything, giving students and parents a clean, private view of grades — no extra setup or complicated steps.
              </p>
            </div>

            <div className={styles.uploadCard}>
              <div className={styles.uploadTitle}>Why It Exists</div>
              <p className={styles.uploadDesc}>
                Google Classroom handles grading well but doesn't make it easy to share results outside its own system. Teachers often reformat spreadsheets or send screenshots just to keep parents updated. Grade Insight fixes that by turning the grades you already have into an organized dashboard that everyone can understand at a glance.
              </p>
            </div>
          </div>

          <div className={styles.securityList} style={{ marginTop: '24px' }}>
            <div className={styles.uploadTitle} style={{ marginBottom: '12px', paddingLeft: '0' }}>Who It's For</div>
            <div className={styles.securityItem}><strong>Teachers</strong> manage all their students and parents in one place, acting as both teacher and admin.</div>
            <div className={styles.securityItem}><strong>Students</strong> log in to see their own grades and any general comments from their teacher.</div>
            <div className={styles.securityItem}><strong>Parents</strong> have their own logins and can view multiple children's grades (if they're all taught by the same teacher).</div>
          </div>

          <div className={styles.uploadCard} style={{ marginTop: '24px', border: '1px solid rgba(125,211,252,0.2)', background: 'linear-gradient(180deg, rgba(125,211,252,0.03), rgba(125,211,252,0.01))' }}>
            <div className={styles.uploadTitle} style={{ color: '#7dd3fc' }}>The Vision</div>
            <p className={styles.uploadDesc}>
              Grade Insight bridges the gap between classroom grading and real-world communication. It gives teachers control, keeps data private, and helps students and parents stay informed without extra effort.
            </p>
            <p className={styles.uploadDesc} style={{ marginTop: '12px', color: '#a7f3d0', fontWeight: '600' }}>
              One CSV upload turns everyday grade data into real, meaningful insight.
            </p>
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
                Download grades from Google Classroom as a CSV and upload directly — no formatting or cleanup needed. Or use your existing data and format it to our template.
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

        {/* Security & Flow Section */}
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

          <div className={styles.securityList}>
            <div className={styles.securityItem}>Download CSV from Google Classroom → upload to Grade Insight.</div>
            <div className={styles.securityItem}>Teacher sees all students and their averages in easy to read cards.</div>
            <div className={styles.securityItem}>Students see only their grades; parents can see multiple children.</div>
            <div className={styles.securityItem}>Teachers can add general private comments for each student.</div>
            <div className={styles.securityItem}>One teacher = one sandbox, fully secure and isolated.</div>
          </div>

          <div className={styles.uploadsGrid} style={{ marginTop: '32px' }}>
            <div className={styles.uploadCard}>
              <div className={styles.uploadTitle}>Teacher Dashboard</div>
              <img 
                src="/images/grade_cards.png" 
                alt="Teacher dashboard showing student grades and assignments"
                style={{ 
                  width: '100%', 
                  borderRadius: '8px', 
                  marginTop: '12px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
            </div>

            <div className={styles.uploadCard}>
              <div className={styles.uploadTitle}>Individual Student Modal</div>
              <img 
                src="/images/StudentModal.png" 
                alt="Student grade view showing individual assignments"
                style={{ 
                  width: '100%', 
                  borderRadius: '8px', 
                  marginTop: '12px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
            </div>
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
