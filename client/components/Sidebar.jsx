"use client";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const navConfig = {
  caretaker: [
    { label: "Overview", icon: "📊", href: "/dashboard/caretaker" },
    { label: "Student List", icon: "👥", href: "/dashboard/caretaker/students" },
    { label: "Complaints", icon: "🛠️", href: "/dashboard/caretaker/complaints" },
    { label: "Notices", icon: "📢", href: "/dashboard/caretaker/notices" },
    { label: "Forms", icon: "📝", href: "/dashboard/caretaker/forms" },
  ],
  warden: [
    { label: "Warden Dashboard", icon: "🏛️", href: "/dashboard/warden" },
    { label: "All Complaints", icon: "📋", href: "/dashboard/warden/complaints" },
    { label: "Guest House Forms", icon: "🏨", href: "/dashboard/warden/forms" },
  ],
};

export default function Sidebar({ role }) {
  const { logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const links = navConfig[role] || [];

  const handleLogoutClick = () => {
    if (confirmLogout) {
      logout();
    } else {
      setConfirmLogout(true);
      // Auto-reset after 3 seconds if they don't click again
      setTimeout(() => setConfirmLogout(false), 3000);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 font-bold text-indigo-600 text-xl tracking-tight uppercase">
        HostelHub
      </div>
      
      <nav className="mt-4 px-4 space-y-2 flex-1">
        {links.map((link) => (
          <a 
            key={link.href} 
            href={link.href} 
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-medium transition-all active:scale-95"
          >
            <span className="text-lg">{link.icon}</span> 
            <span className="text-sm uppercase tracking-wide font-bold">{link.label}</span>
          </a>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleLogoutClick} 
          className={`flex items-center justify-center gap-3 p-3 w-full rounded-xl transition-all duration-300 text-sm font-black uppercase tracking-widest
            ${confirmLogout 
              ? "bg-rose-500 text-white shadow-lg shadow-rose-100" 
              : "text-slate-400 hover:bg-slate-50 hover:text-rose-500"
            }`}
        >
          {confirmLogout ? (
            <>⚠️ Confirm Logout?</>
          ) : (
            <>🚪 Logout</>
          )}
        </button>
        
        {confirmLogout && (
          <p className="text-[10px] text-rose-400 text-center mt-2 font-bold animate-pulse">
            Click again to sign out
          </p>
        )}
      </div>
    </aside>
  );
}