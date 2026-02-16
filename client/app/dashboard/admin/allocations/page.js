"use client";
import { useState, useEffect } from "react";
import axios from "@/lib/axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function Allocations() {
    const [hostels, setHostels] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [ruleForm, setRuleForm] = useState({ year: "2025", gender: "Male", degreeType: "B.Tech", hostelId: "" });
    const [studentForm, setStudentForm] = useState({ email: "", hostelId: "", roomNumber: "" });

    const fetchData = async () => {
        try {
            const [hRes, aRes] = await Promise.all([
                axios.get(`${API}/admin/hostels`),
                axios.get(`${API}/admin/allocations/batch`),
            ]);
            setHostels(hRes.data);
            setAllocations(aRes.data);
            if (hRes.data.length > 0) {
                setRuleForm(prev => ({ ...prev, hostelId: hRes.data[0]._id }));
                setStudentForm(prev => ({ ...prev, hostelId: hRes.data[0]._id }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRuleSubmit = async () => {
        try {
            await axios.post(`${API}/admin/allocations/batch`, ruleForm);
            alert("Rule Saved");
            fetchData();
        } catch (err) {
            alert("Failed to save rule");
        }
    };

    const handleStudentAllocate = async () => {
        try {
            await axios.post(`${API}/admin/allocations/student`, studentForm);
            alert("Student Allocated");
        } catch (err) {
            alert(err.response?.data?.msg || "Failed");
        }
    };

    return (
        <div className="space-y-10">
            {/* Batch Allocation */}
            <section>
                <h2 className="text-xl font-bold mb-4">Batch Allocation Rules</h2>
                <div className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-lg mb-6">
                    <div>
                        <label className="block text-xs font-medium uppercase text-gray-500 mb-1">Year</label>
                        <input
                            className="p-2 border rounded w-32"
                            value={ruleForm.year}
                            onChange={e => setRuleForm({ ...ruleForm, year: e.target.value })}
                            placeholder="2022"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium uppercase text-gray-500 mb-1">Degree</label>
                        <select
                            className="p-2 border rounded w-32"
                            value={ruleForm.degreeType}
                            onChange={e => setRuleForm({ ...ruleForm, degreeType: e.target.value })}
                        >
                            <option value="B.Tech">B.Tech</option>
                            <option value="M.Tech">M.Tech</option>
                            <option value="PhD">PhD</option>
                            <option value="MSc">MSc</option>
                            <option value="All">All</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium uppercase text-gray-500 mb-1">Gender</label>
                        <select
                            className="p-2 border rounded w-32"
                            value={ruleForm.gender}
                            onChange={e => setRuleForm({ ...ruleForm, gender: e.target.value })}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium uppercase text-gray-500 mb-1">Hostel</label>
                        <select
                            className="p-2 border rounded w-48"
                            value={ruleForm.hostelId}
                            onChange={e => setRuleForm({ ...ruleForm, hostelId: e.target.value })}
                        >
                            {hostels.map(h => <option key={h._id} value={h._id}>{h.name} ({h.type})</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleRuleSubmit}
                        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                    >
                        Save Rule
                    </button>
                </div>

                <div className="bg-white border rounded-lg overflow-hidden">
                    {hostels.map(h => (
                    <div key={h._id} className="mb-8">
                        <h3 className="text-lg font-semibold mb-2 text-indigo-700">
                        {h.name} ({h.type})
                        </h3>

                        <table className="min-w-full bg-white border rounded">
                        <thead className="bg-gray-100">
                            <tr>
                            <th className="px-4 py-2">Year</th>
                            <th className="px-4 py-2">Degree</th>
                            <th className="px-4 py-2">Gender</th>
                            <th className="px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allocations
                            .filter(a => a.hostelId?._id === h._id)
                            .map(a => (
                                <tr key={a._id} className="border-t">
                                <td className="px-4 py-2">{a.year}</td>
                                <td className="px-4 py-2">{a.degreeType}</td>
                                <td className="px-4 py-2">{a.gender}</td>
                                <td className="px-4 py-2">
                                    <button
                                    onClick={() => startEdit(a)}
                                    className="text-indigo-600 hover:underline"
                                    >
                                    Edit
                                    </button>
                                </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    ))}

                </div>
            </section>

            {/* Individual Allocation */}
            <section>
                <h2 className="text-xl font-bold mb-4">Individual Student Override</h2>
                <div className="bg-white p-6 border rounded-lg shadow-sm max-w-2xl">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium mb-1">Student Email</label>
                            <input
                                className="w-full p-2 border rounded"
                                placeholder="student@iitrpr.ac.in"
                                value={studentForm.email}
                                onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Assign Hostel</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={studentForm.hostelId}
                                onChange={e => setStudentForm({ ...studentForm, hostelId: e.target.value })}
                            >
                                {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Assign Room</label>
                            <input
                                className="w-full p-2 border rounded"
                                placeholder="e.g. 101"
                                value={studentForm.roomNumber}
                                onChange={e => setStudentForm({ ...studentForm, roomNumber: e.target.value })}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleStudentAllocate}
                        className="mt-4 w-full bg-gray-800 text-white py-2 rounded hover:bg-black"
                    >
                        Allocate Student
                    </button>
                </div>
            </section>
        </div>
    );
}
