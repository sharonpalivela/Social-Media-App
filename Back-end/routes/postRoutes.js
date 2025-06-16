const express = require("express");
const jwt = require("jsonwebtoken"); // Optional: remove if not used

const { 
    createPost, 
    getAllPosts, 
    getPostById, 
    deletePost, 
    likePost, 
    unlikePost, 
    commentOnPost, 
    deleteComment 
} = require("../controllers/postController.js");

const protect = require("../middlewares/authMiddleware.js"); // Import the auth middleware directly

const router = express.Router();

// Post routes
router.post("/", protect, createPost);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, likePost);
router.post("/:id/unlike", protect, unlikePost);
router.post("/:id/comment", protect, commentOnPost);
router.delete("/:postId/comment/:commentId", protect, deleteComment);

module.exports = router;
