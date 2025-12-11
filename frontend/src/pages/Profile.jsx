"use client";

import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AdminAnalytics from "../components/AdminAnalytics";
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
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/appointments/user`, {
          headers: {
            token: token,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setAppointments(data.appointments || []);
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
              ? "My Appointments"
              : "My Counseling Sessions"}
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <span className="w-8 h-8 border-4 border-yellow border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-blue/50 rounded-lg p-8 text-center">
              <p className="text-gray">No appointments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt) => {
                const dateObj = new Date(appt.appointment_time);
                const date = dateObj.toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                const time = dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={appt.id}
                    className="bg-blue rounded-lg shadow p-4 flex justify-between items-center border border-gray hover:border-yellow/50 transition duration-200"
                  >
                    <div className="flex-1">
                      {currentUser?.role === "student" ? (
                        <p className="font-semibold text-yellow">
                          {appt.counselor_name}
                        </p>
                      ) : (
                        <p className="font-semibold text-yellow">
                          {appt.student_name}
                        </p>
                      )}
                      {currentUser?.role === "student" && appt.specialization && (
                        <p className="text-sm text-gray-400">{appt.specialization}</p>
                      )}
                      {currentUser?.role === "counselor" && appt.student_email && (
                        <p className="text-sm text-gray-400">{appt.student_email}</p>
                      )}
                      <p className="text-gray text-sm mt-1">
                        {date} at {time}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appt.status === "scheduled"
                            ? "bg-green-500 text-white"
                            : appt.status === "completed"
                            ? "bg-blue-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {appt.status}
                      </span>
                      {appt.status === "scheduled" && (
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to cancel this appointment?')) {
                              try {
                                const token = localStorage.getItem("token");
                                const res = await fetch(`${API_BASE}/api/appointments/cancel/${appt.id}`, {
                                  method: 'PATCH',
                                  headers: {
                                    token: token,
                                  },
                                });
                                if (res.ok) {
                                  setAppointments(appointments.map(a => 
                                    a.id === appt.id ? { ...a, status: 'cancelled' } : a
                                  ));
                                } else {
                                  const data = await res.json();
                                  alert(data.message || 'Failed to cancel appointment');
                                }
                              } catch (err) {
                                console.error('Error cancelling appointment:', err);
                                alert('Failed to cancel appointment');
                              }
                            }
                          }}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition duration-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin-only message analytics */}
        {currentUser?.role === "admin" && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-yellow mb-4">Admin Message Analytics</h2>
            <AdminAnalytics />
          </div>
        )}
      </div>
    </div>
  );
}
