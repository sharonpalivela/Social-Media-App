const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({ error: "Access denied, token missing!" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password"); // Attach user data to req.user
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid or expired token!" });
    }
};

module.exports = authMiddleware;
