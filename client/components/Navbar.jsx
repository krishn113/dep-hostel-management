"use client";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { role, setRole } = useAuth();

  return (
    <div className="h-14 bg-white shadow flex justify-between items-center px-6">
      <h1 className="font-bold text-purple-600 text-lg">Hostel Manager</h1>

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border px-3 py-1 rounded-lg bg-purple-100"
      >
        <option value="student">Student</option>
        <option value="caretaker">Caretaker</option>
        <option value="warden">Warden</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
}
