const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET ;

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await pool.query('SELECT * FROM Users WHERE email=$1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO Users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role || 'student']
    );
    res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userResult = await pool.query('SELECT * FROM Users WHERE email=$1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ message: 'Signin successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all counselors
router.get("/counselors", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        u.id as user_id,
        u.name,
        u.email,
        c.id as counselor_id,
        c.specialization,
        c.bio,
        c.years_of_experience
       FROM Users u
       JOIN Counselors c ON u.id = c.user_id
       WHERE u.role = 'counselor'
       ORDER BY u.name ASC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching counselors:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get specific counselor by ID
router.get("/counselors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        u.id as user_id,
        u.name,
        u.email,
        c.id as counselor_id,
        c.specialization,
        c.bio,
        c.years_of_experience
       FROM Users u
       JOIN Counselors c ON u.id = c.user_id
       WHERE u.role = 'counselor' AND (u.id = $1 OR c.id = $1)`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching counselor:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
