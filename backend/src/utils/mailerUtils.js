const nodemailer = require('nodemailer');
const logger = require('./logger');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const sendResetEmail = async (email_address, link) => {
  try {
    logger.info(`START: Sending password reset link to ${email_address}`);
    await transporter.sendMail({
      from: `"BeRoStock" <${process.env.GMAIL_USER}>`,
      to: email_address,
      subject: 'Your Password Reset Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f8ff; border-radius: 10px;">
          <h1 style="color: #1a73e8; text-align: center;">Password Reset Link</h1>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5; text-align: center;">Use this Link to reset your password:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${link}" style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 20px;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;"><em>This Link will expire in 10 minutes.</em></p>
        </div>
      `
    });
    logger.info(`END: Sent reset link to ${email_address}`);
  } catch (error) {
    logger.error(`END: Email send failed: ${error.message}`);
    throw error;
  }
};

const sendVerificationEmail = async ({ to, name, code }) => {
  try {
    await transporter.sendMail({
      from: `"BeRoStock" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Your Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f8ff; border-radius: 10px;">
          <h1 style="color: #1a73e8; text-align: center;">Verify Your Email</h1>
          <p style="color: #4a4a4a; font-size: 16px;">Hi ${name},</p>
          <p style="color: #4a4a4a; font-size: 16px;">Use the verification code below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; font-size: 32px; font-weight: bold; color: #1a73e8; letter-spacing: 4px;">${code}</div>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;"><em>This code will expire in 15 minutes.</em></p>
        </div>
      `
    });
    logger.info(`Verification code email sent to ${to}`);
  } catch (error) {
    logger.error(`Email send failed: ${error.message}`);
    throw error;
  }
}

const sendSecurityAlertEmail = async (email) => {
  return transporter.sendMail({
    from: `"BeRoStock Security" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Password Changed",
    html: `
      <p style="font-family: Arial, sans-serif; font-size: 16px;">
        This is a confirmation that your password was changed.
        If you did not initiate this change, please reset your password immediately or contact support.
      </p>
    `
  });
};


const sendLoginCredentials = async (email, password, fullName) => {
  const mailOptions = {
    from: `"Bennyrose Inventory" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your Login Credentials",
    html: `
      <p>Hi ${fullName},</p>
      <p>Your account has been created on the Bennyrose Inventory system.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Use this to log in at: <a href="http://berostock.onrender.com/login">Login Page</a></p>
      <p>Please change your password after logging in.</p>
      <p>Regards,<br/>Bennyrose Admin Team</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail, sendVerificationEmail, sendSecurityAlertEmail, sendLoginCredentials };



// const nodemailer = require('nodemailer');
// const logger = require('./logger');
// require('dotenv').config();



// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASS
//   }
// });


// const sendResetEmail = async (email_address, link) => {
//   try {
//     logger.info(`START: Sending password reset link to ${email_address}`);
//     await transporter.sendMail({
//       from: `"BeRoStock" <${process.env.GMAIL_USER}>`,
//       to: email_address,
//       subject: 'Your Password Reset Link',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f8ff; border-radius: 10px;">
//           <h1 style="color: #1a73e8; text-align: center;">Password Reset Link</h1>
//           <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5; text-align: center;">Use this Link to reset your password:</p>
//           <div style="text-align: center; margin: 25px 0;">
//             <a href="${link}" style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 20px;">Reset Password</a>
//           </div>
//           <p style="color: #666; font-size: 14px; text-align: center;"><em>This Link will expire in 10 minutes.</em></p>
//         </div>
//       `
//     });
//     logger.info(`END: Sent reset link to ${email_address}`);
//   } catch (error) {
//     logger.error(`END: Email send failed: ${error.message}`);
//     throw error;
//   }
// };

// const sendVerificationEmail = async ({ to, token }) => {
//   //const link = `${process.env.CLIENT_BASE_URL}/verify-email?token=${token}`;
//   const link = `${process.env.API_BASE_URL}/api/v1/auth/verify-email?token=${token}`;


//   try {
//     await transporter.sendMail({
//       from: `"BeRoStock" <${process.env.GMAIL_USER}>`,
//       to,
//       subject: 'Your Verification Link',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f8ff; border-radius: 10px;">
//           <h1 style="color: #1a73e8; text-align: center;">Email Verification</h1>
//           <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">Please click the link below to verify your account:</p>
//           <div style="text-align: center; margin: 25px 0;">
//             <a href="${link}" style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Account</a>
//           </div>
//           <p style="color: #666; font-size: 14px; text-align: center;"><em>This link will expire in 10 minutes.</em></p>
//         </div>
//       `
//     });
//     logger.info(`Verification email sent to ${to}`);
//   } catch (error) {
//     logger.error(`Email send failed: ${error.message}`);
//     throw error;
//   }
// }

// module.exports = { sendResetEmail, sendVerificationEmail };