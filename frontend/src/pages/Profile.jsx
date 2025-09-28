"use client";

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Profile() {
  const { currentUser } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/users/appointments`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        const data = await res.json();
        if (res.ok) {
          setAppointments(data);
        } else {
          console.error("Error:", data.message);
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-blue p-6 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-yellow">
            {currentUser?.name}
          </h1>
          <p className="text-gray mt-1 capitalize">{currentUser?.role}</p>

          {/* Counselor Extra Options */}
          {currentUser?.role === "counselor" && (
            <div className="mt-6">
              <p className="text-gray mb-3">
                Please add slots so that students can avail your expertise.
              </p>
              <button
                onClick={() => navigate("/addslot")}
                className="bg-yellow text-black font-semibold px-5 py-2 rounded-md hover:bg-yellow/90 transition"
              >
                Add Slots
              </button>
            </div>
          )}
        </div>

        {/* Appointments */}
        <div>
          <h2 className="text-2xl font-bold text-yellow mb-6">
            {currentUser?.role === "student"
              ? "My Upcoming Appointments"
              : "My Counseling Sessions"}
          </h2>

          {loading ? (
            <p className="text-gray">Loading...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray">No upcoming appointments</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt) => {
                const dateObj = new Date(appt.appointment_time);
                const date = dateObj.toLocaleDateString();
                const time = dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={appt.id}
                    className="bg-blue rounded-lg shadow p-4 flex justify-between items-center"
                  >
                    <div>
                      {currentUser?.role === "student" ? (
                        <p className="font-semibold text-yellow">
                          Dr. {appt.counselor_name} ({appt.specialization})
                        </p>
                      ) : (
                        <p className="font-semibold text-yellow">
                          {appt.student_name} ({appt.student_email})
                        </p>
                      )}
                      <p className="text-gray text-sm">
                        {date} at {time}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        appt.status === "confirmed"
                          ? "bg-green text-black"
                          : "bg-gray text-black"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
