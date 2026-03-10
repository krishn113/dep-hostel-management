"use client";
import { useState, useEffect } from "react";
import API from "@/lib/api";
import toast from "react-hot-toast";
import { Building2, Pencil, Plus, DoorOpen, Trash2, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminHostels() {
  const [hostels, setHostels] = useState([]);
  const [form, setForm] = useState({
    name: "",
    type: "Boys",
    roomConfigs: [{ capacity: "", rooms: "" }]
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => { fetchHostels(); }, []);

  const fetchHostels = async () => {
    try {
      const res = await API.get("/admin/hostels");
      setHostels(res.data);
    } catch {
      toast.error("Failed to load hostels");
    }
  };

  const resetForm = () => {
    setForm({ name: "", type: "Boys", roomConfigs: [{ capacity: "", rooms: "" }] });
    setEditMode(false);
    setEditId(null);
  };

  // ── Validation ──────────────────────────────────────────
  const validate = () => {
    if (!form.name.trim()) {
      toast.error("Hostel name is required");
      return false;
    }
    for (let i = 0; i < form.roomConfigs.length; i++) {
      const c = form.roomConfigs[i];
      if (!c.capacity || !c.rooms) {
        toast.error(`Fill both capacity and rooms for row ${i + 1}`);
        return false;
      }
      if (Number(c.capacity) < 1 || Number(c.rooms) < 1) {
        toast.error(`Capacity and rooms must be ≥ 1 (row ${i + 1})`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      type: form.type,
      roomConfigs: form.roomConfigs.map(c => ({
        capacity: Number(c.capacity),
        rooms: Number(c.rooms)
      }))
    };
    const toastId = toast.loading(editMode ? "Updating hostel…" : "Creating hostel…");
    try {
      if (editMode) {
        await API.put(`/admin/hostels/${editId}`, payload);
        toast.success("Hostel updated!", { id: toastId });
      } else {
        await API.post("/admin/hostels", payload);
        toast.success("Hostel created!", { id: toastId });
      }
      resetForm();
      setShowEditModal(false);
      fetchHostels();
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong", { id: toastId });
    }
  };

  const handleEdit = (h) => {
    setEditMode(true);
    setEditId(h._id);
    setForm({
      name: h.name || "",
      type: h.type || "Boys",
      roomConfigs: h.roomConfigs?.length
        ? h.roomConfigs.map(r => ({ capacity: r.capacity?.toString() || "", rooms: r.rooms?.toString() || "" }))
        : [{ capacity: "", rooms: "" }]
    });
    setShowEditModal(true);
  };

  const addRoomConfig = () =>
    setForm({ ...form, roomConfigs: [...form.roomConfigs, { capacity: "", rooms: "" }] });

  const updateRoomConfig = (index, field, value) => {
    const updated = [...form.roomConfigs];
    updated[index][field] = value;
    setForm({ ...form, roomConfigs: updated });
  };

  const deleteRoomConfig = (index) => {
    if (form.roomConfigs.length === 1) return;
    setForm({ ...form, roomConfigs: form.roomConfigs.filter((_, i) => i !== index) });
  };

  const totalRooms = form.roomConfigs.reduce((s, c) => s + (Number(c.rooms) || 0), 0);

  // ── Shared room config editor ────────────────────────────
  const RoomConfigRows = () => (
    <div className="space-y-3">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_1fr_36px] gap-3 px-1">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Capacity / Room</span>
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">No. of Rooms</span>
        <span />
      </div>
      {form.roomConfigs.map((config, index) => (
        <div key={index} className="grid grid-cols-[1fr_1fr_36px] gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
          <input
            type="number"
            min={1}
            placeholder="e.g. 2"
            value={config.capacity}
            onChange={e => updateRoomConfig(index, "capacity", e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full"
          />
          <input
            type="number"
            min={1}
            placeholder="e.g. 30"
            value={config.rooms}
            onChange={e => updateRoomConfig(index, "rooms", e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full"
          />
          <button
            onClick={() => deleteRoomConfig(index)}
            disabled={form.roomConfigs.length === 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-rose-400 hover:bg-rose-50 disabled:opacity-20 transition"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={addRoomConfig}
          className="flex items-center gap-1 text-indigo-600 font-bold text-sm hover:underline"
        >
          <Plus size={14} /> Add Row
        </button>
        <span className="text-xs text-slate-400 font-semibold">Total rooms: <b className="text-slate-700">{totalRooms}</b></span>
      </div>
    </div>
  );

  return (
    <DashboardLayout role="admin" activeTab="hostels">
      <div className="w-full max-w-5xl mx-auto space-y-10 pb-20">

        {/* HEADER */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Hostels</h1>
            <p className="text-slate-500 font-medium mt-2">Create and manage hostel buildings</p>
          </div>
          <div className="bg-indigo-50 px-4 py-2 rounded-xl text-indigo-600 font-bold text-sm">
            {hostels.length} Hostels
          </div>
        </div>

        {/* CREATE FORM */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="font-black text-xl text-slate-900">Add New Hostel</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Hostel Name</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Brahmaputra Hostel"
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
              >
                <option>Boys</option>
                <option>Girls</option>
                <option>Mixed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest block mb-3">Room Configurations</label>
            <RoomConfigRows />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Hostel
          </button>
        </div>

        {/* HOSTEL CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hostels.map(h => (
            <div
              key={h._id}
              className="bg-white p-7 rounded-[2.5rem] border shadow-sm hover:shadow-md transition relative overflow-hidden"
            >
              <Building2 className="absolute right-5 top-5 opacity-5" size={80} />
              <div className="flex justify-between mb-4">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    h.type === "Boys" ? "bg-blue-50 text-blue-500"
                    : h.type === "Girls" ? "bg-pink-50 text-pink-500"
                    : "bg-purple-50 text-purple-500"
                  }`}>{h.type}</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{h.name}</h3>
                </div>
                <button
                  onClick={() => handleEdit(h)}
                  className="text-indigo-500 hover:text-indigo-700 text-xs font-black flex gap-1 items-center z-10 px-3 py-1.5 rounded-xl"
                >
                  <Pencil size={12} /> Edit
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <DoorOpen size={15} className="text-slate-400" />
                <span>Total Rooms: <b className="text-slate-700">{h.totalRooms}</b></span>
              </div>
              {h.roomConfigs?.length > 0 && (
                <div className="mt-3 space-y-1">
                  {h.roomConfigs.map((rc, i) => (
                    <div key={i} className="text-xs text-slate-400">
                      {rc.rooms} × {rc.capacity}-seater rooms
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* EDIT MODAL */}
        {showEditModal && (
          <div className="fixed -top-10 -left-10 -right-10 -bottom-10 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white w-full max-w-lg p-8 rounded-[2.5rem] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Edit Hostel</h2>
                <button onClick={() => { setShowEditModal(false); resetForm(); }} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition">
                  <X size={20} />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Hostel Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
                >
                  <option>Boys</option>
                  <option>Girls</option>
                  <option>Mixed</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest block mb-3">Room Configurations</label>
                <RoomConfigRows />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowEditModal(false); resetForm(); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition"
                >
                  Update Hostel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}