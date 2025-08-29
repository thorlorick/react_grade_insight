// backend/src/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test email connection
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
};

// Send password creation email
const sendPasswordCreationEmail = async (studentEmail, studentName, token) => {
  const passwordCreationUrl = `${process.env.BASE_URL || 'https://localhost:8083'}/create-password/${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: studentEmail,
    subject: 'Create Your Password - Grade Insight',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Grade Insight, ${studentName}!</h2>
        
        <p>Your teacher has added you to Grade Insight, where you can view your assignments and grades.</p>
        
        <p>To get started, please create your password by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${passwordCreationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Create My Password
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${passwordCreationUrl}</p>
        
        <p><strong>Important:</strong> This link will expire in 48 hours for security reasons.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't expect this email, please ignore it or contact your teacher.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password creation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send password creation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  testEmailConnection,
  sendPasswordCreationEmail,
};