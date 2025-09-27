import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Signin() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.token && data.user) {
        login(data.token, data.user); 
        navigate("/"); 
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
          Signin
        </h2>
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
        <button
          type="submit"
          className="w-full bg-yellow-500 text-black py-2 rounded font-bold hover:bg-green-400 transition"
        >
          Signin
        </button>
        <p className="text-gray-300 text-center">
          Don't have an account?{" "}
          <Link to="/signup" className="text-yellow-500 hover:underline">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
}
