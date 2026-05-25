const nodemailer = require('nodemailer');

/**
 * Sends a premium-styled HTML email using Nodemailer and SMTP.
 * Supports OTP codes, headers, custom texts, and standard recovery parameters.
 */
const sendEmail = async (options) => {
  const { 
    email, 
    subject, 
    title, 
    body, 
    ctaText, 
    ctaLink,
    // Supporting custom OTP parameters from controller
    headerTitle,
    bodyText,
    code,
    expiryMinutes 
  } = options;

  // Create NodeMailer SMTP Transporter configured for Gmail service
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Resolve content dynamically based on the passed parameters
  const emailTitle = headerTitle || title || 'Authentication Request';
  const emailBody = bodyText || body || 'Please verify your credentials below:';

  // Construct a premium HTML email template with dark aesthetics, modern fonts, and glassmorphic badges
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #06060c;
          color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #0d0d17;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .header {
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 1px;
        }
        .content {
          padding: 40px 30px;
          line-height: 1.6;
        }
        .content h2 {
          color: #f8fafc;
          font-size: 20px;
          margin-top: 0;
          font-weight: 600;
        }
        .content p {
          color: #94a3b8;
          font-size: 15px;
          margin-bottom: 25px;
        }
        
        /* Premium OTP Code Presentation */
        .otp-container {
          background: rgba(255, 255, 255, 0.03);
          border: 1px dashed rgba(6, 182, 212, 0.3);
          border-radius: 8px;
          padding: 25px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-family: 'Courier New', Courier, monospace;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 6px;
          color: #06b6d4;
          margin: 0 0 10px;
        }
        .otp-expiry {
          font-size: 12px;
          color: #f59e0b;
          font-weight: 600;
        }

        .btn-wrapper {
          text-align: center;
          margin: 35px 0;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 28px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 6px;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
          transition: all 0.3s ease;
        }
        .footer {
          background-color: rgba(255,255,255,0.02);
          padding: 20px 30px;
          border-top: 1px solid rgba(255,255,255,0.05);
          text-align: center;
          font-size: 12px;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>VELOCE AUTHENTICATION</h1>
        </div>
        <div class="content">
          <h2>${emailTitle}</h2>
          <p>${emailBody}</p>

          ${
            code
              ? `
            <div class="otp-container">
              <div class="otp-code">${code}</div>
              <div class="otp-expiry">⚠️ This code expires in ${expiryMinutes || 10} minutes</div>
            </div>
            `
              : ''
          }

          ${
            ctaLink
              ? `
            <div class="btn-wrapper">
              <a href="${ctaLink}" class="btn" target="_blank">${ctaText || 'Click Here'}</a>
            </div>
            `
              : ''
          }
          <p style="font-size: 13px; color: #64748b; margin-top: 30px;">
            If you did not initiate this request, please ignore this email or contact our support team.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Veloce Inc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Veloce Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mail Dispatch Successful] Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Mail Dispatch Failed] Error: ${error.message}`);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

module.exports = sendEmail;
