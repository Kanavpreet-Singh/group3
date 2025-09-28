import { useState, useContext, useEffect, useRef } from "react";
import { Menu, X, User } from "lucide-react"; // User icon for account circle
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isLoggedIn, logout, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-blue-900 text-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 text-xl font-bold text-yellow-500">
            <Link to="/">NeuroCare</Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8 text-gray-400 items-center relative">
            <Link to="/" className="hover:text-yellow-400 transition">Home</Link>
            <Link to="/askai" className="hover:text-yellow-400 transition">AskAI</Link>
            <Link to="/blogs" className="hover:text-yellow-400 transition">Blogs</Link>

            {!isLoggedIn && (
              <>
                <Link to="/signup" className="hover:text-yellow-400 transition">Signup</Link>
                <Link to="/signin" className="hover:text-yellow-400 transition">Signin</Link>
              </>
            )}

            {isLoggedIn && (
              <div className="relative" ref={dropdownRef}>
                {/* Account Circle */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500 text-blue-900 font-bold hover:bg-yellow-400 transition"
                >
                  <User size={20} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg py-2 text-gray-800 z-50">
                    <div className="px-4 py-2 text-sm text-gray-600 border-b">
                      {currentUser?.role} - {currentUser?.name}
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-200 focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-black px-4 py-3 space-y-2">
          <Link to="/" className="block text-gray-400 hover:text-yellow-400 transition">Home</Link>
          <Link to="/askai" className="block text-gray-400 hover:text-yellow-400 transition">AskAI</Link>
          <Link to="/blogs" className="block text-gray-400 hover:text-yellow-400 transition">Blogs</Link>

          {!isLoggedIn && (
            <>
              <Link to="/signup" className="block text-gray-400 hover:text-yellow-400 transition">Signup</Link>
              <Link to="/signin" className="block text-gray-400 hover:text-yellow-400 transition">Signin</Link>
            </>
          )}

          {isLoggedIn && (
            <>
              <span className="block text-green-400 font-semibold">
                {currentUser?.role} - {currentUser?.name}
              </span>
              <Link
                to="/profile"
                className="block text-gray-400 hover:text-yellow-400 transition"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block text-red-400 font-semibold w-full text-left"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
