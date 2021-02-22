const nodemailer = require('nodemailer');
const catchAsync = require('./catchAsync');

const sendEmail = catchAsync(async (options) => {
  // 1. create transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_ACCOUNT,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2. define email options
  const mailOptions = {
    from: process.env.EMAIL_ACCOUNT,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3. actually send the email
  await transporter.sendMail(mailOptions);
});

module.exports = sendEmail;
