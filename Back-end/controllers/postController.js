const jwt = require("jsonwebtoken");
console.log("✅ JWT Module Loaded:", jwt);
const Post = require("../models/Post.model");


// ➤ Create a new post
const createPost = async (req, res) => {
  try {
    console.log("🔹 Authenticated User:", req.user); // Debugging line

    const { content, image } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: Invalid or missing token" });
    }

    const newPost = new Post({
      userId: req.user.id, // Authenticated user
      content,
      image,
    });

    await newPost.save();
    res.status(201).json({ message: "Post created successfully", post: newPost });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ➤ Get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("userId", "username email");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Get single post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("userId", "username");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Delete post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if the logged-in user is the post creator
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Like a post
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if the user has already liked the post
    if (post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    post.likes.push(req.user.id);
    await post.save();

    res.status(200).json({ message: "Post liked successfully", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Unlike a post
const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if the user has not liked the post
    if (!post.likes.includes(req.user.id)) {
      return res.status(400).json({ message: "You have not liked this post" });
    }

    post.likes = post.likes.filter((userId) => userId.toString() !== req.user.id);
    await post.save();

    res.status(200).json({ message: "Post unliked successfully", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Comment on a post
const commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const { text } = req.body;
    const newComment = {
      userId: req.user.id,
      text,
    };

    post.comments.push(newComment);
    await post.save();

    res.status(200).json({ message: "Comment added successfully", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ➤ Delete a comment from a post
const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Ensure the user deleting the comment is the comment owner
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.remove();
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully", post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPost, getAllPosts, getPostById, deletePost, likePost, unlikePost, commentOnPost, deleteComment };
