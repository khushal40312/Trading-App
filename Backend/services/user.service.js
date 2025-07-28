const userModel = require('../models/user.model')
const { default: axios } = require("axios");
const nodemailer = require('nodemailer');
const redisClient = require('../config/redisClient');
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports.createUser = async ({
  firstname, lastname, email, password

}) => {
  if (!firstname, !email, !password) {
    throw new Error('All fields are required')

  }
  const user = userModel.create({

    fullname: {
      firstname,
      lastname
    },
    email,
    password

  })
  return user;


}

module.exports.sendOTPEmail = async (receiverEmail) => {
  const otp = generateOTP();

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'anuabc40312@gmail.com',
        pass: 'jobo yimb zjks blox'
      }
    });

    const mailOptions = {
      from: 'TradeX <anuabc40312@gmail.com>',
      to: receiverEmail,
      subject: 'Your TradeX OTP Code',
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
      html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8f8f8;">
            <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #2e7d32;">🔐 Your OTP Code</h2>
              <p style="font-size: 16px; color: #333;">Hello,</p>
              <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) for TradeX is:</p>
              <h1 style="text-align: center; color: #d32f2f; font-size: 48px; margin: 20px 0;">${otp}</h1>
              <p style="font-size: 14px; color: #666;">This OTP is valid for <strong>5 minutes</strong>. Please do not share this code with anyone.</p>
              <hr style="margin: 30px 0;">
              <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email.</p>
              <p style="font-size: 12px; color: #999;">— TradeX Security Team</p>
            </div>
          </div>
        `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ OTP sent to email!');
    await redisClient.setEx(`otp:${receiverEmail}`, 300, otp);
  } catch (err) {
    console.error('Error sending OTP:', err.response?.data || err.message);
  }
};