
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
} from "recharts";

type RevenueData = {
  month: string;
  revenue: number;
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function RevenueChart() {
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRevenueData() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          throw new Error("Please sign in to view your revenue chart.");
        }

        const { data: sales, error: salesError } = await supabase
          .from("sales")
          .select("amount, order_date")
          .eq("user_id", user.id);

        if (salesError) throw salesError;

        const currentYear = new Date().getFullYear();

        const monthlyRevenue = monthNames.map((month) => ({
          month,
          revenue: 0,
        }));

        (sales ?? []).forEach((sale) => {
          if (!sale.order_date) return;

          const saleDate = new Date(sale.order_date);

          if (Number.isNaN(saleDate.getTime())) return;

          if (saleDate.getFullYear() !== currentYear) return;

          const monthIndex = saleDate.getMonth();

          monthlyRevenue[monthIndex].revenue += Number(sale.amount) || 0;
        });

        if (active) {
          setData(monthlyRevenue);
        }
      } catch (err: unknown) {
        console.error("Revenue chart error:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load revenue chart."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadRevenueData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h2 className="text-lg font-semibold text-green-600">
        Revenue Overview
      </h2>

      <p className="mt-1 text-sm text-green-700">
        Monthly revenue performance
      </p>

      {loading && (
        <p className="mt-6 text-sm text-gray-500">
          Loading revenue data...
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Unable to load revenue chart</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis
                tickFormatter={(value) =>
                  Number(value).toLocaleString()
                }
              />

              <Tooltip
                formatter={(value) => [
                  `AED ${Number(value).toLocaleString("en-AE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`,
                  "Revenue",
                ]}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1e573e"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
