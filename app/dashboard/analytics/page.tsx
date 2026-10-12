
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type Sale = {
  amount: number;
  order_date: string;
};

type Customer = {
  id: number;
  created_at: string;
};

type ChartPoint = {
  label: string;
  revenue: number;
  customers: number;
  orders: number;
};

const periods = [
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "6 Months", days: 180 },
];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateKey(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return dateKey(new Date(value));
}

function getDateLabel(key: string) {
  const date = new Date(`${key}T12:00:00`);

  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch this user's sales and customers from Supabase
  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          throw new Error("Please log in to view your analytics.");
        }

        const [salesResult, customersResult] = await Promise.all([
          supabase
            .from("sales")
            .select("amount, order_date")
            .order("order_date", { ascending: true }),

          supabase
            .from("customers")
            .select("id, created_at")
            .order("created_at", { ascending: true }),
        ]);

        if (salesResult.error) throw salesResult.error;
        if (customersResult.error) throw customersResult.error;

        setSales((salesResult.data ?? []) as Sale[]);
        setCustomers((customersResult.data ?? []) as Customer[]);
      } catch (err) {
        console.error("Analytics loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load analytics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  // Calculate the selected date range
  const today = new Date();
  const endKey = dateKey(today);

  const startDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  startDate.setDate(startDate.getDate() - selectedPeriod + 1);

  const startKey = dateKey(startDate);

  // Filter records to the selected period
  const filteredSales = sales.filter((sale) => {
    const key = getDateKey(sale.order_date);

    return key >= startKey && key <= endKey;
  });

  const filteredCustomers = customers.filter((customer) => {
    const key = getDateKey(customer.created_at);

    return key >= startKey && key <= endKey;
  });

  // Calculate KPI values
  const totalRevenue = filteredSales.reduce(
    (total, sale) => total + Number(sale.amount),
    0
  );

  const totalOrders = filteredSales.length;
  const newCustomers = filteredCustomers.length;

  const averageOrderValue =
    totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Prepare chart data
  const chartMap = new Map<string, ChartPoint>();

  if (selectedPeriod === 180) {
    // Six-month view: group records by month
    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - i,
        1
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      chartMap.set(key, {
        label: date.toLocaleDateString("en", {
          month: "short",
          year: "2-digit",
        }),
        revenue: 0,
        customers: 0,
        orders: 0,
      });
    }

    for (const sale of filteredSales) {
      const key = getDateKey(sale.order_date).slice(0, 7);
      const point = chartMap.get(key);

      if (point) {
        point.revenue += Number(sale.amount);
        point.orders += 1;
      }
    }

    for (const customer of filteredCustomers) {
      const key = getDateKey(customer.created_at).slice(0, 7);
      const point = chartMap.get(key);

      if (point) point.customers += 1;
    }
  } else {
    // Seven-day and 30-day views: group records by day
    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const key = dateKey(date);

      chartMap.set(key, {
        label: getDateLabel(key),
        revenue: 0,
        customers: 0,
        orders: 0,
      });
    }

    for (const sale of filteredSales) {
      const key = getDateKey(sale.order_date);
      const point = chartMap.get(key);

      if (point) {
        point.revenue += Number(sale.amount);
        point.orders += 1;
      }
    }

    for (const customer of filteredCustomers) {
      const key = getDateKey(customer.created_at);
      const point = chartMap.get(key);

      if (point) point.customers += 1;
    }
  }

  const chartData = Array.from(chartMap.values());

  return (
    <main className="min-h-screen p-4 text-gray-900 sm:p-6">
      {/* Heading and date filters */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-green-600">
            Analytics
          </h1>

          <p className="mt-2 text-green-700">
            Analyze your business performance and growth.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {periods.map((period) => (
            <button
              key={period.days}
              type="button"
              onClick={() => setSelectedPeriod(period.days)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                selectedPeriod === period.days
                  ? "bg-green-900 text-white"
                  : "border border-green-200 bg-white text-green-800 hover:bg-green-50"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-green-700">
          Loading your analytics...
        </p>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-green-700">
                Total Revenue
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                AED{" "}
                {totalRevenue.toLocaleString("en-AE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Revenue for the selected period
              </p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-green-700">
                New Customers
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                {newCustomers.toLocaleString("en-AE")}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Customers added during this period
              </p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-green-700">
                Average Order Value
              </p>

              <h2 className="mt-3 text-2xl font-bold">
                AED{" "}
                {averageOrderValue.toLocaleString("en-AE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Revenue divided by number of sales records
              </p>
            </div>
          </div>

          {/* Revenue Chart */}
          <section className="mt-8 rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-green-700">
              Revenue Trend
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Sales revenue in AED
            </p>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                  />

                  <XAxis dataKey="label" />

                  <YAxis
                    tickFormatter={(value) =>
                      value >= 1000
                        ? `${value / 1000}k`
                        : String(value)
                    }
                  />

                  <Tooltip
                    formatter={(value) => [
                      `AED ${Number(value).toLocaleString("en-AE")}`,
                      "Revenue",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#236540"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Customer and Order Chart */}
          <section className="mt-6 rounded-2xl border border-green-100 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-green-700">
              Customer & Order Activity
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              New customers and sales records during the selected period
            </p>

            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                  />

                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Bar
                    dataKey="customers"
                    name="New Customers"
                    fill="#236540"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="orders"
                    name="Sales Records"
                    fill="#86b99a"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {sales.length === 0 && customers.length === 0 && (
            <p className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-800">
              Your database has no sales or customer records yet.
              Add records to see your actual analytics here.
            </p>
          )}
        </>
      )}
    </main>
  );
}
