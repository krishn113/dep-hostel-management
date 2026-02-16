"use client";

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-gray-500 text-sm uppercase">Total Hostels</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-gray-500 text-sm uppercase">Total Students</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-gray-500 text-sm uppercase">Pending Requests</h3>
          <p className="text-3xl font-bold mt-2">--</p>
        </div>
      </div>
      <p className="mt-8 text-gray-600">
        Use the tabs above to manage hostels, allocations, and staff.
      </p>
    </div>
  );
}
