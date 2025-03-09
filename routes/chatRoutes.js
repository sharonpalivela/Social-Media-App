const express = require("express");
const router = express.Router();
const { sendMessage, getMessages } = require("../controllers/chatController");
const protect = require("../middlewares/authMiddleware"); // Import without destructuring

console.log("sendMessage function:", sendMessage); // Debugging
console.log("getMessages function:", getMessages);
console.log("protect function:", protect);

// Ensure `protect` is defined and is a function before using it
if (typeof protect !== "function") {
    throw new Error("Middleware `protect` is not defined. Check authMiddleware.js");
}

// Send a message
router.post("/send", protect, sendMessage);

// Get messages between two users
router.get("/:userId1/:userId2", protect, getMessages);

module.exports = router;
