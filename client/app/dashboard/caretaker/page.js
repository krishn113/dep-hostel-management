"use client";
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsGrid from "@/components/StatsGrid";
import DataTable from "@/components/DataTable";
import StatusBadge from "@/components/StatusBadge";
import axios from "axios";
import API from "@/lib/api";
import Link from "next/link";
import NoticeForm from "@/components/NoticeForm";
import { DocumentTextIcon ,WrenchScrewdriverIcon} from '@heroicons/react/24/outline';

export default function CaretakerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null); // For Modal
  const [techDate, setTechDate] = useState("");
  const fileInputRef = useRef(null);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [stats, setStats] = useState({ 
    newComplaints: 0, 
    resolvedComplaints: 0, 
    activeNotices: 0, 
    totalStudents: 0 
  });
  const [caretakerInfo, setCaretakerInfo] = useState(null);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  useEffect(() => {
    fetchDashboardData();
  }, []);
  // Get current date and time in the correct format for the 'min' attribute
    const today = new Date();
    // Adjust for local timezone offset
    const now = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch User Info
      const userRes = await API.get('/auth/me');
      setCaretakerInfo(userRes.data);

      // Fetch Stats Parallel
      const [noticesRes, studentsRes, complaintsRes] = await Promise.all([
        API.get('/notices'),
        API.get('/caretaker/students'),
        API.get('/complaints')
      ]);

      const notices = noticesRes.data || [];
      const studentsData = studentsRes.data.students || studentsRes.data || [];
      const complaintsData = complaintsRes.data || [];

      const activeStatuses = ["Pending", "Accepted", "Scheduled", "In Progress"];
      setStats({
        newComplaints: complaintsData.filter(c => activeStatuses.includes(c.status)).length,
        resolvedComplaints: complaintsData.filter(c => c.status === 'Resolved').length,
        activeNotices: notices.length,
        totalStudents: studentsData.length || 0
      });

      // Filter to only active complaints for the quick table
      setComplaints(complaintsData.filter(c => activeStatuses.includes(c.status)).slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };


  // 1. Columns Definition
  const columns = [
    { key: "studentName", label: "Student" },
    { key: "issue", label: "Issue", render: (_, row) => row.category + " - " + row.description },
    { key: "roomNumber", label: "Room", render: (_, row) => row.student?.roomNumber || 'N/A' },
    { 
      key: "status", 
      label: "Status", 
      render: (val) => <StatusBadge status={val} /> 
    },
    {
      key: "actions",
      label: "Action",
      render: (_, row) => (
        row.status === "Pending" && (
          <Link 
            href="/dashboard/caretaker/complaints"
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            Review Issue
          </Link>
        )
      )
    }
  ];


 return (
    <DashboardLayout role="caretaker">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Caretaker Dashboard</h1>
        </div>
        
        <div className="flex gap-3">

          <button 
          onClick={() => setIsTechModalOpen(true)}
          className="bg-emerald-600 text-white px-6 py-3.5 rounded-[1.25rem] text-sm font-bold shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 transition-all flex items-center gap-2"
        >
          {/* The Icon */}
          <WrenchScrewdriverIcon className="w-5 h-5" />
          
          {/* The Text */}
          <span>Mark Technician Visit</span>
        </button>
          {/* Now triggers state instead of a link */}
          <button 
          onClick={() => setIsNoticeModalOpen(true)} 
          className="bg-indigo-600 text-white px-6 py-3.5 rounded-[1.25rem] text-sm font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-2 group"
        >
          <DocumentTextIcon className="w-5 h-5 text-indigo-100" />
          Post New Notice
        </button>
        </div>
      </div>

      <StatsGrid stats={[
        { label: "Active Complaints", value: (stats.newComplaints || 0).toString(), colorClass: "bg-orange-50 text-orange-600 cursor-pointer hover:bg-orange-100", onClick: () => window.location.href = "/dashboard/caretaker/complaints" },
        { label: "Resolved", value: (stats.resolvedComplaints || 0).toString(), colorClass: "bg-green-50 text-green-600" },
        // WRAP THE NOTICE STAT IN A CLICKABLE LINK
        { 
          label: "Active Notices", 
          value: (stats.activeNotices || 0).toString(), 
          colorClass: "bg-blue-50 text-blue-600 cursor-pointer hover:bg-blue-100 transition",
          onClick: () => window.location.href = "/dashboard/caretaker/notices" 
        },
        { label: "Total Students", value: (stats.totalStudents || 0).toString(), colorClass: "bg-indigo-50 text-indigo-600 cursor-pointer hover:bg-indigo-100", onClick: () => window.location.href = "/dashboard/caretaker/students" },
      ]} />

      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Recent Active Complaints</h2>
        </div>
        <DataTable columns={columns} data={complaints} />
      </div>
      
      {/* Global Notice Form */}
      <NoticeForm 
        isOpen={isNoticeModalOpen} 
        onClose={() => setIsNoticeModalOpen(false)} 
        onSuccess={fetchDashboardData} 
      />
      {isTechModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          
          <div className="bg-white p-8 rounded-2xl shadow-xl w-[400px]">

            <h2 className="text-xl font-bold mb-4">Technician Visit Time</h2>

            <input
        type="datetime-local"
        min={now} // This prevents selecting any time before the current moment
        value={techDate}
        onChange={(e) => setTechDate(e.target.value)}
        className="w-full border border-slate-300 rounded-lg p-3 mb-4"
      />

      <div className="flex justify-end gap-3">
        
        <button
          onClick={() => setIsTechModalOpen(false)}
          className="px-4 py-2 bg-slate-200 rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            try {
              await API.post("/technician-visit", {
              hostelId: caretakerInfo.hostelId,
              visitTime: techDate
            });
              setIsTechModalOpen(false);
            } catch (err) {
              console.error(err);
            }
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Save
        </button>

      </div>

    </div>
  </div>
)}
    </DashboardLayout>
  );
}