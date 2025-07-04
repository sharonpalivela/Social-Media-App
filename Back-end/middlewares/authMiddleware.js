const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("👉 Received Authorization Header:", authHeader);
    console.log("👉 JWT_SECRET from env:", process.env.JWT_SECRET);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Token missing or malformed");
      return res.status(401).json({ error: "Access denied, token missing or malformed!" });
    }

    const token = authHeader.split(" ")[1]; // ✅ Extract token only

    console.log("✅ Extracted Token:", token);

    const decoded = jwt.verify(token, "Chalopapa56");
console.log("🔓 Decoded JWT:", decoded);
    req.user = await User.findById(decoded.id).select("-password");
    console.log("✅ User authenticated:", req.user.username);

    next();
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    res.status(401).json({ error: "Invalid or expired token!" });
  }
};

module.exports = authMiddleware;
