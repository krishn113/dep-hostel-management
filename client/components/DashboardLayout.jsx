"use client";
import { useState, useEffect} from "react";
import { useAuth } from "../context/AuthContext";
import { urlBase64ToUint8Array } from "@/lib/pushUtils";
import { useRouter, usePathname } from "next/navigation";
import API from "@/lib/api";
import {
  LogOut, Menu, X, LayoutDashboard, Bell, Wrench, FileText, Search,
  Users, ClipboardList, Building2, UserCog, Home, Mail, Phone, DoorOpen,
  Pencil, Check
} from "lucide-react";

const ICONS = {
  home: LayoutDashboard, notices: Bell, complaints: Wrench, forms: FileText,
  lostfound: Search, students: Users, complaints2: ClipboardList,
  allocations: Building2, staff: UserCog, hostel: Home,
};

// 1. Sidebar Component (Moved outside to prevent disappearing/re-mount errors)
const SidebarContent = ({ currentMenu, pathname, handleNav, isCaretaker, isPastelRole, logoStyles, sideActiveStyles, sideTextStyles, setSidebarOpen }) => {
  const { logout } = useAuth();

  const handleLogoutClick = () => {
    // This triggers a standard browser alert dialog
    const confirmed = window.confirm("Are you sure you want to log out of HostelHub?");
    if (confirmed) {
      logout();
    }
  };

    return (
    <>
      <div className="p-6 flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${logoStyles}`}>HostelHub</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Management System</p>
        </div>
        <button
          className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {currentMenu.map((item) => {
          const Icon = ICONS[item.iconKey] || LayoutDashboard;
          const active = pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all text-sm ${
                active ? sideActiveStyles : sideTextStyles
              }`}
            >
              <Icon size={18} className={active ? (isPastelRole ? "text-blue-700" : "text-indigo-400") : "text-slate-400"} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className={`p-4 border-t ${isCaretaker ? "border-slate-800" : "border-slate-100"}`}>
        <button
          onClick={handleLogoutClick}
          className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-2xl transition-all text-sm 
            ${isCaretaker 
              ? "text-rose-600 hover:bg-rose-50" 
              : "text-rose-500 hover:bg-rose-100"
            }`}
        >
          <DoorOpen size={18} />
          Logout
        </button>
      </div>
    </>
  );
};

  export default function DashboardLayout({ children, role }) {
  // 2. Define user FIRST
  const { user, setUser, logout } = useAuth(); 
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);


useEffect(() => {
  const setupNotifications = async () => {
    // 1. Browser Support Check
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications are not supported in this browser.");
      return;
    }

    try {
      // 2. Request Permission explicitly if not granted/denied yet
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      if (Notification.permission !== "granted") {
        console.warn("Notification permission was denied.");
        return;
      }

      // 3. Service Worker Readiness
      const registration = await navigator.serviceWorker.ready;

      // 4. Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();

      // 5. If no subscription, create one
      if (!subscription) {
        const rawKey = process.env.NEXT_PUBLIC_VAPID_KEY;

        // Validation & Sanitization
        if (!rawKey || rawKey.includes("YOUR_PUBLIC")) {
          console.error("VAPID Public Key is missing from .env.local");
          return;
        }

        // Remove any accidental whitespace/newlines from the .env string
        const publicKey = rawKey.trim();

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        console.log("New Push Subscription created:", subscription);
      }

      // 6. ALWAYS sync with backend 
      // This ensures if the user cleared their database but the browser kept the sub, 
      // the server gets the update.
      await API.post("/auth/save-subscription", {
        subscription: subscription,
        device: navigator.userAgent.includes("Mobi") ? "mobile" : "desktop"
      });

    } catch (error) {
      // Specifically catch the InvalidAccessError for debugging
      if (error.name === 'InvalidAccessError') {
        console.error("VAPID Key format is invalid. Check your conversion utility.");
      } else {
        console.error("Push subscription process failed:", error);
      }
    }
  };

  if (user) {
    setupNotifications();
  }
}, [user]);

  const handleSavePhone = async () => {
    if (!/^[0-9]{10}$/.test(phoneInput)) { setPhoneError("Enter a valid 10-digit phone number"); return; }
    setPhoneLoading(true); setPhoneError("");
    try {
      const res = await API.patch("/auth/update-phone", { phone: phoneInput });
      setUser(res.data); setEditingPhone(false);
    } catch (err) { setPhoneError(err.response?.data?.msg || "Failed to update phone"); }
    finally { setPhoneLoading(false); }
  };

  const menus = {
    student: [
      { label: "Overview", iconKey: "home", path: "/dashboard/student" },
      { label: "Notices", iconKey: "notices", path: "/dashboard/student/notices" },
      { label: "Complaints", iconKey: "complaints", path: "/dashboard/student/complaints" },
      { label: "Forms", iconKey: "forms", path: "/dashboard/student/forms" },
      { label: "Lost & Found", iconKey: "lostfound", path: "/dashboard/student/lost-found" },
    ],
    caretaker: [
      { label: "Students Lists", iconKey: "students", path: "/dashboard/caretaker/students" },
      { label: "Complaints", iconKey: "complaints", path: "/dashboard/caretaker/complaints" },
      { label: "Notices", iconKey: "notices", path: "/dashboard/caretaker/notices" },
      { label: "Forms", iconKey: "forms", path: "/dashboard/caretaker/forms" },
    ],
    warden: [
      { label: "Overview", iconKey: "home", path: "/dashboard/warden" },
      { label: "Students Lists", iconKey: "students", path: "/dashboard/warden/students" },
      { label: "Complaints", iconKey: "complaints", path: "/dashboard/warden/complaints" },
      { label: "Notices", iconKey: "notices", path: "/dashboard/warden/notices" },
      { label: "Forms", iconKey: "forms", path: "/dashboard/warden/forms" },
    ],
    admin: [
      { label: "Overview", iconKey: "home", path: "/dashboard/admin" },
      { label: "Allocations", iconKey: "allocations", path: "/dashboard/admin/allocations" },
      { label: "Hostels", iconKey: "hostel", path: "/dashboard/admin/hostels" },
      { label: "Staff", iconKey: "staff", path: "/dashboard/admin/staff" },
    ],
  };

  let currentMenu = menus[role] || [];
  if ((role === "student" || user?.role === "student") && user && !user.roomNumber) {
    currentMenu = currentMenu.filter(m => m.label === "Overview");
  }

  const handleNav = (path) => { router.push(path); setSidebarOpen(false); };

  const isCaretaker = role === "caretaker" || user?.role === "caretaker";
  const isStudent = role === "student" || user?.role === "student";
  const isWarden = role === "warden" || user?.role === "warden";
  const isPastelRole = isCaretaker || isStudent || isWarden;

  const bgStyles = isPastelRole ? "bg-[#F0F7FF]" : "bg-slate-50";
  const sidebarStyles = isPastelRole ? "bg-[#B6D8F2] border-blue-200" : "bg-white border-slate-200";
  const headerStyles = isPastelRole ? "bg-[#D1E9FF]/90 border-blue-200" : "bg-white/80 border-slate-200";
  const sideTextStyles = isPastelRole ? "text-slate-700 hover:bg-white/40 hover:text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700";
  const sideActiveStyles = isPastelRole ? "bg-white/60 text-blue-800 border-none" : "bg-indigo-50 text-indigo-600";
  const logoStyles = isPastelRole ? "text-blue-700" : "text-indigo-600";
  const headerTextStyles = isPastelRole ? "text-slate-800" : "text-slate-800";

  const sidebarProps = { currentMenu, pathname, handleNav, isCaretaker, isPastelRole, logoStyles, sideActiveStyles, sideTextStyles, setSidebarOpen };



  return (
    <div className={`flex min-h-screen font-sans ${bgStyles}`}>
      <aside className={`hidden md:flex w-64 border-r flex-col fixed h-full z-20 ${sidebarStyles}`}>
        <SidebarContent {...sidebarProps} />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-72 border-r flex flex-col z-40 transform transition-transform duration-300 md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${sidebarStyles}`}>
        <SidebarContent {...sidebarProps} />
      </aside>

      <div className="flex-1 md:ml-64 min-w-0">
        <header className={`h-16 md:h-20 backdrop-blur-md border-b sticky top-0 z-30 px-4 md:px-8 flex justify-between items-center gap-4 ${headerStyles}`}>
          <div className="flex items-center gap-3 min-w-0">
            <button className={`md:hidden p-2 rounded-xl shrink-0 ${isCaretaker ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-600"}`} onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            {user?.hostelName && role !== "admin" && (
              <h2 className={`text-base md:text-xl font-black tracking-tight flex items-center gap-2 truncate ${headerTextStyles}`}>
                <Home size={18} className="text-indigo-400 shrink-0" />
                <span className="truncate">{user.hostelName} {user.hostelType}</span>
              </h2>
            )}
          </div>

          <div onClick={() => setIsProfileModalOpen(true)} className={`flex items-center gap-3 px-3 py-2 rounded-2xl border cursor-pointer transition shrink-0 ${isPastelRole ? "bg-white/40 border-blue-200 hover:bg-white/60" : "bg-slate-100 border-slate-200 hover:bg-slate-200"}`}>
            <div className="text-right hidden sm:block">
              <p className={`text-[10px] font-black uppercase tracking-tighter ${isPastelRole ? "text-slate-400" : "text-indigo-400"}`}>
                {user?.role === "caretaker" || user?.role === "warden" ? `${user?.role} ${user?.hostelName || ""}`.trim() : user?.role}
              </p>
              <p className={`text-sm font-bold ${headerTextStyles}`}>{user?.name}</p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 text-sm">
              {user?.name?.[0] || "A"}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">{children}</main>
      </div>

      {/* --- PROFILE MODAL --- */}
      {isProfileModalOpen && user && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-sm w-full rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
            <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-700" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center text-3xl font-black text-indigo-600 shadow-xl border-4 border-indigo-100 mb-3">
                  {user.name?.charAt(0) || "U"}
                </div>
                <h2 className="text-2xl font-black text-white leading-tight">{user.name}</h2>
                <p className="text-indigo-100 text-sm font-medium mt-1 capitalize">{user.role}</p>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {(user.role === "caretaker" || user.role === "warden" || user.role === "student") && (
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{user.role === "student" ? "Assigned Location" : "Assigned Hostel"}</p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-800 font-bold flex items-center gap-2"><Home size={14} className="text-indigo-400" />{user.hostelName || "Unassigned"}</span>
                      {user.hostelType && <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md">{user.hostelType} Hostel</span>}
                    </div>
                    {user.role === "student" && user.roomNumber && (
                      <div className="pt-2 border-t border-slate-200/60 mt-1">
                        <span className="text-slate-700 font-bold text-sm flex items-center gap-2"><DoorOpen size={13} className="text-slate-400" />Room {user.roomNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Contact Details</p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
                  <p className="text-slate-800 font-bold flex items-center gap-3"><Mail size={15} className="text-slate-400 shrink-0" /><span className="text-sm truncate">{user.email}</span></p>
                  <div className="pt-3 border-t border-slate-200/60">
                    <div className="flex items-center gap-3">
                      <Phone size={15} className="text-slate-400 shrink-0" />
                      {!editingPhone ? (
                        <>
                          <span className="text-sm font-bold text-slate-800 flex-1">{user.phone || <span className="text-slate-400 italic">No phone</span>}</span>
                          <button onClick={() => { setPhoneInput(user.phone || ""); setEditingPhone(true); }} className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-500"><Pencil size={12} /></button>
                        </>
                      ) : (
                        <div className="flex-1 flex gap-2">
                          <input type="tel" value={phoneInput} onChange={e => setPhoneInput(e.target.value)} className="flex-1 bg-white border rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-indigo-400" />
                          <button onClick={handleSavePhone} className="p-1.5 bg-indigo-600 text-white rounded-lg"><Check size={12} /></button>
                          <button onClick={() => setEditingPhone(false)} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg"><X size={12} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsProfileModalOpen(false)} className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition">Close Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}