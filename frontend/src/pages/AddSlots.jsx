import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function AddSlots() {
  const { user } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !startTime || !endTime) {
      alert("Please fill all fields");
      return;
    }

    // Build local start and end Date objects
    const startDateTime = new Date(selectedDate);
    const [startHour, startMin] = startTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(selectedDate);
    const [endHour, endMin] = endTime.split(":").map(Number);
    endDateTime.setHours(endHour, endMin, 0, 0);

    // Validation
    const nowPlus1Hour = new Date(Date.now() + 60 * 60 * 1000);
    if (startDateTime < nowPlus1Hour) {
      alert("Start time must be at least 1 hour from now");
      return;
    }

    if (startDateTime >= endDateTime) {
      alert("End time must be after start time");
      return;
    }

    // ❌ Disallow slots that end after 23:00
    if (endHour > 23 || (endHour === 23 && endMin > 0)) {
      alert("Slots must be completed before 23:00 (lab closing time)");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Format date in local time (YYYY-MM-DD)
      const localDate = selectedDate.toLocaleDateString("en-CA");

      const res = await fetch(`${BASE_URL}/api/appointments/addslot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          date: localDate,
          startTime,
          endTime,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        alert("Slot added successfully!");
        setSelectedDate(null);
        setStartTime("");
        setEndTime("");
      } else {
        alert(data.message || "Error adding slot");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-blue-900 p-8 rounded-lg w-96 space-y-4 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-yellow-500 text-center">
          Add Availability Slot
        </h2>

        <div>
          <label className="block mb-1">Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            minDate={new Date()}
            className="w-full p-2 rounded border border-gray-400 bg-black text-gray-100 focus:outline-yellow-500"
            placeholderText="Click to select a date"
          />
        </div>

        <div>
          <label className="block mb-1">Start Time (24h):</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 rounded border border-gray-400 bg-black text-gray-100 focus:outline-yellow-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1">End Time (24h):</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 rounded border border-gray-400 bg-black text-gray-100 focus:outline-yellow-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-2 rounded font-bold hover:bg-green-400 transition"
        >
          {loading ? "Adding..." : "Add Slot"}
        </button>
      </form>
    </div>
  );
}
