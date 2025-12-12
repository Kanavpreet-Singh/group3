require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: process.env.DB_HOST ? { rejectUnauthorized: true } : false
});

const addConnectUsersTable = async () => {
  try {
    const sql = `
    DO $$ BEGIN
        CREATE TYPE stress_category AS ENUM (
            'academic_stress',
            'career_job_stress',
            'relationship_stress',
            'friendship_social_stress',
            'family_stress',
            'financial_stress',
            'self_esteem_confidence_stress',
            'emotional_mental_overload',
            'health_physical_wellbeing_stress',
            'loneliness_isolation_stress'
        );
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS ConnectUsers (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        issue_description TEXT NOT NULL,
        stress_category stress_category NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_connect_users_category ON ConnectUsers(stress_category);
    CREATE INDEX IF NOT EXISTS idx_connect_users_user_id ON ConnectUsers(user_id);
    `;

    await pool.query(sql);
    console.log('✅ ConnectUsers table created successfully!');
  } catch (err) {
    console.error('❌ Error creating ConnectUsers table:', err);
  } finally {
    pool.end();
  }
};

addConnectUsersTable();
