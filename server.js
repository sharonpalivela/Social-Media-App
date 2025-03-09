// Load environment variables at the very top
require("dotenv").config();
console.log("✅ JWT_SECRET Loaded:", process.env.JWT_SECRET);

const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");  
const cors = require("cors"); // ✅ Import CORS

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const chatRoutes = require("./routes/chatRoutes"); // ✅ Import chat routes
const notificationRoutes = require("./routes/notificationRoutes");
const Chat = require("./models/Chat.model"); // ✅ Import Chat model



const app = express();
const server = http.createServer(app);  

// ✅ Initialize Socket.io with CORS settings
const io = socketIo(server, {
    cors: {
        origin: "*", // Change to frontend URL in production
        methods: ["GET", "POST"]
    }
});

// ✅ Use CORS middleware before routes
app.use(cors());
app.use(express.json()); // ✅ JSON middleware before routes

// ✅ Define Routes
app.use("/users", userRoutes);
console.log("Post routes loaded");
app.use("/api/posts", postRoutes);
app.use("/api/chats", chatRoutes); // ✅ Moved below `express.json()`
app.use("/api/notifications", notificationRoutes);

// ✅ MongoDB Connection Setup
const dbURI = process.env.DB_URI;
if (!dbURI) {
    console.error("❌ DB_URI not found in .env file. Please check your configuration.");
    process.exit(1);
}

mongoose.set("strictQuery", false);
mongoose
    .connect(dbURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    });

// ✅ Test Route
app.get("/test", (req, res) => {
    res.send("Hello, Social Media App!");
});

// ✅ Socket.io: Real-Time Chat System
io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    // ✅ Handle notifications
    socket.on("send_notification", (data) => {
        io.to(data.recipientId).emit("notification", data.message);
        console.log(`📢 Notification sent to ${data.recipientId}: ${data.message}`);
    });

    // ✅ User joins a chat room
    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat: ${chatId}`);
    });

    // ✅ Sending messages
    socket.on("send_message", async (messageData) => {
        console.log("✅ Incoming message:", messageData);
        try {
            const newChat = new Chat(messageData);
            await newChat.save();
            console.log("✅ Message saved:", messageData);

            // ✅ Send message to the specific chat room
            io.to(messageData.chatId).emit("receive_message", messageData);
        } catch (error) {
            console.error("❌ Error saving message:", error);
            socket.emit("error", "Failed to send message, please try again later.");
        }
    });

    // ✅ Handle disconnect
    socket.on("disconnect", () => {
        console.log("❌ A user disconnected:", socket.id);
    });
});

// ✅ Start Server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
