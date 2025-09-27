const jwt = require('jsonwebtoken');
require('dotenv').config();

const userAuth = (req, res, next) => {
  const token = req.headers.token;
  if (!token) {
    return res.status(401).json({ message: "You are not signed in" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, name: decoded.name, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "You are not signed in" });
  }
};

module.exports = userAuth;
