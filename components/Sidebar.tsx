"use client";

import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Analytics", href: "/dashboard/analytics" },
  { name: "Sales", href: "/dashboard/sales" },
  { name: "Customers", href: "/dashboard/customers" },
  { name: "Products", href: "/dashboard/products" },
  { name: "Reports", href: "/dashboard/reports" },
  { name: "Settings", href: "/dashboard/settings" },
];

type SidebarProps = {
  mobile?: boolean;
};

export default function Sidebar({ mobile = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={
        mobile
          ? "m-4 min-h-[calc(100vh-2rem)] w-72 shrink-0 rounded-2xl bg-green-900 p-5 text-white shadow-lg"
          : "hidden min-h-screen w-72 shrink-0 p-4 md:block"
      }
    >
      {/* Desktop Sidebar */}
      {!mobile && (
        <div className="flex min-h-[calc(100vh-2rem)] flex-col rounded-2xl bg-green-900 p-5 text-white shadow-lg">
          {/* Logo */}
          <div className="mb-10">
            <Link
              href="/dashboard"
              className="text-2xl font-bold tracking-tight"
            >
              BizPulse
            </Link>

            <p className="mt-1 text-sm text-gray-400">
              Business Performance Platform
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-300 hover:bg-green-800 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="mb-3 mt-6">
            <LogoutButton />
          </div>

          {/* Back to Home */}
          <div className="border-t border-green-800 pt-5">
            <Link
              href="/"
              className="block rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-green-800 hover:text-white"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {mobile && (
        <>
          {/* Logo */}
          <div className="mb-10">
            <Link
              href="/dashboard"
              className="text-2xl font-bold tracking-tight"
            >
              BizPulse
            </Link>

            <p className="mt-1 text-sm text-gray-400">
              Business Performance Platform
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-white text-gray-900"
                      : "text-gray-300 hover:bg-green-800 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="mb-3 mt-6">
            <LogoutButton />
          </div>

          {/* Back to Home */}
          <div className="mt-6 border-t border-green-800 pt-5">
            <Link
              href="/"
              className="block rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-green-800 hover:text-white"
            >
              ← Back to Home
            </Link>
          </div>
        </>
      )}
    </aside>
  );
}