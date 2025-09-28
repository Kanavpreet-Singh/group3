import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    specialization: "",
    bio: "",
    yearsOfExperience: "",
  });

  const handleChange = (e) => {
    const value = e.target.name === 'yearsOfExperience' 
      ? parseInt(e.target.value) || '' 
      : e.target.value;
      
    setFormData({ ...formData, [e.target.name]: value });
    setError(""); // Clear any previous errors
  };

  const validateForm = () => {
    if (formData.role === 'counselor') {
      if (!formData.specialization?.trim()) {
        setError("Specialization is required for counselors");
        return false;
      }
      if (!formData.bio?.trim()) {
        setError("Bio is required for counselors");
        return false;
      }
      if (!formData.yearsOfExperience || formData.yearsOfExperience < 0) {
        setError("Valid years of experience is required for counselors");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate form
    if (!validateForm()) return;
    
    // Remove counselor fields if role is not counselor
    const submitData = formData.role === 'counselor' 
      ? formData 
      : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        };

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Signup successful! Please signin.");
        navigate("/signin");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-blue-900 p-8 rounded-lg w-full max-w-md space-y-4 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-yellow-500 text-center mb-6">
          {formData.role === 'counselor' 
            ? 'Counselor Signup' 
            : formData.role === 'admin' 
              ? 'Admin Signup' 
              : 'Student Signup'}
        </h2>

        {/* Basic Information */}
        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-400 bg-black text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-400 bg-black text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-400 bg-black text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-400 bg-black text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
          >
            <option value="student">Student</option>
            <option value="counselor">Counselor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Counselor Specific Fields */}
        {formData.role === 'counselor' && (
          <div className="space-y-4 pt-4 border-t border-gray-600">
            <h3 className="text-lg font-semibold text-yellow-500">Professional Information</h3>
            
            <input
              type="text"
              name="specialization"
              placeholder="Specialization (e.g., Anxiety, Depression, Career Counseling)"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-400 bg-black text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
              required
            />
            
            <textarea
              name="bio"
              placeholder="Professional Bio - Tell us about your experience and approach to counseling"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 rounded-xl border border-gray-400 bg-black text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition resize-none"
              required
            />
            
            <input
              type="number"
              name="yearsOfExperience"
              placeholder="Years of Experience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              min="0"
              className="w-full p-3 rounded-xl border border-gray-400 bg-black text-gray-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
              required
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        {/* Sign In Link */}
        <p className="text-gray-300 text-center">
          Already have an account?{" "}
          <Link to="/signin" className="text-yellow-500 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
