const express = require("express");
const router = express.Router();
const pool = require("../db");
const userAuth = require("../middleware/authentication/user");

// Fetch all blogs
router.get("/allblogs", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name as author_name 
       FROM Blogs b 
       JOIN Users u ON b.user_id = u.id 
       ORDER BY b.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new blog
router.post("/newblog", userAuth, async (req, res) => {
  try {
    const { title, content, source_conversation_id } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // If source_conversation_id is provided, verify it exists and belongs to the user
    if (source_conversation_id) {
      const convResult = await pool.query(
        "SELECT * FROM Conversations WHERE id = $1 AND user_id = $2",
        [source_conversation_id, req.user.id]
      );

      if (convResult.rows.length === 0) {
        return res.status(403).json({ message: "Source conversation not found or access denied" });
      }
    }

    // Insert new blog into DB
    const result = await pool.query(
      `INSERT INTO Blogs (user_id, title, content, source_conversation_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, title, content, source_conversation_id || null]
    );

    // Fetch the author's name for the response
    const userResult = await pool.query(
      "SELECT name FROM Users WHERE id = $1",
      [req.user.id]
    );

    const blogWithAuthor = {
      ...result.rows[0],
      author_name: userResult.rows[0].name
    };

    res.status(201).json({
      message: "Blog created successfully",
      blog: blogWithAuthor
    });
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add a comment to a blog
router.post("/comment/:blogId", userAuth, async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;

    // Validate input
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    // Verify blog exists
    const blogResult = await pool.query(
      "SELECT * FROM Blogs WHERE id = $1",
      [blogId]
    );

    if (blogResult.rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Insert comment
    const result = await pool.query(
      `INSERT INTO Comments (blog_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [blogId, req.user.id, content.trim()]
    );

    // Get commenter's name for the response
    const userResult = await pool.query(
      "SELECT name FROM Users WHERE id = $1",
      [req.user.id]
    );

    const commentWithUser = {
      ...result.rows[0],
      commenter_name: userResult.rows[0].name
    };

    res.status(201).json({
      message: "Comment added successfully",
      comment: commentWithUser
    });

  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get comments for a specific blog
router.get("/:blogId/comments", async (req, res) => {
  try {
    const { blogId } = req.params;

    // Verify blog exists
    const blogResult = await pool.query(
      "SELECT * FROM Blogs WHERE id = $1",
      [blogId]
    );

    if (blogResult.rows.length === 0) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Fetch comments with commenter's name
    const result = await pool.query(
      `SELECT c.*, u.name as commenter_name 
       FROM Comments c
       JOIN Users u ON c.user_id = u.id
       WHERE c.blog_id = $1
       ORDER BY c.created_at DESC`,
      [blogId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get blog count along with blog details
router.get("/allblogs", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.name as author_name
       FROM Blogs b 
       JOIN Users u ON b.user_id = u.id 
       ORDER BY b.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
