const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const { Pool } = require('pg'); 

const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const blogRoutes = require('./routes/blogRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
app.use(cors());
app.use(express.json());
const port = 5000;


const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: true } 
});


pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to NeonDB at', res.rows[0].now);
});

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ serverTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/appointments', appointmentRoutes);