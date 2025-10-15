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

// Fetch all messages with category = 'other' (across all users)
router.get("/messages/other", userAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM Messages WHERE category = $1 AND sender = 'user' ORDER BY created_at ASC`,
      ['other']
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching 'other' messages:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get message counts grouped by category (admin only)
router.get("/messages/category-stats", userAuth, async (req, res) => {
  try {
    // only admins may access
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Ensure messages are classified before computing stats
    await classifyPendingMessages();

    const result = await pool.query(
      "SELECT category, COUNT(*)::int AS count FROM Messages WHERE sender = 'user' GROUP BY category"
    );

    const total = result.rows.reduce((s, r) => s + Number(r.count), 0);

    res.json({ total, stats: result.rows });
  } catch (err) {
    console.error('Error fetching category stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Helper: classify pending messages (wraps the same logic the POST /messages/classify uses)
async function classifyPendingMessages() {
  try {
    // select messages labeled 'other' for reclassification (user messages only)
    const result = await pool.query(
      `SELECT id, message FROM Messages WHERE category = 'other' AND sender = 'user'`
    );
    const messagesToClassify = result.rows;
    if (!messagesToClassify || messagesToClassify.length === 0) return [];

    const texts = messagesToClassify.map(m => m.message);
    const flaskUrl = process.env.FLASK_API_URL || 'http://localhost:5001/api/classify-messages';

    const flaskResp = await fetch(flaskUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: texts }),
    });

    if (!flaskResp.ok) {
      return [];
    }

    const json = await flaskResp.json();
    const predictions = json.predictions || [];
    const allowed = ['academic', 'career', 'relationship', 'other'];

    if (!Array.isArray(predictions) || predictions.length !== messagesToClassify.length) {
      return [];
    }

    await pool.query('BEGIN');
    try {
      for (let i = 0; i < messagesToClassify.length; i++) {
        const id = messagesToClassify[i].id;
        let category = predictions[i];
        if (typeof category === 'string') category = category.toLowerCase().trim();
        else category = 'other';
        if (!allowed.includes(category)) category = 'other';
        await pool.query('UPDATE Messages SET category = $1 WHERE id = $2', [category, id]);
      }
      await pool.query('COMMIT');
    } catch (err) {
      await pool.query('ROLLBACK');
    }

    return messagesToClassify.map((m, i) => ({ id: m.id, category: predictions[i] }));
  } catch (err) {
    console.error('Error in classifyPendingMessages:', err);
    return [];
  }
}

module.exports = router;

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
      "SELECT * FROM Messages WHERE conversation_id = $1  ORDER BY created_at ASC",
      [conversationId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// (moved above to avoid route param conflicts)

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

// Classify messages using external Flask classifier and store categories
router.post("/messages/classify", userAuth, async (req, res) => {
  try {
    const { messageIds } = req.body || {};

    // Fetch messages to classify: either specified IDs or those with NULL/empty category
    let messagesToClassify;
    if (Array.isArray(messageIds) && messageIds.length > 0) {
      const q = `SELECT id, message FROM Messages WHERE id = ANY($1) AND sender = 'user'`;
      const result = await pool.query(q, [messageIds]);
      messagesToClassify = result.rows;
    } else {
      // Column `category` uses an ENUM with default 'other'; select messages currently labeled 'other' for re-classification
      const result = await pool.query(
        `SELECT id, message FROM Messages WHERE category = 'other' AND sender = 'user'`
      );
      messagesToClassify = result.rows;
    }

    if (!messagesToClassify || messagesToClassify.length === 0) {
      return res.json({ message: 'No messages to classify', classified: [] });
    }

    const texts = messagesToClassify.map(m => m.message);

    const flaskUrl = process.env.FLASK_API_URL || 'http://localhost:5001/api/classify-messages';

    // Call Flask classifier
    const flaskResp = await fetch(flaskUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: texts }),
    });

    if (!flaskResp.ok) {
      const txt = await flaskResp.text().catch(() => '');
      throw new Error(`Flask classifier error ${flaskResp.status}: ${txt}`);
    }

    const json = await flaskResp.json();
    const predictions = json.predictions || [];

    if (!Array.isArray(predictions) || predictions.length !== messagesToClassify.length) {
      // best-effort: if lengths mismatch, abort
      throw new Error('Classifier returned unexpected number of predictions');
    }

    // Validate predictions against allowed enum values before persisting
    const allowed = ['academic', 'career', 'relationship', 'other'];

    // Persist predictions in DB within a transaction
    await pool.query('BEGIN');
    try {
      const classified = [];
      for (let i = 0; i < messagesToClassify.length; i++) {
        const id = messagesToClassify[i].id;
        let category = predictions[i];
        if (typeof category === 'string') {
          category = category.toLowerCase().trim();
        } else {
          category = 'other';
        }
        if (!allowed.includes(category)) {
          category = 'other';
        }
        await pool.query('UPDATE Messages SET category = $1 WHERE id = $2', [category, id]);
        classified.push({ id, category });
      }
      await pool.query('COMMIT');
      return res.json({ message: 'Classified and saved', classified });
    } catch (err) {
      await pool.query('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error classifying messages:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get message counts grouped by category (admin only)
router.get("/messages/category-stats", userAuth, async (req, res) => {
  try {
    // only admins may access
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await pool.query(
      "SELECT category, COUNT(*)::int AS count FROM Messages WHERE sender = 'user' GROUP BY category"
    );

    const total = result.rows.reduce((s, r) => s + Number(r.count), 0);

    res.json({ total, stats: result.rows });
  } catch (err) {
    console.error('Error fetching category stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
