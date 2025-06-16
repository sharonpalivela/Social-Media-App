// Load environment variables at the very top
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const Chat = require("./models/Chat.model");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// ✅ Middleware & Static File Handling
app.use(cors());
app.use(express.json());

const path = require("path");
app.use(express.static(path.join(__dirname, '..', 'Front-end')));

// Route for the homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Front-end', 'homepage.html'));
});


// ✅ Define Routes
app.use("/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ MongoDB Connection Setup
const dbURI = process.env.DB_URI;
if (!dbURI) {
    console.error("❌ DB_URI is missing! Make sure it's set in Railway Variables.");
} else {
    mongoose.set("strictQuery", false);
    mongoose
        .connect(dbURI)
        .then(() => console.log("✅ MongoDB connected successfully"))
        .catch((err) => {
            console.error("❌ MongoDB connection error:", err.message);
            console.log("⏳ Retrying MongoDB connection in 5 seconds...");
            setTimeout(() => {
                mongoose.connect(dbURI);
            }, 5000);
        });
}

// ✅ Test Route
app.get("/test", (req, res) => {
    res.send("Hello, Social Media App!");
});

// ✅ Socket.io: Real-Time Chat System
io.on("connection", (socket) => {
    console.log("✅ A user connected:", socket.id);

    socket.on("send_notification", (data) => {
        io.to(data.recipientId).emit("notification", data.message);
        console.log(`📢 Notification sent to ${data.recipientId}: ${data.message}`);
    });

    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat: ${chatId}`);
    });

    socket.on("send_message", async (messageData) => {
        try {
            const newChat = new Chat(messageData);
            await newChat.save();
            io.to(messageData.chatId).emit("receive_message", messageData);
        } catch (error) {
            socket.emit("error", "Failed to send message, please try again later.");
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ A user disconnected:", socket.id);
    });
});

// ✅ Start Server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});
