
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Transaction = {
  id: string | number;
  customer_id: string | number | null;
  product: string | null;
  amount: number | string | null;
  status: string | null;
  order_date: string | null;
};

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTransactions() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          throw new Error("Please sign in to view recent transactions.");
        }

        const { data, error: salesError } = await supabase
          .from("sales")
          .select(
            "id, user_id, amount, order_date, customer_id, product, status"
          )
          .eq("user_id", user.id)
          .order("order_date", { ascending: false })
          .limit(5);

        if (salesError) throw salesError;

        if (active) {
          setTransactions((data ?? []) as Transaction[]);
        }
      } catch (err: unknown) {
        console.error("Recent transactions error:", err);

        const message =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
              ? String(err.message)
              : "An unexpected error occurred.";

        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTransactions();

    return () => {
      active = false;
    };
  }, []);

  function formatAmount(amount: number | string | null) {
    return `AED ${(Number(amount) || 0).toLocaleString("en-AE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function statusClass(status: string | null) {
    const normalized = (status || "pending").toLowerCase();

    if (normalized === "completed" || normalized === "paid") {
      return "bg-green-100 text-green-700";
    }

    if (normalized === "pending" || normalized === "processing") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (normalized === "cancelled" || normalized === "failed") {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h2 className="rounded-full bg-green-100 px-4 py-2 text-lg font-semibold">
        Recent Transactions
      </h2>

      {loading && (
        <p className="mt-6 text-sm text-gray-500">
          Loading recent transactions...
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Unable to load recent transactions</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">
          No transactions found yet.
        </p>
      )}

      {!loading && !error && transactions.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-green-600">
                <th className="pb-3 pr-4 font-medium">Customer ID</th>
                <th className="pb-3 pr-4 font-medium">Product</th>
                <th className="pb-3 pr-4 font-medium">Amount</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b last:border-0">
                  <td className="py-4 pr-4 font-medium">
                    {transaction.customer_id ?? "Walk-in"}
                  </td>

                  <td className="py-4 pr-4 text-gray-600">
                    {transaction.product || "N/A"}
                  </td>

                  <td className="whitespace-nowrap py-4 pr-4">
                    {formatAmount(transaction.amount)}
                  </td>

                  <td className="py-4 pr-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs ${statusClass(
                        transaction.status
                      )}`}
                    >
                      {transaction.status || "Pending"}
                    </span>
                  </td>

                  <td className="whitespace-nowrap py-4 text-gray-500">
                    {transaction.order_date
                      ? new Date(transaction.order_date).toLocaleDateString(
                          "en-GB"
                        )
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
