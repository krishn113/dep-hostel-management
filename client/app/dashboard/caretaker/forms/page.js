"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ListTodo, Building2, DoorOpen } from "lucide-react";
import API from "@/lib/api";

export default function CaretakerForms() {
  const [activeTab, setActiveTab] = useState("leaving");
  const [leavingForms, setLeavingForms] = useState([]);
  const [guestForms, setGuestForms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [arrivalFilter, setArrivalFilter] = useState("");
  const [departureFilter, setDepartureFilter] = useState("");

  const fetchForms = async () => {
    try {
      setLoading(true);
      const leavingRes = await API.get("/caretaker/forms/hostel-leaving");
      const guestRes = await API.get("/caretaker/forms/guesthouse");

      if (leavingRes.data) {
        setLeavingForms(leavingRes.data);
      }
      if (guestRes.data) {
        // Sort guest forms by arrival date (newest first)
        const sortedGuest = [...guestRes.data].sort((a, b) => new Date(b.arrivalDate) - new Date(a.arrivalDate));
        setGuestForms(sortedGuest);
      }
    } catch (error) {
      console.error("Failed to fetch caretaker forms", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const endpoint = activeTab === "leaving" 
        ? `/caretaker/forms/hostel-leaving/${id}/status`
        : `/caretaker/forms/guesthouse/${id}/status`;
      
      await API.patch(endpoint, { status });
      // Refresh forms after update
      fetchForms();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // Filter Logic for Hostel Leaving
  const filteredLeaving = leavingForms.filter(form => {
    const statusMatch = statusFilter === "All" || form.status === statusFilter;
    const dateMatch = !dateFilter || new Date(form.leavingDate).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();
    return statusMatch && dateMatch;
  });

  // Filter Logic for Guest House
  const filteredGuest = guestForms.filter(form => {
    const arrivalMatch = !arrivalFilter || new Date(form.arrivalDate).toLocaleDateString() === new Date(arrivalFilter).toLocaleDateString();
    const departureMatch = !departureFilter || new Date(form.departureDate).toLocaleDateString() === new Date(departureFilter).toLocaleDateString();
    return arrivalMatch && departureMatch;
  });

  return (
    <DashboardLayout role="caretaker" activeTab="forms">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen animate-in fade-in duration-700">
        
        {/* HEADER SECTION */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-2 uppercase">Student Forms</h1>
              <p className="text-slate-500 font-medium italic lowercase:any">Manage hostel leaving and guest house applications.</p>
            </div>

            {/* QUICK STATS */}
            <div className="flex gap-4">
              <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Pending Leave</p>
                <p className="text-2xl font-black text-amber-500">{leavingForms.filter(f => f.status === 'Pending').length}</p>
              </div>
              <div className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Bookings</p>
                <p className="text-2xl font-black text-indigo-600">{filteredGuest.length}</p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN FEED */}
        <div className="max-w-6xl mx-auto">
          
          {/* TABS & FILTERS */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex space-x-2 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm w-fit overflow-x-auto">
              <button 
                onClick={() => setActiveTab("leaving")}
                className={`py-2 px-6 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all ${
                  activeTab === "leaving" 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                  : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                Hostel Leaving
              </button>
              <button 
                onClick={() => setActiveTab("guesthouse")}
                className={`py-2 px-6 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all ${
                  activeTab === "guesthouse" 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                  : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                Guest House Bookings
              </button>
            </div>

            {/* FILTERS UI (Hostel Leaving) */}
            {activeTab === "leaving" && (
              <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 pl-4">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status:</span>
                   <select 
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                     className="bg-transparent border-none text-[10px] font-bold text-slate-700 focus:ring-0 cursor-pointer"
                   >
                     <option value="All">All</option>
                     <option value="Pending">Pending</option>
                     <option value="Approved">Approved</option>
                     <option value="Rejected">Rejected</option>
                   </select>
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2 pr-4">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Date:</span>
                   <input 
                     type="date"
                     value={dateFilter}
                     onChange={(e) => setDateFilter(e.target.value)}
                     className="bg-transparent border-none text-[10px] font-bold text-slate-700 focus:ring-0 cursor-pointer"
                   />
                   {dateFilter && (
                     <button onClick={() => setDateFilter("")} className="text-slate-400 hover:text-rose-500">
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                     </button>
                   )}
                </div>
              </div>
            )}

            {/* FILTERS UI (Guest House) */}
            {activeTab === "guesthouse" && (
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 px-4">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Arrival:</span>
                   <input 
                     type="date"
                     value={arrivalFilter}
                     onChange={(e) => setArrivalFilter(e.target.value)}
                     className="bg-transparent border-none text-[10px] font-bold text-slate-700 focus:ring-0 cursor-pointer"
                   />
                   {arrivalFilter && (
                     <button onClick={() => setArrivalFilter("")} className="text-slate-400 hover:text-rose-500">
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                     </button>
                   )}
                </div>
                <div className="hidden sm:block h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2 px-4">
                   <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Departure:</span>
                   <input 
                     type="date"
                     value={departureFilter}
                     onChange={(e) => setDepartureFilter(e.target.value)}
                     className="bg-transparent border-none text-[10px] font-bold text-slate-700 focus:ring-0 cursor-pointer"
                   />
                   {departureFilter && (
                     <button onClick={() => setDepartureFilter("")} className="text-slate-400 hover:text-rose-500">
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                     </button>
                   )}
                </div>
              </div>
            )}
          </div>

          {loading ? (
             <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
               <p className="text-slate-400 font-medium animate-pulse">Synchronizing applications...</p>
             </div>
          ) : (
            <div className="space-y-4">
              
              {/* LEAVING TAB */}
              {activeTab === "leaving" && (
                filteredLeaving.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
                    <p className="text-slate-400 font-medium">No leaving forms match the selection.</p>
                  </div>
                ) : (
                  filteredLeaving.map(form => (
                    <div key={form._id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden group hover:border-blue-200 transition-all">
                      <div className={`absolute left-0 top-0 h-full w-1.5 ${
                        form.status === 'Approved' ? 'bg-green-500' : form.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-400'
                      }`} />
                      
                      <div className="flex-1 pl-4 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-[10px] font-black uppercase text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md tracking-widest">Hostel Leaving</span>
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                             form.status === 'Approved' ? 'bg-green-50 text-green-600' : form.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                           }`}>
                             {form.status}
                           </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">{form.applicantName || form.studentId?.name || "Unknown"} <span className="text-sm font-medium text-slate-500">({form.applicantEntryNo || form.studentId?.entryNumber || "N/A"})</span></h3>
                        <p className="text-xs text-slate-400 mb-2 font-medium">{form.applicantDepartment || ''}</p>
                        <p className="text-sm text-slate-600 truncate max-w-lg mb-2"><span className="font-semibold text-slate-700">Reason:</span> {form.reason}</p>
                        <div className="flex gap-4 mt-1 text-xs font-semibold text-slate-500 flex-wrap">
                           <span className="flex gap-1 items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Leaving: <span className="text-slate-800">{new Date(form.leavingDate).toLocaleDateString()}</span></span>
                           <span className="flex gap-1 items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Returning: <span className="text-slate-800">{new Date(form.returnDate).toLocaleDateString()}</span></span>
                           {form.duration && <span className="flex gap-1 items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-100">Duration: <span className="text-slate-800">{form.duration} days</span></span>}
                        </div>
                      </div>

                      {/* ACTION BUTTONS */}
                      <div className="flex flex-row md:flex-col lg:flex-row gap-2 shrink-0">
                         {form.status === "Pending" && (
                           <>
                             <button 
                               onClick={() => handleStatusUpdate(form._id, "Approved")}
                               className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                             >
                                Approve
                             </button>
                             <button 
                               onClick={() => handleStatusUpdate(form._id, "Rejected")}
                               className="px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                             >
                                Reject
                             </button>
                           </>
                         )}
                         {form.status !== "Pending" && (
                           <div className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] italic px-4 py-2">
                             Processed
                           </div>
                         )}
                      </div>
                    </div>
                  ))
                )
              )}

              {/* GUEST HOUSE TAB */}
              {activeTab === "guesthouse" && (
                filteredGuest.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
                    <p className="text-slate-400 font-medium">No guest house bookings found.</p>
                  </div>
                ) : (
                  filteredGuest.map(form => (
                    <div key={form._id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 justify-between relative overflow-hidden group hover:border-indigo-200 transition-all lowercase:any">
                      <div className="absolute left-0 top-0 h-full w-1.5 bg-indigo-500" />
                      
                      <div className="flex-1 pl-4 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md tracking-widest">Guest House Detail</span>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mt-2">
                           <div className="space-y-1">
                             <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Applicant</p>
                             <p className="font-bold text-slate-800 text-sm">{form.applicantName || form.studentId?.name || "Unknown"}</p>
                             <p className="text-xs text-slate-500">{form.applicantEntryNo || form.studentId?.entryNumber || "N/A"}</p>
                             <p className="text-[10px] text-slate-400 uppercase font-black">{form.applicantDepartment || ''}</p>
                           </div>

                           <div className="space-y-1">
                             <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Guest Info</p>
                             <p className="font-bold text-slate-800 text-sm">{form.guestName}</p>
                             <p className="text-xs text-slate-500">{form.contactNumber}</p>
                             {form.paymentByGuest && <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-w-fit mt-1 w-fit">Pays directly</p>}
                           </div>

                           <div className="space-y-1">
                             <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Booking</p>
                             <p className="font-bold text-slate-800 text-sm">{form.roomToBeBooked || form.roomType}</p>
                             <p className="text-xs text-slate-500">{form.numGuests} guests, {form.numRooms} rooms</p>
                             {form.occupancyType && <p className="text-[10px] text-slate-500 mt-1 italic">{form.occupancyType}</p>}
                           </div>

                           <div className="space-y-1 border-l-0 lg:border-l-2 border-slate-100 lg:pl-6">
                              <div className="flex gap-4">
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-slate-400">Check-In</p>
                                  <p className="text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md">{new Date(form.arrivalDate).toLocaleDateString()} {form.arrivalTime || ''}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-slate-400">Check-Out</p>
                                  <p className="text-sm font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-md">{new Date(form.departureDate).toLocaleDateString()} {form.departureTime || ''}</p>
                                </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
