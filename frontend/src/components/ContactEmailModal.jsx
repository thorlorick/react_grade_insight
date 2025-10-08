import React, { useState } from 'react';
import styles from './ContactEmailModal.module.css';

const ContactEmailModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('https://gradeinsight.com:8083/api/contact-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
        setEmail('');
        onClose();
      } else {
        console.error('Failed to send email', res.status);
      }
    } catch (err) {
      console.error('Error sending email', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Contact Us</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className={styles.content}>
         <div className={styles.fakeEmail}>
  Hey Grade Insight Team,<br /><br />
  I’m a teacher and I think your app would work really well in my classroom. 
  I’d love to learn more about how it works and what I need to do to get started. 
  Could you please send me some information?<br /><br />
  Thanks so much,<br />
</div>
          <input
            type="email"
            placeholder="your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.emailInput}
            disabled={sent}
          />

          <button
            onClick={handleSend}
            className={styles.sendButton}
            disabled={loading || !email.trim() || sent}
          >
            {loading ? 'Sending…' : sent ? 'Sent ✓' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactEmailModal;



