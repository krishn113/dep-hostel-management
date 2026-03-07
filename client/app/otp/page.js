"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import API from "@/lib/api";
import axios from "axios";

export default function OTP() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { tempUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!tempUser?.email) {
      router.replace("/signup");
    }
  }, [tempUser, router]);

  const handle = async () => {
    if (!otp) return alert("Enter OTP");

    try {
      setLoading(true);

      await API.post("/auth/verify-otp", {
        email: tempUser.email,
        otp,
      });

      await API.post("/auth/signup", tempUser);

      alert("Signup Successful! Redirecting to login...");
      router.push("/login");

    } catch (err) {
      alert(err.response?.data?.msg || err.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb]">
      <div className="bg-white p-6 rounded-xl shadow w-80 text-center">
        <h2 className="text-xl font-bold mb-2">Verify OTP</h2>
        <p className="text-sm mb-3">{tempUser?.email}</p>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          className="w-full p-3 border rounded mb-4 text-center tracking-widest"
          placeholder="Enter OTP"
        />

        <button
          onClick={handle}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}
