const userModel = require("../models/user.model")
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require("../models/blacklistToken.model");



module.exports.authUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.token || authHeader?.split(' ')[1]
console.log(token)
    
    if (!token) {
        return res.status(401).json({ message: 'unauthorized' });
    }
    const isBlacklisted = await blacklistTokenModel.findOne({ token })

    if (isBlacklisted) {
        return res.status(401).json({ message: 'session expired login again' })

    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded._id)
        req.user = user;
        next()
    } catch (error) {
        
        return res.status(401).json({ message: 'Unauthorized' });

    }

}
