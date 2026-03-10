"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import StatsGrid from "@/components/StatsGrid";
import API from "@/lib/api";
import { MessageSquare, Bell, FileText, ArrowUpRight } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [latestNotice, setLatestNotice] = useState(null);
  const [statsData, setStatsData] = useState({ issues: 0, notices: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.year || !user?.gender || !user?.degreeType) return;

      try {
        const allocRes = await API.get("/allocations/find", {
          params: { year: user.year, gender: user.gender, degreeType: user.degreeType }
        });

        const hostelId = allocRes.data?.hostelId?._id || allocRes.data?.hostelId;

        if (hostelId) {
          const noticeRes = await API.get("/notices", { params: { hostel: hostelId } });
          const complaintRes = await API.get("/complaints");
          const activeIssues = complaintRes.data.filter(c => c.status !== 'Resolved').length;

          if (noticeRes.data.length > 0) {
            const sorted = noticeRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setLatestNotice(sorted[0]);
            setStatsData({ issues: activeIssues, notices: noticeRes.data.length });
          }
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      }
    };

    fetchDashboardData();
  }, [user, activeTab]);

  if (!user) return <div className="p-10 text-center text-indigo-600 font-bold animate-pulse">Loading Student Portal...</div>;

  return (
    <DashboardLayout role="student" activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        
        {/* HEADER SECTION - Stacked on mobile, side-by-side on md */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Hey, {user.name?.split(' ')[0]}!
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-0.5 font-medium">
              You are currently in <span className="text-indigo-600 font-bold">{user.hostelName} Hostel</span>
            </p>
          </div>
          
          <button 
            onClick={() => router.push("/dashboard/student/complaints")} 
            className="w-full md:w-auto bg-indigo-600 text-white px-6 py-4 md:py-3 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={18} />
            Post Complaint
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="space-y-6">
          {/* StatsGrid - Ensure your StatsGrid component uses grid-cols-2 or similar on small screens */}
          <StatsGrid stats={[
            { label: "My Room", value: user.roomNumber || "Pending", colorClass: "bg-emerald-500" },
            { label: "Active Issues", value: statsData.issues.toString(), colorClass: "bg-rose-500" },
            { label: "New Notices", value: statsData.notices.toString(), colorClass: "bg-amber-500" },
            { label: "Hostel", value: user.hostelName || "N/A", colorClass: "bg-indigo-500" },
          ]} />
          
          {/* Cards Grid - 1 col on mobile, 2 col on md */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            
            {/* Latest Notice Card */}
            <div className="p-5 md:p-6 bg-white border border-slate-100 rounded-[2rem] md:rounded-3xl shadow-sm relative overflow-hidden group min-h-[160px] flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base mb-2">Latest Notice 📢</h3>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                  {latestNotice ? latestNotice.title : "No recent updates for your hostel."}
                </p>
              </div>
              <button 
                onClick={() => router.push("/dashboard/student/notices")} 
                className="mt-4 text-indigo-600 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                Read More <ArrowUpRight size={14} />
              </button>
            </div>

            {/* Activity Card - Stylized */}
            <div className="p-5 md:p-6 bg-indigo-600 rounded-[2rem] md:rounded-3xl shadow-xl text-white shadow-indigo-100 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base mb-2 text-indigo-50">Technician Visit 🛠️</h3>
                <p className="text-indigo-100/80 text-sm leading-relaxed">
                  Your electrical issue in Room {user.roomNumber} has been acknowledged.
                </p>
              </div>
              <div className="mt-6 bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl text-[10px] font-bold w-fit">
                Arrival: Tomorrow, 10:30 AM
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}