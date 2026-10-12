
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  stock_quantity: number | null;
};

export default function LowStockAlerts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStockAlerts() {
      try {
        setLoading(true);
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          throw new Error("Please sign in to view stock alerts.");
        }

        const { data, error: productsError } = await supabase
          .from("products")
          .select("id, name, stock_quantity")
          .eq("user_id", user.id)
          .order("stock_quantity", { ascending: true });

        if (productsError) throw productsError;

        const lowStockProducts = (data ?? []).filter(
          (product) =>
            product.stock_quantity !== null &&
            product.stock_quantity <= 5
        );

        setProducts(lowStockProducts);
      } catch (err: unknown) {
        console.error("Low stock alerts error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load stock alerts."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStockAlerts();
  }, []);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="text-lg font-semibold text-gray-900">
        Low Stock Alerts
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Products with 5 or fewer items remaining.
      </p>

      {loading && (
        <p className="mt-4 text-sm text-gray-500">
          Loading stock alerts...
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium">Unable to load stock alerts</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
          All good! No low-stock products found.
        </p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="mt-4 space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {product.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Restock recommended
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                {product.stock_quantity} left
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
