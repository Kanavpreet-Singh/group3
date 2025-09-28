const express = require("express");
const router = express.Router();
const pool = require("../db");
const userAuth = require("../middleware/authentication/user");

router.post("/addslot", userAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { date, startTime, endTime } = req.body;

        if (!date || !startTime || !endTime) {
            return res.status(400).json({ message: "Please provide date, startTime and endTime" });
        }

        // Combine date with startTime and endTime to form proper timestamps
        const startTimestamp = new Date(`${date}T${startTime}`);
        const endTimestamp = new Date(`${date}T${endTime}`);

        if (startTimestamp >= endTimestamp) {
            return res.status(400).json({ message: "End time must be after start time" });
        }

        // Step 1: Fetch counselor id from user_id
        const counselorResult = await pool.query(
            "SELECT id FROM Counselors WHERE user_id = $1",
            [userId]
        );

        if (counselorResult.rows.length === 0) {
            return res.status(404).json({ message: "Counselor not found" });
        }

        const counselorId = counselorResult.rows[0].id;

        // Step 2: Insert into Availability table
        await pool.query(
            "INSERT INTO Availability (counselor_id, start_time, end_time) VALUES ($1, $2, $3)",
            [counselorId, startTimestamp, endTimestamp]
        );

        return res.status(201).json({ message: "Availability slot added successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;