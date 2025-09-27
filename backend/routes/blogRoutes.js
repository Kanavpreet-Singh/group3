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

module.exports = router;
