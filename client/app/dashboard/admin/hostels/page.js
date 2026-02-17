"use client";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { Building2, Pencil, Plus, DoorOpen } from "lucide-react";

export default function AdminHostels() {
  const [hostels, setHostels] = useState([]);
  const [form, setForm] = useState({ name: "", type: "Mixed" });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showMassAdd, setShowMassAdd] = useState(false);
  const [massForm, setMassForm] = useState({
    hostelId: "",
    startRoomNumber: "101",
    count: "50",
    capacity: "2"
  });

  useEffect(() => { fetchHostels(); }, []);

  const fetchHostels = async () => {
    const res = await api.get("/admin/hostels");
    setHostels(res.data);
  };

  const handleSubmit = async () => {
    if (!form.name) return alert("Enter hostel name");

    if (editMode)
      await api.put(`/admin/hostels/${editId}`, form);
    else
      await api.post("/admin/hostels", form);

    setForm({ name: "", type: "Mixed" });
    setEditMode(false);
    fetchHostels();
  };

  const handleEdit = (h) => {
    setEditMode(true);
    setEditId(h._id);
    setForm({ name: h.name, type: h.type });
  };

  const handleMassAdd = async () => {
    await api.post("/admin/rooms/mass", massForm);
    setShowMassAdd(false);
    fetchHostels();
  };

  return (
    <div className="w-full px-8 py-6 space-y-10 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Hostel Management
          </h1>
          <p className="text-slate-500 font-medium italic">
            Create and manage hostels & rooms
          </p>
        </div>

        <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 text-indigo-700 text-xs font-black uppercase">
          {hostels.length} Hostels
        </div>
      </div>

      {/* ADD HOSTEL FORM */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm grid md:grid-cols-3 gap-6">

        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
            Hostel Name
          </label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Raavi / Brahmaputra"
            className="w-full bg-slate-50 rounded-2xl py-4 px-4 mt-1 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">
            Type
          </label>
          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            className="w-full bg-slate-50 rounded-2xl py-4 px-4 mt-1 focus:ring-2 focus:ring-indigo-500"
          >
            <option>Boys</option>
            <option>Girls</option>
            <option>Mixed</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-2xl py-4 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
        >
          <Plus size={16} className="mt-[1px]" />
          {editMode ? "Update Hostel" : "Add Hostel"}
        </button>
      </div>

      {/* HOSTEL CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hostels.map(h => (
          <div
            key={h._id}
            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:border-indigo-100 transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Building2 size={70}/>
            </div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {h.name}
                </h3>
                <p className="text-slate-500 text-sm">{h.type} Hostel</p>
              </div>

              <button
                onClick={() => handleEdit(h)}
                className="flex items-center gap-1 text-indigo-600 text-xs font-black uppercase hover:underline"
              >
                <Pencil size={12} className="mt-[1px]" />
                Edit
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <DoorOpen size={16}/>
              <span>Total Rooms: <b>{h.totalRooms}</b></span>
            </div>

            <button
              onClick={() => {
                setMassForm(prev => ({ ...prev, hostelId: h._id }));
                setShowMassAdd(true);
              }}
              className="mt-6 w-full bg-emerald-500 text-white py-3 rounded-2xl font-black text-xs uppercase shadow-xl shadow-emerald-100 hover:bg-emerald-600 hover:-translate-y-1 transition-all"
            >
              Mass Add Rooms
            </button>
          </div>
        ))}
      </div>

      {/* MASS ADD MODAL */}
      {showMassAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl w-96 space-y-4 animate-in zoom-in-95 duration-300">

            <h2 className="text-xl font-black text-slate-800">
              Add Rooms
            </h2>

            {["startRoomNumber","count","capacity"].map(field => (
              <input
                key={field}
                placeholder={field}
                value={massForm[field]}
                onChange={e => setMassForm({...massForm,[field]:e.target.value})}
                className="w-full bg-slate-50 rounded-2xl py-3 px-4"
              />
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={()=>setShowMassAdd(false)}
                className="flex-1 bg-slate-100 py-3 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleMassAdd}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl shadow-lg"
              >
                Add Rooms
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
