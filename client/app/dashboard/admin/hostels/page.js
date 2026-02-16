"use client";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function Hostels() {
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: "", type: "Mixed" });

    // Edit State
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    // Mass Add State
    const [showMassAdd, setShowMassAdd] = useState(false);
    const [massForm, setMassForm] = useState({ hostelId: "", startRoomNumber: "101", count: "50", capacity: "2" });

    const fetchHostels = async () => {
        try {
            const res = await axios.get(`${API}/admin/hostels`);
            setHostels(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchHostels();
    }, []);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            if (editMode) {
                await axios.put(`${API}/admin/hostels/${editId}`, form);
                alert("Hostel Updated");
                setEditMode(false);
                setEditId(null);
            } else {
                await axios.post(`${API}/admin/hostels`, form);
                alert("Hostel Added");
            }
            setForm({ name: "", type: "Mixed" });
            fetchHostels();
        } catch (err) {
            alert(err.response?.data?.error || "Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (hostel) => {
        setEditMode(true);
        setEditId(hostel._id);
        setForm({ name: hostel.name, type: hostel.type });
    };

    const handleMassAdd = async () => {
        try {
            await axios.post(`${API}/admin/rooms/mass`, massForm);
            alert("Mass Add Started/Completed");
            setShowMassAdd(false);
            fetchHostels();
        } catch (err) {
            alert("Failed");
        }
    };

    const openMassAdd = (hostelId) => {
        setMassForm(prev => ({ ...prev, hostelId }));
        setShowMassAdd(true);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Manage Hostels</h2>

            {/* Add/Edit Form */}
            <div className="flex gap-4 mb-8 items-end bg-gray-50 p-4 rounded-lg">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input
                        className="p-2 border rounded w-64"
                        placeholder="Raavi / New Block A"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Type</label>
                    <select
                        className="p-2 border rounded w-32"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                        <option value="Boys">Boys</option>
                        <option value="Girls">Girls</option>
                        <option value="Mixed">Mixed</option>
                    </select>
                </div>
                <button onClick={handleSubmit}>
                {editMode ? "Update Hostel" : "Add Hostel"}
                </button>


                {editMode && (
                    <button
                        onClick={() => { setEditMode(false); setForm({ name: "", type: "Mixed" }); }}
                        className="px-4 py-2 rounded text-gray-700 bg-gray-200"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Hostel Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostels.map((hostel) => (
                    <div key={hostel._id} className="border p-4 rounded-lg shadow-sm bg-white relative">
                        <div className="absolute top-2 right-2 space-x-2">
                            <button onClick={() => handleEdit(hostel)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        </div>

                        <h3 className="font-bold text-lg">{hostel.name}</h3>
                        <p className="text-gray-600 text-sm">{hostel.type} Hostel</p>
                        <p className="mt-2 text-sm font-medium">Total Rooms: {hostel.totalRooms}</p>

                        <div className="mt-4 flex flex-col gap-2">
                            <button
                                onClick={() => openMassAdd(hostel._id)}
                                className="text-sm bg-gray-100 py-1 rounded hover:bg-gray-200"
                            >
                                + Mass Add Rooms
                            </button>
                            {/* Keep single add room if strictly needed, or mass add covers it (mass add count=1) */}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mass Add Modal */}
            {showMassAdd && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h3 className="font-bold mb-4">Mass Add Rooms</h3>
                        <label className="block text-xs mb-1">Start Room No.</label>
                        <input
                            className="w-full border p-2 mb-2 rounded"
                            value={massForm.startRoomNumber}
                            onChange={e => setMassForm({ ...massForm, startRoomNumber: e.target.value })}
                        />

                        <label className="block text-xs mb-1">Count</label>
                        <input
                            className="w-full border p-2 mb-2 rounded"
                            value={massForm.count}
                            onChange={e => setMassForm({ ...massForm, count: e.target.value })}
                        />

                        <label className="block text-xs mb-1">Capacity</label>
                        <input
                            className="w-full border p-2 mb-4 rounded"
                            value={massForm.capacity}
                            onChange={e => setMassForm({ ...massForm, capacity: e.target.value })}
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowMassAdd(false)}
                                className="px-3 py-1 text-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMassAdd}
                                className="px-3 py-1 bg-indigo-600 text-white rounded"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
