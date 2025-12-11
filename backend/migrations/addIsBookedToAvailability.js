// Migration to add is_booked field to Availability table
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: true }
});

const addIsBookedColumn = async () => {
  try {
    await pool.query(`
      ALTER TABLE Availability 
      ADD COLUMN IF NOT EXISTS is_booked BOOLEAN DEFAULT FALSE;
    `);
    
    console.log('Successfully added is_booked column to Availability table');
  } catch (err) {
    console.error('Error adding is_booked column:', err);
  } finally {
    pool.end();
  }
};

addIsBookedColumn();
