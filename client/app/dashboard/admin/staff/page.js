"use client";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function StaffManagement() {
    const [hostels, setHostels] = useState([]);
    const [form, setForm] = useState({ name: "", email: "", role: "warden", hostelId: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${API}/admin/hostels`).then(res => {
            setHostels(res.data);
            if (res.data.length > 0) setForm(prev => ({ ...prev, hostelId: res.data[0]._id }));
        });
    }, []);

    const handleSubmit = async () => {
        try {
            if (!form.email || !form.name) return alert("Fill all fields");
            setLoading(true);
            await axios.post(`${API}/admin/staff`, form);
            alert("Staff Created & Credentials Sent!");
            setForm({ ...form, name: "", email: "" });
        } catch (err) {
            alert(err.response?.data?.error || "Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Staff Management</h2>
            <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        className="w-full p-2 border rounded"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Role</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={form.role}
                            onChange={e => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="warden">Warden</option>
                            <option value="caretaker">Caretaker</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Assign Hostel</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={form.hostelId}
                            onChange={e => setForm({ ...form, hostelId: e.target.value })}
                        >
                            {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                        </select>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Staff & Send Email"}
                </button>
            </div>
        </div>
    );
}
