const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token)
      return res.status(401).json({ success: false, message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id || decoded._id;

    const user = await User.findById(userId).select('-password');
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: 'User not found' });

    req.user = user;

    // console.log('HEADERS:', req.headers);
    // console.log('AUTH HEADER:', req.headers.authorization);

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

module.exports = { protectRoute };
