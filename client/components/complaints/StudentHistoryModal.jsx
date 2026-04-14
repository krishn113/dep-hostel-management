"use client";
import { X, User, MapPin, History, CheckCircle2, Clock, Mail, Phone, Hash, GraduationCap, Calendar, ChevronRight } from "lucide-react";

export default function StudentHistoryModal({ isOpen, onClose, studentData }) {
  if (!isOpen || !studentData) return null;

  const totalComplaints = studentData.history?.length || 0;

  // Helper to calculate resolution time
  const getDaysToResolve = (start, end) => {
    if (!start || !end) return "-";
    const diffTime = Math.abs(new Date(end) - new Date(start));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#001D4C]/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* HEADER SECTION */}
        <div className="bg-slate-50 p-8 border-b border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-6 items-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#001D4C] border border-slate-200">
                <User size={32} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#001D4C] uppercase tracking-tighter mb-1">
                  {studentData.name}
                </h2>
                <div className="flex gap-3">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded border border-slate-100">
                    <Hash size={10} className="inline mr-1 text-blue-500" /> {studentData.entryNo || "2023CSB1001"}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded border border-slate-100">
                    <MapPin size={10} className="inline mr-1 text-rose-500" /> Room {studentData.roomNo}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Mail size={16}/></div>
                <div className="flex flex-col"><span className="text-[8px] font-black text-slate-300 uppercase">Email</span><span className="text-xs font-bold text-slate-600">{studentData.email}</span></div>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Phone size={16}/></div>
                <div className="flex flex-col"><span className="text-[8px] font-black text-slate-300 uppercase">Phone</span><span className="text-xs font-bold text-slate-600">{studentData.phone || "N/A"}</span></div>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><GraduationCap size={16}/></div>
                <div className="flex flex-col"><span className="text-[8px] font-black text-slate-300 uppercase">Course</span><span className="text-xs font-bold text-slate-600">{studentData.degree}</span></div>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History size={16} className="text-[#001D4C]" />
              <h3 className="text-[11px] font-black text-[#001D4C] uppercase tracking-[0.2em]">Log History</h3>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing {totalComplaints} Records
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date Raised</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Title & Category</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {studentData.history && studentData.history.length > 0 ? (
                  studentData.history.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-600">
                            {new Date(entry.createdAt || entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-[9px] font-medium text-slate-400">
                            {new Date(entry.createdAt || entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-[#001D4C] uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                            {entry.title}
                          </span>
                          <span className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter">
                            {entry.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                          entry.status === 'Resolved' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {entry.status === 'Resolved' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                          <span className="text-[8px] font-black uppercase tracking-widest">{entry.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-500">
                            {entry.status === 'Resolved' 
                                ? getDaysToResolve(entry.createdAt, entry.timeline?.resolvedAt) 
                                : "Active"}
                          </span>
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">To Finish</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                       <History size={30} className="mx-auto mb-3 text-slate-200" />
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Logs Available</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
          <button onClick={onClose} className="group flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] hover:text-[#001D4C] transition-all">
            Close History <X size={12} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}