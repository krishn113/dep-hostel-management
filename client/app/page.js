"use client";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 p-6 space-y-6"
        >
          <div className="grid grid-cols-4 gap-4">
            <StatCard title="Students" value="120" color="bg-pink-200"/>
            <StatCard title="Complaints" value="18" color="bg-blue-200"/>
            <StatCard title="Solved" value="55" color="bg-green-200"/>
            <StatCard title="Notices" value="7" color="bg-yellow-200"/>
          </div>

          <div className="bg-white rounded-xl p-5 shadow">
            <h2 className="font-bold mb-3">Recent Complaints</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Room</th>
                  <th>Issue</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Rahul</td>
                  <td>A-103</td>
                  <td>Light broken</td>
                  <td>
                    <button className="bg-purple-400 text-white px-3 py-1 rounded">View</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
