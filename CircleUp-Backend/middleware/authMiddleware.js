const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateUser = (req, res, next) => {
  console.log("Middleware: Starting authentication process");

  const authHeader = req.header("Authorization");
  console.log("Middleware: Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Middleware: Invalid or missing Authorization header");
    return res.status(401).json({ message: "Access Denied", details: "Authorization header must be 'Bearer <token>'" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.error("Middleware: Token missing after 'Bearer'");
    return res.status(401).json({ message: "Access Denied", details: "Token missing" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("Middleware: JWT_SECRET not set in environment variables");
    return res.status(500).json({ message: "Server Error", details: "JWT_SECRET not configured" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Middleware: Token verified successfully:", verified);
    req.user = verified; // req.user.userId will be "610bff98-0c19-4801-b5f7-3a214f98273e"
    next();
  } catch (error) {
    console.error("Middleware: JWT verification error:", error.message, "Token:", token);
    res.status(400).json({ message: "Invalid Token", details: error.message });
  }
};

module.exports = authenticateUser;