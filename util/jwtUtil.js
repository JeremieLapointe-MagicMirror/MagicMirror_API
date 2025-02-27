var jwt = require("jsonwebtoken");

const JWT_SIGN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const TOKEN_EXPIRE = process.env.BEARER_TOKEN_EXPIRE;

module.exports = {
  generateAccessToken: function (email) {
    return jwt.sign({ email: email }, JWT_SIGN_SECRET, {
      expiresIn: TOKEN_EXPIRE,
    });
  },
  generateAppToken: function (user) {
    return jwt.sign(user, JWT_SIGN_SECRET, {});
  },
  verifyToken: function (token) {
    return jwt.verify(token, JWT_SIGN_SECRET);
  },

  verifyApplicationToken: function (appKey) {
    try {
      const decoded = this.verifyToken(appKey);
      if (decoded.uname != process.env.CREATION_EMAIL) return false;
    } catch (err) {
      return false;
    }
    return true;
  },
};
