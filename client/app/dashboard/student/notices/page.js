"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/lib/api";
import { Bell, Search, Info, TriangleAlert, CalendarDays, Pin } from "lucide-react";

export default function StudentNoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [hostelData, setHostelData] = useState(null);
  const [noticeSearch, setNoticeSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedNoticeId, setExpandedNoticeId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.year && user?.gender && user?.degreeType) {
      resolveHostelAndFetchNotices();
    }else {
    console.log("DEBUG: Waiting for user data...", user);
  }
  }, [user]);

const resolveHostelAndFetchNotices = async () => {
  try {
    setLoading(true);
    console.log("DEBUG: Current User Data:", { 
      year: user?.year, 
      gender: user?.gender, 
      degree: user?.degreeType 
    });

    const allocationRes = await API.get(`/allocations/find`, {
      params: {
        year: user.year,
        gender: user.gender,
        degreeType: user.degreeType
      }
    });

    console.log("DEBUG: Allocation Response:", allocationRes.data);

    if (allocationRes.data?.hostelId) {
      const hostelObj = allocationRes.data.hostelId;
      const hId = hostelObj._id || hostelObj; // Handle both populated and unpopulated
      
      setHostelData(hostelObj);

      const noticeRes = await API.get(`/notices`, {
        params: { hostel: hId }
      });
      
      console.log("DEBUG: Notices received from Server:", noticeRes.data);
      setNotices(noticeRes.data);
    } else {
      console.warn("DEBUG: No hostelId found in allocation response.");
    }
  } catch (err) {
    console.error("DEBUG: Fetching Chain Failed:", err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};
  const filteredNotices = useMemo(() => {
    return notices
      .sort((a, b) => (b.isPinned - a.isPinned) || new Date(b.createdAt) - new Date(a.createdAt))
      .filter(n => (activeCategory === "All" || n.category === activeCategory) && 
                   n.title.toLowerCase().includes(noticeSearch.toLowerCase()));
  }, [notices, activeCategory, noticeSearch]);

  return (
    <DashboardLayout role="student" activeTab="notices">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        
       {/* HEADER */}
        {/* COMPACT HEADER */}
<header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
  <div>
    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Notice Board</h1>
    <p className="text-slate-500 font-medium">
      Official updates for <span className="text-indigo-600 font-bold">{hostelData?.name || "Allocated Hostel"}</span>
    </p>
  </div>
  
  <div className="flex flex-wrap items-center gap-2">
    {/* Pinned Pill */}
    <div className="bg-amber-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-amber-100">
      <Pin className="text-amber-500" size={14} />
      <span className="text-amber-700 text-[10px] font-black uppercase tracking-wider">
        {notices.filter(n => n.isPinned).length} Pinned
      </span>
    </div>

    {/* New Pill */}
    <div className="bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-emerald-100">
      <Bell className="text-emerald-600" size={14} />
      <span className="text-emerald-700 text-[10px] font-black uppercase tracking-wider">
        {notices.filter(n => {
          const yesterday = new Date(Date.now() - 86400000);
          return new Date(n.createdAt) > yesterday;
        }).length} New
      </span>
    </div>
  </div>
</header>

        {/* FEED */}
        <div className="space-y-6">
          {filteredNotices.map((notice) => (
            <div 
              key={notice._id} 
              className={`bg-white rounded-[2.5rem] p-8 border transition-all duration-300 ${
                notice.isPinned ? 'border-amber-200 bg-amber-50/20 ring-2 ring-amber-500/5' : 'border-slate-100 hover:border-indigo-100'
              }`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${
                      notice.category === 'Urgent' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {notice.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <CalendarDays size={12} /> {new Date(notice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {notice.isPinned && (
                    <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Pin size={10} /> PINNED
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-black text-slate-800 mb-2 leading-tight">{notice.title}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium opacity-90">{notice.content}</p>
                </div>

                <div className="pt-6 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border flex items-center justify-center text-[10px] font-bold text-slate-500 italic">IITR</div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hostel Administration</span>
                  </div>
                  {((notice.attachments && notice.attachments.length > 0) || (notice.links && notice.links.length > 0)) && (
                    <button 
                      onClick={() => setExpandedNoticeId(expandedNoticeId === notice._id ? null : notice._id)}
                      className="text-indigo-600 text-[10px] font-black uppercase hover:underline tracking-widest flex items-center gap-1"
                    >
                      {expandedNoticeId === notice._id ? 'Hide Attachments' : 'View Attachments'} <Info size={12} />
                    </button>
                  )}
                </div>

                {/* Attachments & Links Dropdown */}
                {expandedNoticeId === notice._id && ((notice.attachments && notice.attachments.length > 0) || (notice.links && notice.links.length > 0)) && (
                  <div className="mt-4 pt-4 border-t border-slate-50 space-y-4 bg-slate-50/50 p-4 rounded-2xl">
                    {notice.attachments && notice.attachments.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attached Files</h4>
                        <div className="flex flex-wrap gap-2">
                          {notice.attachments.map((file, idx) => (
                            <a 
                              key={idx} 
                              href={`http://localhost:5000${file.url}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-white border border-slate-200 text-indigo-700 px-3 py-2 rounded-xl text-xs font-bold hover:border-indigo-300 hover:shadow-sm transition"
                            >
                              📄 {file.fileName || 'Attachment'}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {notice.links && notice.links.length > 0 && (
                      <div>
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">External Links</h4>
                         <div className="flex flex-col gap-2">
                           {notice.links.map((link, idx) => (
                             <a 
                               key={idx} 
                               href={link.url} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1"
                             >
                               🔗 {link.label || link.url}
                             </a>
                           ))}
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredNotices.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <TriangleAlert className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-black uppercase tracking-widest">No notices match your search</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}