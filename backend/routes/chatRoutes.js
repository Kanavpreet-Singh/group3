const express = require("express");
const router = express.Router();
const pool = require("../db");
const userAuth = require("../middleware/authentication/user");

// Fetch previous conversations of logged-in user
router.get("/allchats", userAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Conversations WHERE user_id = $1 ORDER BY started_at DESC",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch messages for a specific conversation
router.get("/messages/:conversationId", userAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    // First verify this conversation belongs to the user
    const convResult = await pool.query(
      "SELECT * FROM Conversations WHERE id = $1 AND user_id = $2",
      [conversationId, req.user.id]
    );

    if (convResult.rows.length === 0) {
      return res.status(403).json({ message: "Conversation not found or access denied" });
    }

    const result = await pool.query(
      "SELECT * FROM Messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [conversationId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/newconversation", userAuth, async (req, res) => {
  try {
    const { title } = req.body;

    // Insert new conversation into DB
    const result = await pool.query(
      `INSERT INTO Conversations (user_id, title)
       VALUES ($1, $2)
       RETURNING *`,
      [req.user.id, title || "Untitled Conversation"]
    );

    res.status(201).json({
      message: "Conversation created successfully",
      conversation: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating conversation:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a conversation and its messages
router.delete("/conversation/:conversationId", userAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;

    // First verify this conversation belongs to the user
    const convResult = await pool.query(
      "SELECT * FROM Conversations WHERE id = $1 AND user_id = $2",
      [conversationId, req.user.id]
    );

    if (convResult.rows.length === 0) {
      return res.status(403).json({ message: "Conversation not found or access denied" });
    }

    // Delete messages first (due to foreign key constraint)
    await pool.query(
      "DELETE FROM Messages WHERE conversation_id = $1",
      [conversationId]
    );

    // Then delete the conversation
    await pool.query(
      "DELETE FROM Conversations WHERE id = $1 AND user_id = $2",
      [conversationId, req.user.id]
    );

    res.json({ message: "Conversation deleted successfully" });
  } catch (err) {
    console.error("Error deleting conversation:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/newmessage", userAuth, async (req, res) => {
  try {
    const { conversationId, sender, message } = req.body;

    if (!conversationId || !sender || !message) {
      return res.status(400).json({ message: "conversationId, sender, and message are required" });
    }

    if (!["user", "bot"].includes(sender)) {
  return res.status(400).json({ message: "Sender must be either 'user' or 'bot'" });
}


    const result = await pool.query(
      "INSERT INTO Messages (conversation_id, sender, message) VALUES ($1, $2, $3) RETURNING *",
      [conversationId, sender, message]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error adding message:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
