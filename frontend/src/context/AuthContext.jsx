import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("currentUser");
    if (token && user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    setIsLoggedIn(true);
    setCurrentUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
