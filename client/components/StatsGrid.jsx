"use client";

import { motion } from "framer-motion";

const StatCard = ({ label, value, icon, colorClass }) => {

  return (

    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-lg transition-all group"
    >

      {/* ICON */}
      <div
        className={`p-3 rounded-xl ${colorClass} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>

      {/* TEXT */}
      <div>

        <p className="text-sm text-slate-500 font-medium">
          {label}
        </p>

        <h3 className="text-2xl font-bold text-slate-800">
          {value}
        </h3>

      </div>

    </motion.div>
  );
};



export default function StatsGrid({ stats }) {

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}

    </div>

  );
}