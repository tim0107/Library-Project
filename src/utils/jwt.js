// utils/jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function signAccessToken(payload) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is missing in .env');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' });
}

function verifyAccessToken(token) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is missing in .env');
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signAccessToken, verifyAccessToken };
