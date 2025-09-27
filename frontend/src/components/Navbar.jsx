import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-900 text-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Site Name */}
          <div className="flex-shrink-0 text-xl font-bold text-yellow-500">
            <Link to="/home">NeuroCare</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 text-gray-400">
            <Link to="/" className="hover:text-yellow-400 transition">Home</Link>
            <Link to="/askai" className="hover:text-yellow-400 transition">AskAI</Link>
            <Link to="/login" className="hover:text-yellow-400 transition">Login</Link>
          </div>

          {/* Mobile Menu Button */}
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

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-black px-4 py-3 space-y-2">
          <Link to="/" className="block text-gray-400 hover:text-yellow-400 transition">Home</Link>
          <Link to="/askai" className="block text-gray-400 hover:text-yellow-400 transition">AskAI</Link>
          <Link to="/login" className="block text-gray-400 hover:text-yellow-400 transition">Login</Link>
        </div>
      )}
    </nav>
  );
}
