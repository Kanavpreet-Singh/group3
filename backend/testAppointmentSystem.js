// Test script for appointment booking endpoints
require('dotenv').config();
const pool = require('./db');

async function testAppointmentSystem() {
  console.log('🧪 Testing Appointment Booking System...\n');

  try {
    // Test 1: Check if is_booked column exists
    console.log('Test 1: Checking database schema...');
    const schemaCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'availability' 
      AND column_name = 'is_booked'
    `);
    
    if (schemaCheck.rows.length > 0) {
      console.log('✅ is_booked column exists in Availability table');
    } else {
      console.log('❌ is_booked column not found. Run migration first!');
      return;
    }

    // Test 2: Check for available slots
    console.log('\nTest 2: Checking for available slots...');
    const slotsCheck = await pool.query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN is_booked = FALSE THEN 1 END) as available,
             COUNT(CASE WHEN is_booked = TRUE THEN 1 END) as booked
      FROM Availability
      WHERE start_time > NOW()
    `);
    
    const stats = slotsCheck.rows[0];
    console.log(`✅ Total future slots: ${stats.total}`);
    console.log(`   Available: ${stats.available}`);
    console.log(`   Booked: ${stats.booked}`);

    // Test 3: Check appointments table
    console.log('\nTest 3: Checking appointments...');
    const appointmentsCheck = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM Appointments
      GROUP BY status
    `);
    
    if (appointmentsCheck.rows.length > 0) {
      console.log('✅ Appointments breakdown:');
      appointmentsCheck.rows.forEach(row => {
        console.log(`   ${row.status}: ${row.count}`);
      });
    } else {
      console.log('ℹ️  No appointments found yet');
    }

    // Test 4: Check counselors with slots
    console.log('\nTest 4: Checking counselors with availability...');
    const counselorsCheck = await pool.query(`
      SELECT 
        u.name,
        c.specialization,
        COUNT(a.id) as slot_count
      FROM Counselors c
      JOIN Users u ON c.user_id = u.id
      LEFT JOIN Availability a ON c.id = a.counselor_id
      WHERE a.start_time > NOW() AND a.is_booked = FALSE
      GROUP BY u.name, c.specialization
    `);
    
    if (counselorsCheck.rows.length > 0) {
      console.log('✅ Counselors with available slots:');
      counselorsCheck.rows.forEach(row => {
        console.log(`   ${row.name} (${row.specialization}): ${row.slot_count} slots`);
      });
    } else {
      console.log('⚠️  No counselors have available slots');
      console.log('   Counselors should add slots using /api/appointments/addslot');
    }

    console.log('\n✅ All tests completed!\n');
    console.log('📋 Next steps:');
    console.log('   1. Ensure counselors add availability slots');
    console.log('   2. Students can then book appointments through the UI');
    console.log('   3. Monitor appointments in the Profile page\n');

  } catch (err) {
    console.error('❌ Test failed:', err.message);
  } finally {
    await pool.end();
  }
}

testAppointmentSystem();
