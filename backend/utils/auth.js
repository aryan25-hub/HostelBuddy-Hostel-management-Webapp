const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env");
  }
  return process.env.JWT_SECRET;
};

exports.generateToken = (userId, isAdmin) => {
  return jwt.sign({ userId, isAdmin }, getJwtSecret(), { expiresIn: "1h" });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};
