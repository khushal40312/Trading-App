const { validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const blacklistTokenModel = require('../models/blacklistToken.model');
const portfolioModel = require('../models/portfolio.model.js');
const redisClient = require('../config/redisClient.js');



module.exports.registerUser = async (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }

    const { fullname, email, password } = req.body;
    const isUserAlreadyExist = await userModel.findOne({ email })
    if (isUserAlreadyExist) {
        return res.status(401).json({ message: "User already exists " })
    }

    const hashedPassword = await userModel.hashPassword(password)

    // Create user first
    const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword
    })

    // Create default portfolio for the new user
    const newPortfolio = new portfolioModel({
        user: user._id,
        assets: [],
        totalInvestment: 0,
        currentValue: 0
    });
    await newPortfolio.save();

    // Link portfolio to user
    user.portfolioId = newPortfolio._id;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    const token = user.generateAuthToken();
    res.cookie('token', token)

    res.status(201).json({ token, userObj })
}
module.exports.loginUser = async (req, res, next) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    const { email, password, otp } = req.body;
    const user = await userModel.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' })
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' })
    }
    const storedOtp = await redisClient.get(`otp:${email}`);
    if (!storedOtp) return res.status(400).json({ message: 'OTP expired or invalid' });
    if (storedOtp !== otp) return res.status(401).json({ message: 'Invalid OTP' });

    // Delete OTP after use
    await redisClient.del(`otp:${email}`);

    const userObj = user.toObject();
    delete userObj.password;
    const token = user.generateAuthToken();
    res.cookie('token', token)
    res.status(200).json({ token, userObj })

}
module.exports.getUserProfile = async (req, res) => {
    try {
        // Send back profile + rides
        res.status(200).json({
            user: req.user,

        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

module.exports.logoutUser = async (req, res, next) => {

    const token = req.params.token; // normalize to uppercase

    await blacklistTokenModel.create({
        token
    });
    res.status(200).json({ message: 'Logged out' });

}
module.exports.updateUserProfile = async (req, res) => {
    const error = validationResult(req)

    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }
    const { fullname, settings } = req.body;

    try {
        const updatedUser = await userModel.findByIdAndUpdate(
            req.user.id,
            {
                fullname: {
                    firstname: fullname.firstname,
                    lastname: fullname.lastname,
                },
                settings: {
                    notifications: settings.notifications,
                    theme: settings.theme,
                    currency: settings.currency
                }
            },
            { new: true })

        res.status(200).json({ updatedUser })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }



}
module.exports.addUserBalance = async (req, res) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
    }

    const { balance, email, password } = req.body;

    try {
        // Find user by email and include password field
        const user = await userModel.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }


        // Update user balance
        const updatedUser = await userModel.findByIdAndUpdate(
            user._id,
            { balance: user.balance + balance },
            { new: true }
        );

        res.status(200).json({ balance: updatedUser.balance });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};
module.exports.getUserBalance = async (req, res) => {
    // console.log(req.user)
    try {
        res.status(200).json({ balance: req.user.balance })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong' });

    }


}


module.exports.updateProfileIMG = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.id;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.profilePicture = req.file.path; // you can choose any field name
        await user.save();

        res.json({ message: 'Profile picture updated', profilePicture: user.profilePicture });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports.sendOTP = async (req, res) => {

    const { email } = req.body;

    try {
        await userService.sendOTPEmail(email)
        res.status(201).json({ message: "OTP Sent Successfully" })
    } catch (err) {
        console.error('Error sending OTP SMS:', err.response?.data || err.message);
    }



}