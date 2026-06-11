const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
});
module.exports = {
    sendEmail: async (opt) => transporter.sendMail({ from: process.env.EMAIL_USER, ...opt }),
    welcomeEmailTemplate: (name) => `<h1>Welcome ${name}</h1>`,
    passwordResetTemplate: (token) => `<a href="http://localhost:5173/reset-password/${token}">Reset</a>`
};