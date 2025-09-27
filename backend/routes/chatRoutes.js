const express = require("express");
const router = express.Router();
const pool = require("../db");
const userAuth = require("../middleware/authentication/user");

// Fetch previous conversations of logged-in user
router.get("/allchats", userAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM Conversations WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
