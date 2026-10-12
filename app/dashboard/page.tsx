
"use client";
import LowStockAlerts from "@/components/LowStockAlerts";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import WelcomeProfile from "@/components/WelcomeProfile";
import DashboardGuard from "@/components/DashboardGuard";
import MetricCard from "@/components/MetricCard";
import RevenueChart from "@/components/charts/RevenueChart";
import SalesChart from "@/components/charts/SalesChart";
import RecentTransactions from "@/components/RecentTransactions";
import TopProducts from "@/components/TopProducts";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    revenue: "AED 0.00",
    sales: "0",
    customers: "0",
    averageOrder: "AED 0.00",
  });

  const [loading, setLoading] = useState(true);
const [error, setError] = useState("Dashboard data has not loaded yet.");

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          throw new Error("Please sign in to view your dashboard.");
        }

        // Fetch this user's sales
        const { data: sales, error: salesError } = await supabase
          .from("sales")
          .select("amount")
          .eq("user_id", user.id);

        if (salesError) throw salesError;

        // Fetch this user's customers
        const {
          count: customerCount,
          error: customerError,
        } = await supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (customerError) throw customerError;

        // Fetch this user's products
        const {
          count: productCount,
          error: productError,
        } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (productError) throw productError;

        const totalRevenue = (sales ?? []).reduce(
          (total, sale) => total + Number(sale.amount || 0),
          0
        );

        const totalSales = sales?.length ?? 0;

        const averageOrder =
          totalSales > 0 ? totalRevenue / totalSales : 0;

        if (active) {
          setMetrics({
            revenue: `AED ${totalRevenue.toLocaleString("en-AE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            sales: totalSales.toLocaleString(),
            customers: (customerCount ?? 0).toLocaleString(),
            averageOrder: `AED ${averageOrder.toLocaleString("en-AE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          });
        }

        // productCount is available for the next dashboard enhancement.
        console.log("Total products:", productCount ?? 0);
      } catch (err: unknown) {
        console.error("Dashboard data error:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard data."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardGuard>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <WelcomeProfile />
        </div>

        {/* Dashboard loading and error messages */}
        {loading && (
          <p className="mt-4 text-sm text-gray-500">
            Loading your business data...
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p className="font-semibold">Unable to load dashboard data</p>
            <p className="mt-1">{error}</p>
            <p className="mt-2">
              Check your Supabase table columns and permissions.
            </p>
          </div>
        )}

        {/* Live KPI Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value={loading ? "Loading..." : metrics.revenue}
            change="Live data"
          />

          <MetricCard
            title="Total Sales"
            value={loading ? "Loading..." : metrics.sales}
            change="Live data"
          />

          <MetricCard
            title="Total Customers"
            value={loading ? "Loading..." : metrics.customers}
            change="Live data"
          />

          <MetricCard
            title="Average Order Value"
            value={loading ? "Loading..." : metrics.averageOrder}
            change="Live data"
          />
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RevenueChart />
          <SalesChart />
        </div>

        {/* Recent Transactions */}
        <div className="mt-6">
          <RecentTransactions />
        </div>

        {/* Bottom Section */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TopProducts />
           <LowStockAlerts />

          {/* Business Insights */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div>
              <h2 className="text-lg font-semibold text-green-600">
                Business Insights
              </h2>

              <p className="mt-1 text-sm text-green-700">
                Key observations from your business data
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-sm font-medium text-gray-900">
                  Revenue overview
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Your recorded revenue is {metrics.revenue}.
                </p>
              </div>

              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-sm font-medium text-gray-900">
                  Customer overview
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  You currently have {metrics.customers} recorded customers.
                </p>
              </div>

              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-sm font-medium text-gray-900">
                  Product overview
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Your product performance is displayed in the Top Products
                  section.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardGuard>
  );
}
