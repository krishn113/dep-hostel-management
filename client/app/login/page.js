"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();

  const handle = async () => {
    if (!email.endsWith("@iitrpr.ac.in")) {
      alert("Use IITRPR email");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email,
        password,
      });

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
      alert(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb]">
      <div className="bg-white p-6 rounded-xl shadow w-80">
        <h2 className="text-xl font-bold mb-3">Login</h2>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded mb-2"
          placeholder="Email"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border rounded mb-2"
          placeholder="Password"
        />

        <div className="text-right mb-4">
          <a
            href="/forgot-password"
            className="text-xs text-indigo-600 hover:underline"
          >
            Forgot Password?
          </a>
        </div>

        <button
          onClick={handle}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}