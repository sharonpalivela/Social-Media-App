const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Sender of the notification
            required: true,
        },
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Receiver of the notification
            required: true,
        },
        type: {
            type: String, // e.g., 'like', 'comment', 'message'
            required: true,
            enum: ["like", "comment", "message", "follow", "mention"], // Ensures only valid types are used
        },
        message: {
            type: String, // e.g., 'User A liked your post'
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true } // Automatically adds createdAt & updatedAt timestamps
);

module.exports = mongoose.model("Notification", notificationSchema);
