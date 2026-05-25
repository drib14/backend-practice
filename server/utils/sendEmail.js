const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Gorgeous Responsive Keyshien Pink HTML Email Template
  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #FFF1F2;
          color: #4C0519;
          -webkit-font-smoothing: antialiased;
        }
        .email-wrapper {
          width: 100%;
          background-color: #FFF1F2;
          padding: 40px 0;
        }
        .email-container {
          max-width: 500px;
          margin: 0 auto;
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid rgba(236, 72, 153, 0.2);
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(76, 5, 25, 0.08);
        }
        .email-header {
          background: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%);
          padding: 35px 20px;
          text-align: center;
        }
        .email-header h1 {
          margin: 0;
          color: #FFFFFF;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .email-body {
          padding: 40px 30px;
          text-align: center;
        }
        .email-body p {
          font-size: 16px;
          line-height: 1.6;
          color: #881337;
          margin-top: 0;
          margin-bottom: 24px;
        }
        .code-box {
          background-color: #FFF1F2;
          border: 2px dashed #EC4899;
          color: #EC4899;
          font-size: 34px;
          font-weight: 800;
          letter-spacing: 8px;
          padding: 16px 24px;
          border-radius: 14px;
          display: inline-block;
          margin: 20px 0;
          box-shadow: 0 0 15px rgba(236, 72, 153, 0.1);
        }
        .expiry-text {
          font-size: 13px;
          color: #D97706;
          margin-top: 8px;
          font-weight: 600;
        }
        .email-footer {
          background-color: #FFF1F2;
          padding: 20px;
          text-align: center;
          border-top: 1px solid rgba(236, 72, 153, 0.1);
        }
        .email-footer p {
          margin: 0;
          font-size: 12px;
          color: #9F1239;
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <div class="email-header">
            <h1>${options.headerTitle || "Keyshien's Accessories"}</h1>
          </div>
          <div class="email-body">
            <p>${options.bodyText}</p>
            <div class="code-box">${options.code}</div>
            ${options.expiryMinutes < 9999 ? `<p class="expiry-text">This recovery code is secure and will expire in ${options.expiryMinutes} minutes.</p>` : ''}
            <p style="margin-top: 30px; font-size: 14px; color: #9F1239;">If you didn't request this action, you can safely ignore this email.</p>
          </div>
          <div class="email-footer">
            <p>&copy; 2026 Keyshien's Accessories. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Message object
  const message = {
    from: `"Keyshien Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: htmlTemplate,
  };

  // Send mail
  await transporter.sendMail(message);
};

module.exports = sendEmail;
