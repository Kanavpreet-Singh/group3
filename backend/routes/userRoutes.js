const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userAuth = require("../middleware/authentication/user");
const JWT_SECRET = process.env.JWT_SECRET ;

router.post('/signup', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      name, 
      email, 
      password, 
      role,
      // Additional counselor fields
      specialization,
      bio,
      yearsOfExperience
    } = req.body;

    // Validate required fields for counselors
    if (role === 'counselor') {
      if (!specialization || !bio || !yearsOfExperience) {
        return res.status(400).json({ 
          message: 'For counselor registration, specialization, bio, and years of experience are required' 
        });
      }
    }

    // Start transaction
    await client.query('BEGIN');

    // Check if user exists
    const existingUser = await client.query('SELECT * FROM Users WHERE email=$1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into Users table
    const userResult = await client.query(
      'INSERT INTO Users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role || 'student']
    );

    let counselorData = null;

    // If role is counselor, insert into Counselors table
    if (role === 'counselor') {
      const counselorResult = await client.query(
        `INSERT INTO Counselors (user_id, specialization, bio, years_of_experience) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [userResult.rows[0].id, specialization, bio, yearsOfExperience]
      );
      counselorData = counselorResult.rows[0];
    }

    // Commit transaction
    await client.query('COMMIT');

    // Return appropriate response
    res.status(201).json({ 
      message: 'User created successfully', 
      user: userResult.rows[0],
      counselor: counselorData
    });

  } catch (err) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ 
      message: 'Server error',
      error: err.message 
    });
  } finally {
    client.release();
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

router.get("/appointments", userAuth, async (req, res) => {
  try {
    let result;

    if (req.user.role === "student") {
      // Fetch student appointments
      result = await pool.query(
        `SELECT a.id, a.appointment_time, a.status,
                c.id as counselor_id, u.name as counselor_name, c.specialization
         FROM Appointments a
         JOIN Counselors c ON a.counselor_id = c.id
         JOIN Users u ON c.user_id = u.id
         WHERE a.student_id = $1
         ORDER BY a.appointment_time DESC`,
        [req.user.id]
      );
    } else if (req.user.role === "counselor") {
      // Fetch counselor appointments
      result = await pool.query(
        `SELECT a.id, a.appointment_time, a.status,
                u.id as student_id, u.name as student_name, u.email as student_email
         FROM Appointments a
         JOIN Users u ON a.student_id = u.id
         WHERE a.counselor_id = (
            SELECT id FROM Counselors WHERE user_id = $1
         )
         ORDER BY a.appointment_time DESC`,
        [req.user.id]
      );
    } else {
      return res
        .status(403)
        .json({ message: "Only students and counselors have appointments" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
