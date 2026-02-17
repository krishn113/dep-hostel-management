"use client";

import { Building2, Users, Clock } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      label: "Total Hostels",
      value: "--",
      icon: Building2,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      label: "Total Students",
      value: "--",
      icon: Users,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      label: "Pending Requests",
      value: "--",
      icon: Clock,
      color: "bg-amber-50 text-amber-600 border-amber-100",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">

      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Admin Overview
          </h1>
          <p className="text-slate-500 font-medium italic">
            Quick insights into hostel system activity
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className={`bg-white p-8 rounded-[2.5rem] border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${s.color}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-70">
                  {s.label}
                </div>
                <div className="p-3 rounded-xl bg-white/60 backdrop-blur-md">
                  <Icon size={20} />
                </div>
              </div>

              <p className="text-4xl font-black text-slate-900 tracking-tight">
                {s.value}
              </p>
            </div>
          );
        })}

      </div>

      {/* INFO CARD */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 text-white p-10 rounded-[2.5rem] shadow-xl shadow-indigo-200 animate-in zoom-in-95 duration-500">

        <h2 className="text-xl font-black mb-3">
          Manage Your Hostel System 🚀
        </h2>

        <p className="text-indigo-100 text-sm leading-relaxed max-w-2xl">
          Use the sidebar to manage hostels, allocation rules, and staff.  
          This dashboard will soon show real‑time analytics, occupancy stats,
          and complaint insights.
        </p>

      </div>

    </div>
  );
}
