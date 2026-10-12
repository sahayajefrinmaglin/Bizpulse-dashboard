
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type TopProduct = {
  name: string;
  sales: number;
  revenue: number;
};

export default function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadTopProducts() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          throw new Error("Please sign in to view top products.");
        }

        // Get the current user's sales records.
        const { data: salesRecords, error: salesError } =
          await supabase
            .from("sales")
            .select("product, amount")
            .eq("user_id", user.id);

        if (salesError) throw salesError;

        // Group sales by product name.
        const productSummary: Record<
          string,
          { sales: number; revenue: number }
        > = {};

        (salesRecords ?? []).forEach((sale) => {
          const productName = sale.product?.trim();

          if (!productName) return;

          if (!productSummary[productName]) {
            productSummary[productName] = {
              sales: 0,
              revenue: 0,
            };
          }

          productSummary[productName].sales += 1;
          productSummary[productName].revenue += Number(sale.amount) || 0;
        });

        const sortedProducts = Object.entries(productSummary)
          .map(([name, values]) => ({
            name,
            sales: values.sales,
            revenue: values.revenue,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 4);

        if (active) {
          setProducts(sortedProducts);
        }
      } catch (err: unknown) {
        console.error("Top products error:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load top products."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTopProducts();

    return () => {
      active = false;
    };
  }, []);

  function formatRevenue(revenue: number) {
    return `AED ${revenue.toLocaleString("en-AE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h2 className="rounded-full bg-green-100 px-4 py-2 text-lg font-semibold text-green-600">
        Top Products
      </h2>

      <p className="mt-1 text-sm text-green-700">
        Best performing products by revenue
      </p>

      {loading && (
        <p className="mt-6 text-sm text-gray-500">
          Loading top products...
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Unable to load top products</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">
          No product sales found yet.
        </p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="mt-6 space-y-5">
          {products.map((product, index) => (
            <div
              key={product.name}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {product.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {product.sales}{" "}
                    {product.sales === 1 ? "sale" : "sales"}
                  </p>
                </div>
              </div>

              <p className="shrink-0 text-sm font-semibold text-gray-900">
                {formatRevenue(product.revenue)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
