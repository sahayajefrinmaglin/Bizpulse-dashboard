"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/analytics": "Analytics",
    "/dashboard/sales": "Sales",
    "/dashboard/customers": "Customers",
    "/dashboard/products": "Products",
    "/dashboard/reports": "Reports",
    "/dashboard/settings": "Settings",
  };

  const pageTitle = pageTitles[pathname] || "Dashboard";

  return (
    <>
      <header className="flex h-14  items-center justify-between rounded-3xl shadow-sm  bg-white px-4 md:px-6">

        {/* Left Side */}
        <div className="flex items-center gap-3">

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-xl hover:bg-gray-100 md:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>

          <h2 className="text-lg font-semibold md:text-xl">
            {pageTitle}
          </h2>

        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            className="hidden w-48 rounded-full border border-green-500 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-green-200 lg:block"
          />

          {/* Notification */}
          <button
            type="button"
            className="text-gray-600 hover:text-gray-900"
          >
            
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-50 text-sm font-semibold">
              SJ
            </div>

            <span className="hidden text-green-900 font-medium sm:block">
              SahayaJefrin
            </span>
          </div>

        </div>

      </header>

      {/* Mobile Sidebar */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">

          {/* Dark Background */}
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
          />

          {/* Sidebar */}
          <div className="relative h-full w-72">
            <Sidebar mobile />
          </div>

        </div>
      )}
    </>
  );
}