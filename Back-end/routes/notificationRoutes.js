const express = require("express");
const Notification = require("../models/Notification.model");
const authMiddleware = require("../middlewares/authMiddleware"); // Import the auth middleware as authMiddleware
const router = express.Router();

// ✅ Create a new notification (protected route)
router.post("/create", authMiddleware, async (req, res) => {
    try {
        const { senderId, recipientId, type, message } = req.body;

        if (!recipientId || !message || !type) {
            return res.status(400).json({ error: "All fields are required (recipientId, type, message)." });
        }

        const notification = new Notification({ senderId, recipientId, type, message });
        await notification.save();
        res.status(201).json({ message: "Notification created successfully!", notification });
    } catch (err) {
        console.error("❌ Error creating notification:", err);
        res.status(500).json({ error: "Internal server error while creating notification." });
    }
});

// ✅ Get all notifications for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipientId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (err) {
        console.error("❌ Error fetching notifications:", err);
        res.status(500).json({ error: "Internal server error while fetching notifications." });
    }
});

// ✅ Mark a notification as read
router.put("/:id/read", authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ error: "Notification not found." });

        notification.isRead = true;
        await notification.save();
        res.status(200).json({ message: "Notification marked as read.", notification });
    } catch (err) {
        console.error("❌ Error marking notification as read:", err);
        res.status(500).json({ error: "Internal server error while updating notification." });
    }
});

// ✅ Delete a notification
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ error: "Notification not found." });

        await notification.deleteOne();
        res.status(200).json({ message: "Notification deleted successfully." });
    } catch (err) {
        console.error("❌ Error deleting notification:", err);
        res.status(500).json({ error: "Internal server error while deleting notification." });
    }
});

module.exports = router;
