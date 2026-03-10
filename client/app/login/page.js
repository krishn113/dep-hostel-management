"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();
  const router = useRouter();

  const handle = async () => {
    if (!email.endsWith("@iitrpr.ac.in")) {
      toast.error("Please use your IIT Ropar email");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);

      setUser({
        email: res.data.email,
        role: res.data.role,
      });

      if (res.data.role === "admin") router.push("/dashboard/admin");
      else if (res.data.role === "warden") router.push("/dashboard/warden");
      else if (res.data.role === "caretaker") router.push("/dashboard/caretaker");
      else router.push("/dashboard/student");

    } catch (err) {
      toast.error(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">

        {/* LOGO */}
        <div className="flex justify-center mb-4">
          <img
            src="/iitrpr-logo.png"
            alt="IIT Ropar"
            className="h-14"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Hostel Management Portal
        </h2>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="IITRPR Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex justify-end">

            <a
              onClick={() => router.push("/forgot-password")}
              className="text-sm text-indigo-600 hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          <button
            onClick={handle}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>



    {/* SIGNUP LINK */}
    <p className="text-center text-sm text-gray-600">
      Don't have an account?{" "}
      <span
        onClick={() => router.push("/signup")}
        className="text-indigo-600 font-medium cursor-pointer hover:underline"
      >
        Sign up
      </span>
    </p>

        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Only IIT Ropar email accounts are allowed
        </p>

      </div>

    </div>
  );
}