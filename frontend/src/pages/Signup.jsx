import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Signup successful! Please signin.");
        navigate("/signin");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-blue-900 p-8 rounded-lg w-96 space-y-4 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-yellow-500 text-center">
          Signup
        </h2>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 rounded border border-gray-400 bg-black text-gray-100"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 rounded border border-gray-400 bg-black text-gray-100"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 rounded border border-gray-400 bg-black text-gray-100"
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full p-2 rounded border border-gray-400 bg-black text-gray-100"
        >
          <option value="student">Student</option>
          <option value="counselor">Counselor</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="w-full bg-yellow-500 text-black py-2 rounded font-bold hover:bg-green-400 transition"
        >
          Signup
        </button>
        <p className="text-gray-300 text-center">
          Already have an account?{" "}
          <Link to="/signin" className="text-yellow-500 hover:underline">
            Signin
          </Link>
        </p>
      </form>
    </div>
  );
}
