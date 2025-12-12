const express = require('express');
const router = express.Router();
const pool = require('../db');
const { classifyStress } = require('../utils/stressClassifier');
const userAuth = require('../middleware/authentication/user');

router.post('/submit', userAuth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { issueDescription } = req.body;
    const userId = req.user.id;

    if (!issueDescription || issueDescription.trim().length < 20) {
      return res.status(400).json({ 
        message: 'Please provide a detailed description (at least 20 characters)' 
      });
    }

    const classification = await classifyStress(issueDescription);

    await client.query('BEGIN');

    const existingUser = await client.query(
      'SELECT id FROM ConnectUsers WHERE user_id = $1',
      [userId]
    );

    let result;
    if (existingUser.rows.length > 0) {
      result = await client.query(
        `UPDATE ConnectUsers 
         SET issue_description = $1, 
             stress_category = $2, 
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3
         RETURNING id, user_id, stress_category`,
        [issueDescription, classification.category, userId]
      );
    } else {
      result = await client.query(
        `INSERT INTO ConnectUsers (user_id, issue_description, stress_category)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, stress_category`,
        [userId, issueDescription, classification.category]
      );
    }

    const matches = await client.query(
      `SELECT u.id, u.name, u.email, cu.stress_category
       FROM ConnectUsers cu
       JOIN Users u ON cu.user_id = u.id
       WHERE cu.stress_category = $1 
         AND cu.user_id != $2
       ORDER BY cu.created_at DESC
       LIMIT 5`,
      [classification.category, userId]
    );

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Successfully connected',
      category: classification.category,
      matches: matches.rows.map(m => ({
        name: m.name,
        email: m.email
      }))
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error in connect submit:', err);
    res.status(500).json({ 
      message: 'Error processing your request',
      error: err.message 
    });
  } finally {
    client.release();
  }
});

module.exports = router;
