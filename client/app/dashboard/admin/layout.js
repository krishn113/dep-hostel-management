"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Shuffle,
  Users,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Hostels", href: "/dashboard/admin/hostels", icon: Building2 },
    { name: "Allocations", href: "/dashboard/admin/allocations", icon: Shuffle },
    { name: "Staff", href: "/dashboard/admin/staff", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* 🔵 SIDEBAR */}
      <aside className="w-64 bg-white border-r shadow-sm p-6 flex flex-col">

        {/* Logo / Title */}
        <div className="mb-10">
          <h2 className="text-2xl font-black text-indigo-600">
            HostelHub
          </h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            Management System
          </p>
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = pathname === tab.href;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition
                  ${active
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-100"}
                `}
              >
                <Icon size={18} />
                {tab.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom space */}
        <div className="mt-auto text-xs text-slate-400 pt-10">
          Admin Panel
        </div>
      </aside>

      {/* 🔵 MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-slate-500 italic">
            Manage hostels, allocations & staff
          </p>
        </div>

        {/* Page Content */}
        <div className="bg-white p-6 md:p-10 rounded-[2rem] border shadow-sm">
          {children}
        </div>

      </main>
    </div>
  );
}
