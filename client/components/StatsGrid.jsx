// client/components/StatsGrid.jsx
const StatCard = ({ label, value, colorClass }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between min-h-[100px]">
    <div>
      {/* Smaller, uppercase labels to match caretaker style */}
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-black text-slate-800 tracking-tight leading-none ${value?.length > 10 ? 'text-lg' : 'text-2xl'}`}>
        {value}
      </p>
    </div>
    <div className="flex justify-end">
       {/* Subtle accent bar instead of a big icon */}
       <div className={`h-1 w-8 rounded-full ${colorClass.replace('bg-', 'bg-opacity-50 bg-')}`} />
    </div>
  </div>
);

export default function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}