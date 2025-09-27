import { useState, useContext } from "react";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, logout, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <nav className="bg-blue-900 text-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 text-xl font-bold text-yellow-500">
            <Link to="/">NeuroCare</Link>
          </div>

          <div className="hidden md:flex space-x-8 text-gray-400 items-center">
            <Link to="/" className="hover:text-yellow-400 transition">Home</Link>
            <Link to="/askai" className="hover:text-yellow-400 transition">AskAI</Link>
            {!isLoggedIn && (
              <>
                <Link to="/signup" className="hover:text-yellow-400 transition">Signup</Link>
                <Link to="/signin" className="hover:text-yellow-400 transition">Signin</Link>
              </>
            )}
            {isLoggedIn && (
              <>

                <span className="text-green-400 font-semibold">
                  {currentUser?.role}-
                  {currentUser?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="hover:text-red-400 transition font-semibold ml-4"
                >
                  Logout
                </button>
              </>
            )}
          </div>

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

      {isOpen && (
        <div className="md:hidden bg-black px-4 py-3 space-y-2">
          <Link to="/" className="block text-gray-400 hover:text-yellow-400 transition">Home</Link>
          <Link to="/askai" className="block text-gray-400 hover:text-yellow-400 transition">AskAI</Link>
          {!isLoggedIn && (
            <>
              <Link to="/signup" className="block text-gray-400 hover:text-yellow-400 transition">Signup</Link>
              <Link to="/signin" className="block text-gray-400 hover:text-yellow-400 transition">Signin</Link>
            </>
          )}
          {isLoggedIn && (
            <>
              <span className="block text-green-400 font-semibold">{currentUser?.role}-{currentUser?.name}</span>
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
