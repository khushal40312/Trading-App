const portfolioModel = require('../models/portfolio.model');
const blacklistTokenModel = require('../models/blacklistToken.model');



module.exports.findPortfolio = async (userId) => {
// console.log(user.id)
return await portfolioModel.findOne({user:userId})



}


