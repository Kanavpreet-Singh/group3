const express = require("express");
const router = express.Router();
const pool = require("../db");
const userAuth = require("../middleware/authentication/user");

// Add availability slot (for counselors)
router.post("/addslot", userAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { date, startTime, endTime } = req.body;

        if (!date || !startTime || !endTime) {
            return res.status(400).json({ message: "Please provide date, startTime and endTime" });
        }

        const startTimestamp = new Date(`${date}T${startTime}`);
        const endTimestamp = new Date(`${date}T${endTime}`);

        if (startTimestamp >= endTimestamp) {
            return res.status(400).json({ message: "End time must be after start time" });
        }

        // Step 1: Fetch counselor id
        const counselorResult = await pool.query(
            "SELECT id FROM Counselors WHERE user_id = $1",
            [userId]
        );

        if (counselorResult.rows.length === 0) {
            return res.status(404).json({ message: "Counselor not found" });
        }

        const counselorId = counselorResult.rows[0].id;

        // Step 2: Check for overlapping slots
        const clashCheck = await pool.query(
            `SELECT * FROM Availability 
             WHERE counselor_id = $1 
               AND start_time < $3 
               AND end_time > $2`,
            [counselorId, startTimestamp, endTimestamp]
        );

        if (clashCheck.rows.length > 0) {
            return res.status(400).json({ message: "Slot clashes with existing availability" });
        }

        // Step 3: Insert slot
        await pool.query(
            "INSERT INTO Availability (counselor_id, start_time, end_time, is_booked) VALUES ($1, $2, $3, FALSE)",
            [counselorId, startTimestamp, endTimestamp]
        );

        return res.status(201).json({ message: "Availability slot added successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});

// Get available slots for a specific counselor
router.get("/counselor/:counselorUserId/slots", async (req, res) => {
    try {
        const { counselorUserId } = req.params;

        // Get counselor id from user id
        const counselorResult = await pool.query(
            "SELECT id FROM Counselors WHERE user_id = $1",
            [counselorUserId]
        );

        if (counselorResult.rows.length === 0) {
            return res.status(404).json({ message: "Counselor not found" });
        }

        const counselorId = counselorResult.rows[0].id;

        // Get available slots (not booked and in the future)
        const slots = await pool.query(
            `SELECT id, start_time, end_time, is_booked 
             FROM Availability 
             WHERE counselor_id = $1 
               AND is_booked = FALSE 
               AND start_time > NOW()
             ORDER BY start_time ASC`,
            [counselorId]
        );

        return res.status(200).json({ slots: slots.rows });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});

// Book an appointment
router.post("/book", userAuth, async (req, res) => {
    const client = await pool.connect();
    
    try {
        const studentId = req.user.id;
        const { counselorUserId, slotId } = req.body;

        if (!counselorUserId || !slotId) {
            return res.status(400).json({ message: "Please provide counselorUserId and slotId" });
        }

        await client.query('BEGIN');

        // Get counselor id from user id
        const counselorResult = await client.query(
            "SELECT id FROM Counselors WHERE user_id = $1",
            [counselorUserId]
        );

        if (counselorResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Counselor not found" });
        }

        const counselorId = counselorResult.rows[0].id;

        // Check if slot exists and is available
        const slotResult = await client.query(
            `SELECT id, start_time, end_time, is_booked, counselor_id
             FROM Availability 
             WHERE id = $1 AND counselor_id = $2`,
            [slotId, counselorId]
        );

        if (slotResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Slot not found" });
        }

        const slot = slotResult.rows[0];

        if (slot.is_booked) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: "This slot has already been booked" });
        }

        // Check if slot is in the future
        if (new Date(slot.start_time) <= new Date()) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: "Cannot book a slot in the past" });
        }

        // Check if student already has an appointment with this counselor at this time
        const existingAppointment = await client.query(
            `SELECT id FROM Appointments 
             WHERE student_id = $1 
               AND counselor_id = $2 
               AND appointment_time = $3 
               AND status != 'cancelled'`,
            [studentId, counselorId, slot.start_time]
        );

        if (existingAppointment.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: "You already have an appointment at this time" });
        }

        // Mark slot as booked
        await client.query(
            "UPDATE Availability SET is_booked = TRUE WHERE id = $1",
            [slotId]
        );

        // Create appointment
        const appointmentResult = await client.query(
            `INSERT INTO Appointments (student_id, counselor_id, appointment_time, status) 
             VALUES ($1, $2, $3, 'scheduled') 
             RETURNING id, appointment_time, status`,
            [studentId, counselorId, slot.start_time]
        );

        await client.query('COMMIT');

        return res.status(201).json({ 
            message: "Appointment booked successfully",
            appointment: appointmentResult.rows[0]
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
});

// Get user's appointments
router.get("/user", userAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user is a student or counselor
        const userResult = await pool.query(
            "SELECT role FROM Users WHERE id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const role = userResult.rows[0].role;
        let appointments;

        if (role === 'student') {
            // Get appointments where user is the student
            appointments = await pool.query(
                `SELECT 
                    a.id, 
                    a.appointment_time, 
                    a.status,
                    u.name as counselor_name,
                    c.specialization
                 FROM Appointments a
                 JOIN Counselors c ON a.counselor_id = c.id
                 JOIN Users u ON c.user_id = u.id
                 WHERE a.student_id = $1
                 ORDER BY a.appointment_time DESC`,
                [userId]
            );
        } else if (role === 'counselor') {
            // Get counselor id
            const counselorResult = await pool.query(
                "SELECT id FROM Counselors WHERE user_id = $1",
                [userId]
            );

            if (counselorResult.rows.length === 0) {
                return res.status(404).json({ message: "Counselor profile not found" });
            }

            const counselorId = counselorResult.rows[0].id;

            // Get appointments where user is the counselor
            appointments = await pool.query(
                `SELECT 
                    a.id, 
                    a.appointment_time, 
                    a.status,
                    u.name as student_name,
                    u.email as student_email
                 FROM Appointments a
                 JOIN Users u ON a.student_id = u.id
                 WHERE a.counselor_id = $1
                 ORDER BY a.appointment_time DESC`,
                [counselorId]
            );
        } else {
            return res.status(400).json({ message: "Invalid user role" });
        }

        return res.status(200).json({ 
            appointments: appointments.rows,
            role: role
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});

// Cancel appointment
router.patch("/cancel/:appointmentId", userAuth, async (req, res) => {
    const client = await pool.connect();
    
    try {
        const userId = req.user.id;
        const { appointmentId } = req.params;

        await client.query('BEGIN');

        // Get appointment details
        const appointmentResult = await client.query(
            `SELECT a.id, a.student_id, a.appointment_time, a.status, c.user_id as counselor_user_id
             FROM Appointments a
             JOIN Counselors c ON a.counselor_id = c.id
             WHERE a.id = $1`,
            [appointmentId]
        );

        if (appointmentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: "Appointment not found" });
        }

        const appointment = appointmentResult.rows[0];

        // Check if user is authorized to cancel (student or counselor)
        if (appointment.student_id !== userId && appointment.counselor_user_id !== userId) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: "Not authorized to cancel this appointment" });
        }

        // Check if appointment is already cancelled
        if (appointment.status === 'cancelled') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: "Appointment is already cancelled" });
        }

        // Update appointment status to cancelled
        await client.query(
            "UPDATE Appointments SET status = 'cancelled' WHERE id = $1",
            [appointmentId]
        );

        // Free up the slot by marking it as not booked
        await client.query(
            `UPDATE Availability 
             SET is_booked = FALSE 
             WHERE counselor_id = (SELECT counselor_id FROM Appointments WHERE id = $1)
               AND start_time = $2`,
            [appointmentId, appointment.appointment_time]
        );

        await client.query('COMMIT');

        return res.status(200).json({ message: "Appointment cancelled successfully" });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    } finally {
        client.release();
    }
});

module.exports = router;
