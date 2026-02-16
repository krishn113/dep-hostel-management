"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
    const pathname = usePathname();

    const tabs = [
        { name: "Overview", href: "/dashboard/admin" },
        { name: "Hostels", href: "/dashboard/admin/hostels" },
        { name: "Allocations", href: "/dashboard/admin/allocations" },
        { name: "Staff Management", href: "/dashboard/admin/staff" },
    ];

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="flex space-x-4 border-b mb-6">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={`pb-2 px-4 ${pathname === tab.href
                                ? "border-b-2 border-indigo-600 text-indigo-600 font-semibold"
                                : "text-gray-500 hover:text-indigo-500"
                            }`}
                    >
                        {tab.name}
                    </Link>
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
                {children}
            </div>
        </div>
    );
}
