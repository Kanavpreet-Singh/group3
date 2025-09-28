import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AskAi from "./pages/AskAi";

import Footer from "./components/Footer";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Blogs from "./pages/Blogs";
import BookAppointment from "./pages/BookAppointment";

function App() {
  return (
    <div className="App">
      {/* Navbar visible on all pages */}
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/askai" element={<AskAi />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/book" element={<BookAppointment />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
