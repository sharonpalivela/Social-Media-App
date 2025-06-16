require('dotenv').config();
const jwt = require('jsonwebtoken');

const userId = "67911b7632b2ac78d82fb18f"; // Replace with your actual user ID

const newToken = jwt.sign(
    { id: userId }, 
   Chalopapa56,
    { expiresIn: "7d" }  // Token valid for 7 days
);

console.log("✅ New Token:", newToken);
