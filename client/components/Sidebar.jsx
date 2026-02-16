"use client";
import { useAuth } from "../context/AuthContext";

const menus = {
  student: ["Profile", "Complaints", "Notices", "Forms"],
  caretaker: ["Students", "Rooms", "Complaints", "Notices"],
  warden: ["Complaints", "Notices", "Students"],
  admin: ["Hostels", "Students", "Wardens", "Caretakers"]
};

export default function Sidebar() {
  const { role } = useAuth();

  return (
    <div className="w-60 bg-purple-100 h-full p-4">
      {menus[role].map((item) => (
        <div key={item} className="bg-white p-3 rounded-lg mb-3 shadow hover:bg-purple-200 cursor-pointer">
          {item}
        </div>
      ))}
    </div>
  );
}
