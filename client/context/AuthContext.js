"use client";
import { createContext, useContext, useState, useEffect } from "react";
import API from "@/lib/api";   // ✅ import your axios instance

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tempUser, setTempUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendOtp = async (email) => {
    try {
      setLoading(true);

      const res = await API.post("/auth/send-otp", { email });

      return {
        success: true,
        message: res.data.msg,
      };
    } catch (err) {
      console.error("Send OTP error:", err);

      return {
        success: false,
        message: err.response?.data?.msg || "Failed to send OTP",
      };
    } finally {
      setLoading(false);
    }
  };

 
useEffect(() => {
  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      // Calls your getMe controller which populates everything
      const res = await API.get("/auth/me"); 
      setUser(res.data); // This now includes year, gender, degreeType, etc.
    } catch (err) {
      console.error("Failed to load user profile:", err);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  loadUser();
}, []);

  const verifyOtp = async (email, otp) => {
    try {
      const res = await API.post("/auth/verify-otp", { email, otp });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.msg || "Invalid OTP",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        sendOtp,
        verifyOtp,
        tempUser,
        setTempUser,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}