const Chat = require("../models/Chat.model"); // ✅ Ensure correct path

// Send Message
const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;

        if (!senderId || !receiverId || !content) {
            return res.status(400).json({ message: "SenderId, ReceiverId, and Content are required" });
        }

        const message = await Chat.create({
            senderId,
            receiverId,
            message: content,
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get Messages
const getMessages = async (req, res) => {
    try {
        const { userId1, userId2 } = req.params;

        if (!userId1 || !userId2) {
            return res.status(400).json({ message: "User IDs are required" });
        }

        const messages = await Chat.find({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 }
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// ✅ Ensure proper export
module.exports = { sendMessage, getMessages };
