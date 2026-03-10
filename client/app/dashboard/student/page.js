"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatsGrid from "@/components/StatsGrid";
import API from "@/lib/api";
import { MessageSquare, Bell, ArrowUpRight, Home, AlertCircle, BellRing, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function StudentDashboard() {

  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [latestNotice, setLatestNotice] = useState(null);
  const [techVisit, setTechVisit] = useState(null);

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

  const COLORS = ["#22c55e", "#ef4444"];

  useEffect(() => {
    const fetchVisit = async () => {
      try {

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

    if(user) fetchVisit();

  }, [user]);



  useEffect(() => {

    const fetchLatestNotice = async () => {

      if (!user?.year || !user?.gender || !user?.degreeType) return;

      try {

        const allocRes = await API.get("/allocations/find", {
          params: {
            year: user.year,
            gender: user.gender,
            degreeType: user.degreeType
          }
        });

        const hostelId = allocRes.data?.hostelId?._id || allocRes.data?.hostelId;

        if (hostelId) {

          const noticeRes = await API.get("/notices", {
            params: { hostel: hostelId }
          });

          if (noticeRes.data.length > 0) {

            const sorted = noticeRes.data.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setLatestNotice(sorted[0]);
          }
        }

      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      }
    };

    fetchLatestNotice();

  }, [user]);



  if (!user)
    return (
      <div className="p-10 text-center text-indigo-600 font-bold animate-pulse">
        Loading Student Portal...
      </div>
    );



  return (

    <DashboardLayout role="student" activeTab={activeTab} setActiveTab={setActiveTab}>

      {/* HEADER */}

      <div className="flex justify-between items-end mb-10">

        <div className="animate-in fade-in slide-in-from-left-4 duration-700">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Hey, {user.name?.split(" ")[0]}!
          </h1>

          <p className="text-slate-500 mt-1 font-medium italic">
            You are currently in {user.hostelName} Hostel
          </p>
        </div>


        <button
          onClick={() => setActiveTab("complaints")}
          className="bg-indigo-600 text-white px-6 py-3.5 rounded-[1.25rem] text-sm font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-2 group"
        >
          <MessageSquare size={18} className="group-hover:rotate-12 transition-transform"/>
          Post New Complaint
        </button>

      </div>



      {/* MAIN CONTENT */}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >

        {/* STATS */}

        <motion.div variants={itemVariants}>

          <StatsGrid
            stats={[
              {
                label: "My Room",
                value: user.roomNumber || "Pending",
                icon: <Home size={18}/>,
                colorClass: "bg-emerald-50 text-emerald-600 border border-emerald-100"
              },
              {
                label: "Active Issues",
                value: "0",
                icon: <AlertCircle size={18}/>,
                colorClass: "bg-rose-50 text-rose-600 border border-rose-100"
              },
              {
                label: "New Notices",
                value: "2",
                icon: <BellRing size={18}/>,
                colorClass: "bg-amber-50 text-amber-600 border border-amber-100"
              },
              {
                label: "Hostel",
                value: user.hostelName || "N/A",
                icon: <Building2 size={18}/>,
                colorClass: "bg-indigo-50 text-indigo-600 border border-indigo-100"
              }
            ]}
          />

        </motion.div>



        {/* CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* NOTICE CARD */}

          <motion.div
            variants={itemVariants}
            className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all relative overflow-hidden group"
          >

            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20">
              <Bell size={80}/>
            </div>

            <h3 className="font-bold text-slate-800 text-lg mb-2">
              {latestNotice ? "Latest Notice 📢" : "No Notices Yet"}
            </h3>

            <p className="text-slate-500 text-sm leading-relaxed">
              {latestNotice
                ? latestNotice.title
                : `Check back later for updates regarding the ${user.hostelName} community.`}
            </p>

            <button
              onClick={() => router.push("/dashboard/student/notices")}
              className="mt-4 text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
            >
              {latestNotice ? "Read More" : "View All"} <ArrowUpRight size={14}/>
            </button>

          </motion.div>



          {/* TECHNICIAN CARD */}

          <motion.div
            variants={itemVariants}
            className="p-8 bg-indigo-600 rounded-[2.5rem] shadow-xl text-white shadow-indigo-200 hover:-translate-y-1 transition-all"
          >

            <h3 className="font-bold text-lg mb-2">Technician Visit 🛠️</h3>

            <p className="text-indigo-100 text-sm leading-relaxed">
              Report urgent issues to the caretaker before arrival.
            </p>

            <div className="mt-4 inline-block bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold">

              {techVisit
                ? `Arrival: ${new Date(techVisit.visitTime).toLocaleString()}`
                : "No technician visit scheduled"}

            </div>

          </motion.div>



          {/* PIE CHART */}

          <motion.div
            variants={itemVariants}
            className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
          >

            <h3 className="font-bold text-slate-800 mb-4">
              Complaint Overview
            </h3>

            <PieChart width={220} height={200}>
              <Pie
                data={issueData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
              >
                {issueData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]}/>
                ))}
              </Pie>

              <Tooltip/>
            </PieChart>

          </motion.div>

        </div>

      </motion.div>

    </DashboardLayout>
  );
}