// user.service.js
const userModel = require('../models/user.model');
const nodemailer = require('nodemailer');
const redisClient = require('../config/redisClient');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports.createUser = async ({ firstname, lastname, email, password }) => {
  if (!firstname || !email || !password) {
    throw new Error('All required fields must be provided');
  }

  const user = await userModel.create({
    fullname: { firstname, lastname },
    email,
    password
  });

  return user;
};

module.exports.sendOTPEmail = async (receiverEmail) => {
  const otp = generateOTP();

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // 465 (SSL) or 587 (TLS)
      secure: true, // true = 465, false = 587
      auth: {
        user: process.env.EMAIL_USER, // e.g. anuabc40312@gmail.com
        pass: process.env.EMAIL_PASS  // your Gmail App Password
      },
      logger: true, // helps debug
      debug: true
    });

    const mailOptions = {
      from: `TradeX <${process.env.EMAIL_USER}>`,
      to: receiverEmail,
      subject: 'Your TradeX OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8f8f8;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2e7d32;">🔐 Your OTP Code</h2>
            <p>Your One-Time Password (OTP) is:</p>
            <h1 style="text-align: center; color: #d32f2f; font-size: 48px; margin: 20px 0;">${otp}</h1>
            <p>This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.</p>
            <hr>
            <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    await redisClient.setEx(`otp:${receiverEmail}`, 300, otp);

    return { success: true, otp };
  } catch (err) {
    console.error('Error sending OTP:', err.message);
    throw new Error('Failed to send OTP email');
  }
};
