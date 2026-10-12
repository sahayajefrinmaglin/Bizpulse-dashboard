
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type SalesData = {
  month: string;
  sales: number;
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function SalesChart() {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSalesData() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          throw new Error("Please sign in to view your sales chart.");
        }

        const { data: salesRecords, error: salesError } =
          await supabase
            .from("sales")
            .select("id, order_date")
            .eq("user_id", user.id);

        if (salesError) throw salesError;

        const currentYear = new Date().getFullYear();

        const monthlySales: SalesData[] = monthNames.map((month) => ({
          month,
          sales: 0,
        }));

        (salesRecords ?? []).forEach((record) => {
          if (!record.order_date) return;

          const saleDate = new Date(record.order_date);

          if (Number.isNaN(saleDate.getTime())) return;

          if (saleDate.getFullYear() !== currentYear) return;

          monthlySales[saleDate.getMonth()].sales += 1;
        });

        if (active) {
          setData(monthlySales);
        }
      } catch (err: unknown) {
        console.error("Sales chart error:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load sales chart."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSalesData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h2 className="text-lg font-semibold text-green-600">
        Sales Overview
      </h2>

      <p className="mt-1 text-sm text-green-700">
        Monthly sales performance
      </p>

      {loading && (
        <p className="mt-6 text-sm text-gray-500">
          Loading sales data...
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Unable to load sales chart</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis allowDecimals={false} />

              <Tooltip
                formatter={(value) => [
                  Number(value),
                  "Number of Sales",
                ]}
              />

              <Bar
                dataKey="sales"
                fill="#17673e"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
