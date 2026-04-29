"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import API from "@/lib/api";
import toast from "react-hot-toast";

function LoginSuccessHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleLogin = async () => {
      const token = searchParams.get("token");

      if (token) {
        // 1. Save the token to localStorage
        localStorage.setItem("token", token);

        try {
          // 2. Hydrate the user profile (just like your login page does)
          const profileRes = await API.get("/auth/me");
          setUser(profileRes.data);

          const role = profileRes.data.role;
          toast.success("Welcome back!");

          // 3. Redirect based on role
          if (role === "admin") router.push("/dashboard/admin");
          else if (role === "warden") router.push("/dashboard/warden");
          else if (role === "caretaker") router.push("/dashboard/caretaker/students");
          else router.push("/dashboard/student");

        } catch (error) {
          console.error("Failed to fetch profile after Google login:", error);
          toast.error("Session initialization failed");
          router.push("/login");
        }
      } else {
        // No token found? Send them back to login
        router.push("/login");
      }
    };

    handleLogin();
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-700">Finalizing login...</h2>
        <p className="text-slate-500">Please wait while we sync your profile.</p>
      </div>
    </div>
  );
}

// Next.js requires Suspense for useSearchParams() in static rendering
export default function LoginSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginSuccessHandler />
    </Suspense>
  );
}