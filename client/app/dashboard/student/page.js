"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import StatsGrid from "@/components/StatsGrid";
import API from "@/lib/api";
import {
  MessageSquare,
  Bell,
  ArrowUpRight,
  Home,
  AlertCircle,
  BellRing,
  Pin,
  Zap,
  Wrench,
  Clock,
  LogOut
} from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [techVisit, setTechVisit] = useState(null);
  const [pinnedNotices, setPinnedNotices] = useState([]);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);
  const [statsData, setStatsData] = useState({ issues: 0, notices: 0 });
  const [caretakerInfo, setCaretakerInfo] = useState(null);
  const [hostelName, setHostelName] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0 }
  };

  const issueData = [
    { name: "Resolved", value: 2 },
    { name: "Pending", value: 1 }
  ];

  const toggleNotice = (id) => {
    setExpandedNoticeId(prev => (prev === id ? null : id));
  };

  const COLORS = ["#22c55e", "#ef4444"];

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        if (!user?.year || !user?.gender || !user?.degreeType) return;

        const allocRes = await API.get("/allocations/find", {
          params: {
            year: user.year,
            gender: user.gender,
            degreeType: user.degreeType
          }
        });

        const hostelId = allocRes.data?.hostelId?._id;

        if (hostelId) {
          const res = await API.get(`/technician-visit/${hostelId}`);
          setTechVisit(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (user) fetchVisit();
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.year || !user?.gender || !user?.degreeType) return;

      try {
        const allocRes = await API.get("/allocations/find", {
          params: {
            year: user.year,
            gender: user.gender,
            degreeType: user.degreeType
          }
        });

        if (allocRes.data?.caretakerEmail) {
          setCaretakerInfo({
            email: allocRes.data.caretakerEmail,
            phone: allocRes.data.caretakerPhone
          });
        }

        if (allocRes.data?.hostelId?.name) {
          setHostelName(allocRes.data.hostelId.name);
        }

        const hostelId = allocRes.data?.hostelId?._id || allocRes.data?.hostelId;

        if (hostelId) {
          const noticeRes = await API.get("/notices", {
            params: { hostel: hostelId }
          });

          const complaintRes = await API.get("/complaints/my-complaints");
          const activeIssues = complaintRes.data.filter(c => c.status !== 'Resolved').length;

          if (noticeRes.data.length > 0) {
            const sorted = noticeRes.data.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setStatsData({ issues: activeIssues, notices: noticeRes.data.length });

            // Pinned up to 3, fallback to latest
            const pinned = sorted.filter(n => n.isPinned);
            const rest = sorted.filter(n => !n.isPinned);
            setPinnedNotices([...pinned, ...rest].slice(0, 3));
          }

          // Recent active complaints (last 3, excluding resolved)
          const sortedComplaints = complaintRes.data
            .filter(c => c.status !== "Resolved")
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
          setRecentComplaints(sortedComplaints);
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      }
    };

    if (user) fetchDashboardData();
  }, [user, activeTab]);

  if (!user)
    return (
      <div className="p-10 text-center text-indigo-600 font-bold animate-pulse">
        Loading Student Portal...
      </div>
    );

  if (!user.roomNumber) {
    return (
      <div className="min-h-screen bg-[#F0F7FF] flex flex-col font-sans">
        {/* Simple Header */}
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-blue-200 px-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-blue-700">HostelHub</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Management System</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors font-bold text-sm shadow-sm"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex-1 flex flex-col items-center justify-center p-4 md:p-8"
        >
          <motion.div variants={itemVariants} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 max-w-xl w-full flex flex-col items-center text-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
              <Home size={40} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Room Not Assigned</h2>
              <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed max-w-sm mx-auto">
                Your room allocation {hostelName ? <span className="font-bold text-slate-700">for {hostelName}</span> : ""} is currently pending. Please contact your hostel caretaker for further assistance.
              </p>
            </div>

            {caretakerInfo ? (
              <div className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center mt-2 group hover:bg-indigo-50/50 transition-colors">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 group-hover:text-indigo-400 transition-colors">Contact Caretaker</p>
                <a href={`mailto:${caretakerInfo.email}`} className="text-indigo-600 font-bold text-lg hover:underline mb-1">
                  {caretakerInfo.email}
                </a>
                {caretakerInfo.phone && <p className="text-slate-500 text-sm font-medium">{caretakerInfo.phone}</p>}
              </div>
            ) : (
              <div className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-center mt-2">
                 <p className="text-xs font-bold text-slate-400 animate-pulse">Loading Contact Info...</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <DashboardLayout role="student" activeTab={activeTab} setActiveTab={setActiveTab}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8"
      >
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
          <motion.div variants={itemVariants} className="animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Hey, {user.name?.split(' ')[0]}!
            </h1>
          </motion.div>

          <motion.button
            variants={itemVariants}
            onClick={() => router.push("/dashboard/student/complaints")}
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-[1.25rem] text-sm font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
          >
            <MessageSquare size={18} className="group-hover:rotate-12 transition-transform" />
            Post Complaint
          </motion.button>
        </div>

        {/* CONTENT AREA */}
        <div className="space-y-6">
          {/* STATS */}
          <motion.div variants={itemVariants}>
            <StatsGrid
              stats={[
                {
                  label: "My Room",
                  value: user.roomNumber || "Pending",
                  icon: <Home size={18} />,
                  colorClass: "bg-emerald-50 text-emerald-600 border border-emerald-100"
                },
                {
                  label: "Unresolved Issues",
                  value: statsData.issues.toString(),
                  icon: <AlertCircle size={18} />,
                  colorClass: "bg-rose-50 text-rose-600 border border-rose-100"
                },
              ]}
            />
          </motion.div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Pinned / Urgent Notices Card */}
            <motion.div
              variants={itemVariants}
              className="p-5 md:p-6 bg-white border border-slate-100 rounded-[2rem] md:rounded-3xl shadow-sm flex flex-col gap-3 min-h-[160px]"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base">📌 Notices</h3>
                <button
                  onClick={() => router.push("/dashboard/student/notices")}
                  className="text-indigo-600 text-[11px] font-bold flex items-center gap-1 hover:gap-2 transition-all"
                >
                  View All <ArrowUpRight size={12} />
                </button>
              </div>
              {pinnedNotices.length > 0 ? (
                <div className="space-y-3">
                  {pinnedNotices.map((n) => (
                    <div key={n._id} className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all hover:border-indigo-100 group/notice">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          n.isPinned ? "bg-amber-100 text-amber-600" :
                          "bg-indigo-100 text-indigo-600"
                        }`}>
                          {n.isPinned ? <Pin size={12} /> : <Bell size={12} />}
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <p onClick={() => toggleNotice(n._id)} className="text-sm font-bold text-slate-800 leading-tight cursor-pointer hover:text-indigo-600 transition-colors">
                            {n.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black uppercase tracking-widest bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                              {n.isPinned ? "Pinned" : n.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">
                              {new Date(n.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* EXPANDED CONTENT AREA */}
                      {expandedNoticeId === n._id && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="mt-2"
                        >
                          <div className="relative p-4 rounded-xl">
                            {/* CONTENT */}
                            <p className="text-sm text-slate-600 leading-relaxed pr-5">
                              {n.content}
                            </p>

                            {/* ATTACHMENTS & LINKS */}
                            {((n.attachments && n.attachments.length > 0) || (n.links && n.links.length > 0)) && (
                              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">

                                {n.attachments?.map((file, idx) => (
                                  <a
                                    key={idx}
                                    href={`http://localhost:5000${file.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold hover:bg-slate-200 transition"
                                  >
                                    📎 {file.fileName || "Attachment"}
                                  </a>
                                ))}

                                {n.links?.map((link, idx) => (
                                  <a
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold hover:bg-slate-200 transition"
                                  >
                                    🔗 {link.label || "Open Link"}
                                  </a>
                                ))}

                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No pinned notices.</p>
              )}
            </motion.div>

            {/* My Complaints Card */}
            <motion.div
              variants={itemVariants}
              className="p-5 md:p-6 bg-white border border-slate-100 rounded-[2rem] md:rounded-3xl shadow-sm flex flex-col gap-3 min-h-[160px]"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-base">🔧 My Complaints</h3>
                <button
                  onClick={() => router.push("/dashboard/student/complaints")}
                  className="text-indigo-600 text-[11px] font-bold flex items-center gap-1 hover:gap-2 transition-all"
                >
                  View All <ArrowUpRight size={12} />
                </button>
              </div>
              {recentComplaints.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {recentComplaints.map((c) => (
                    <div key={c._id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 shadow-sm hover:shadow-md transition-all group/card">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 shrink-0 group-hover/card:bg-indigo-600 group-hover/card:text-white transition-colors">
                          <Wrench size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate leading-tight mt-0.5">{c.title}</p>
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1">
                            <Clock size={10}/> {new Date(c.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center ml-[2.25rem] md:ml-0 shrink-0">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider ${
                          c.status === "Scheduled" ? "bg-indigo-100 text-indigo-700" :
                          c.status === "Get Slot" ? "bg-blue-100 text-blue-600 ring-1 ring-blue-400 ring-offset-1 animate-pulse" :
                          c.status === "Rejected" ? "bg-rose-100 text-rose-600" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No active complaints right now.</p>
              )}
            </motion.div>

          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}