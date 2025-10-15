require('dotenv').config();
const { Pool } = require('pg');

// Connect to NeonDB
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: true } // Neon requires SSL
});

const addCategoryColumn = async () => {
  try {
    const sql = `
    -- Create ENUM type if it doesn't exist
    DO $$ BEGIN
        CREATE TYPE message_category AS ENUM ('academic', 'career', 'relationship', 'other');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    -- Add column to Messages table if it doesn't exist
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name='messages' AND column_name='category'
        ) THEN
            ALTER TABLE Messages
            ADD COLUMN category message_category DEFAULT 'other';
        END IF;
    END $$;
    `;

    await pool.query(sql);
    console.log("✅ 'category' column added to 'Messages' table successfully!");
  } catch (err) {
    console.error("⚠️ Error adding 'category' column:", err);
  } finally {
    pool.end();
  }
};

addCategoryColumn();
