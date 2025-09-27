// createTables.js
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

const createTables = async () => {
  try {
    const sql = `
    -- ENUM types
    DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('student', 'counselor', 'admin');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        CREATE TYPE appointment_status AS ENUM ('scheduled','completed','cancelled');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
        CREATE TYPE sender_type AS ENUM ('user','bot');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    -- Users table
    CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role user_role DEFAULT 'student'
    );

    -- Counselors table
    CREATE TABLE IF NOT EXISTS Counselors (
        id SERIAL PRIMARY KEY,
        user_id INT UNIQUE NOT NULL,
        specialization VARCHAR(255),
        bio TEXT,
        years_of_experience INT,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
    );

    -- Availability table
    CREATE TABLE IF NOT EXISTS Availability (
        id SERIAL PRIMARY KEY,
        counselor_id INT NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        FOREIGN KEY (counselor_id) REFERENCES Counselors(id) ON DELETE CASCADE
    );

    -- Appointments table
    CREATE TABLE IF NOT EXISTS Appointments (
        id SERIAL PRIMARY KEY,
        student_id INT NOT NULL,
        counselor_id INT NOT NULL,
        appointment_time TIMESTAMP NOT NULL,
        status appointment_status DEFAULT 'scheduled',
        FOREIGN KEY (student_id) REFERENCES Users(id),
        FOREIGN KEY (counselor_id) REFERENCES Counselors(id)
    );

    -- Conversations table
    CREATE TABLE IF NOT EXISTS Conversations (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255),
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id)
    );

    -- Messages table
    CREATE TABLE IF NOT EXISTS Messages (
        id SERIAL PRIMARY KEY,
        conversation_id INT NOT NULL,
        sender sender_type NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES Conversations(id) ON DELETE CASCADE
    );

    -- Blogs table
    CREATE TABLE IF NOT EXISTS Blogs (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        source_conversation_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(id),
        FOREIGN KEY (source_conversation_id) REFERENCES Conversations(id)
    );

    -- Comments table
    CREATE TABLE IF NOT EXISTS Comments (
        id SERIAL PRIMARY KEY,
        blog_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blog_id) REFERENCES Blogs(id),
        FOREIGN KEY (user_id) REFERENCES Users(id)
    );
    `;

    await pool.query(sql);
    console.log('All tables created successfully in NeonDB!');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    pool.end();
  }
};

createTables();
